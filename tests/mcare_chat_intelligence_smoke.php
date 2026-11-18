<?php
/** Synthetic regression examples only; they are not clinical training data. */
require_once __DIR__ . '/../inc/mcare_chat_intelligence.php';
require_once __DIR__ . '/../inc/chat_emergency_alert.php';

function check(bool $condition,string $label,array &$failures): void { if(!$condition)$failures[]=$label; }
$failures=[];$patient=['status'=>'pregnant','gestational_age_weeks'=>24,'trimester'=>2];

// A, C: Kinyarwanda variants resolve to the same structured headache concept.
$a=mcare_chat_extract_structured('Ndibwa umutwe.','rw',$patient);
$c=mcare_chat_extract_structured('Ndumva umutwe undya.','rw',$patient);
$typo=mcare_chat_extract_structured('narimeze nazi umutwe urimo kurya cyanye','rw',$patient);
check(in_array('headache',$a['symptoms'],true),'A: Ndibwa umutwe',$failures);
check(in_array('headache',$c['symptoms'],true),'C: Ndumva umutwe undya',$failures);
check(in_array('headache',$typo['symptoms'],true)&&$typo['reported_severity']==='described_as_severe','Kinyarwanda informal typo and severity',$failures);
check(in_array('severe headache',mcare_chat_emergency_cues('narimeze nazi umutwe urimo kurya cyanye'),true),'Kinyarwanda informal severe headache safety cue',$failures);

// A -> repeated B: preserve the original report, merge severity and avoid
// asking the onset question a second time.
$state=mcare_chat_initial_state($patient);$first=mcare_chat_select_reply('Ndibwa umutwe.','rw',$state);
$state=$first['state'];$repeat=mcare_chat_select_reply('Umutwe urimo kurya cyane.','rw',$state);
$saved=$repeat['state']['reported_symptoms'][0]??[];
check(($saved['name']??'')==='headache','B: normalized symptom name',$failures);
check(($saved['reported_severity']??'')==='described_as_severe','B: reported severity',$failures);
check(count($saved['original_expressions']??[])===2,'B: original expressions retained',$failures);
check(str_contains($repeat['reply'],'umutwe'),'B: explicitly acknowledges headache',$failures);
check(!str_contains($repeat['reply'],'Byatangiye ryari?'),'B: does not repeat onset question',$failures);
$danger=mcare_chat_emergency_cues('Umutwe urimo kurya cyane.');
check(in_array('severe headache',$danger,true),'B: severe headache safety cue',$failures);
$urgentQuestion=mcare_chat_urgent_followup($repeat['state'],$danger,'rw');
check(str_contains($urgentQuestion,'ububabare bukabije mu nda'),'B: moves to a different missing safety question',$failures);
$repeat['state']['asked_questions'][]='associated_abdominal_pain';
check(mcare_chat_urgent_followup($repeat['state'],$danger,'rw')==='','B: does not repeat already asked urgent questions',$failures);

// D: English severe headache is extracted and routed through urgent safety.
$d=mcare_chat_extract_structured('I am experiencing a severe headache.','en',$patient);
check(in_array('headache',$d['symptoms'],true)&&$d['reported_severity']==='described_as_severe','D: severe English headache',$failures);
check(in_array('severe headache',mcare_chat_emergency_cues('I am experiencing a severe headache.'),true),'D: urgent safety cue',$failures);

// E: correction language causes an apology and symptom acknowledgement.
$e=mcare_chat_select_reply('I am telling you that my head hurts.','en',$state);
check(($e['intent']??'')==='symptom_acknowledgement','E: correction intent',$failures);
check(str_contains($e['reply'],'I’m sorry')&&str_contains($e['reply'],'headache'),'E: apology and acknowledgement',$failures);

// F: onset follow-up attaches to the existing headache.
$f=mcare_chat_select_reply('Byatangiye ejo.','rw',$first['state']);
check(($f['state']['reported_symptoms'][0]['onset']??null)==='ejo','F: onset stored on prior symptom',$failures);
check(str_contains($f['reply'],'byatangiye ejo'),'F: contextual onset acknowledgement',$failures);

// G: worsening updates the existing symptom and is acknowledged.
$g=mcare_chat_select_reply('Ubu birushijeho gukomera.','rw',$first['state']);
check(($g['state']['reported_symptoms'][0]['worsening']??false)===true,'G: worsening stored',$failures);
check(str_contains($g['reply'],'birushijeho gukomera'),'G: worsening acknowledged',$failures);

// A follow-up asking what to do uses the already reported symptom and recent
// urgent-care guidance instead of reverting to the generic symptom prompt.
$urgentState=$repeat['state'];
$urgentState['urgent_cues']=['severe headache'];
$urgentState['urgent_guidance_given_at']=date(DATE_ATOM);
$urgentState['urgent_team_notified']=true;
$whatNext=mcare_chat_select_reply('Nonese nabigenza ate?','rw',$urgentState);
check(($whatNext['intent']??'')==='contextual_urgent_guidance','Follow-up intent uses recent urgent history',$failures);
check(str_contains($whatNext['reply'],'umutwe')&&str_contains($whatNext['reply'],'ubu'),'Follow-up answers what to do about the reported headache',$failures);
check(str_contains($whatNext['reply'],'ry’ubuzima'),'Follow-up uses existing notification state',$failures);
check(mcare_chat_has_recent_urgent_context($urgentState),'Recent urgent context is preserved for follow-ups',$failures);
check(in_array('help_request',mcare_chat_detect_intents('Should I go to the hospital now?'),true),'Hospital action question is recognized',$failures);
$repeatUrgentState=$urgentState;$repeatUrgentState['reported_symptoms'][0]['repeat_count']=2;
$repeatUrgent=mcare_chat_extract_structured('Ndimo kukubwira umutwe urimo kurya cyane','rw',$patient);
check(mcare_chat_is_duplicate_urgent_report($repeatUrgentState,$repeatUrgent,['severe headache']),'Repeated urgent correction is recognized from recent chat history',$failures);
$newDanger=mcare_chat_extract_structured('I also have blurred vision','en',$patient);
check(!mcare_chat_is_duplicate_urgent_report($repeatUrgentState,$newDanger,['blurred vision']),'A newly reported danger sign is not suppressed as a duplicate',$failures);
$firstGreeting=mcare_chat_select_reply('Mwaramutse neza','rw',mcare_chat_initial_state($patient));
$repeatGreetingState=$firstGreeting['state'];$repeatGreetingState['last_reply_intent']=$firstGreeting['intent'];
$repeatGreeting=mcare_chat_select_reply('Mwaramutse neza','rw',$repeatGreetingState);
check(str_contains($repeatGreeting['reply'],'nanone'),'Repeated greeting gets a non-identical contextual response',$failures);

$negative=mcare_chat_extract_structured('I do not have blurred vision.','en',$patient);
check(in_array('vision_changes',$negative['negated_symptoms'],true)&&!in_array('vision_changes',$negative['symptoms'],true),'Negative symptom is recorded as denied',$failures);
check(!in_array('vision changes',mcare_chat_emergency_cues('I do not have blurred vision.'),true),'Negated warning sign does not trigger an alert',$failures);

if($failures){fwrite(STDERR,"Failed: ".implode(', ',$failures).PHP_EOL);exit(1);}
echo 'M-CARE symptom, correction and context regressions passed (synthetic examples only).'.PHP_EOL;
