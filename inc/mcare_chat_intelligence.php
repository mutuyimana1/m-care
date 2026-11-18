<?php
/** Bilingual symptom/context support for the existing maternal chatbot. */

function mcare_chat_normalize(string $text): string
{
    $text=mb_strtolower(trim($text),'UTF-8');
    $text=strtr($text,['’'=>"'",'`'=>"'"]);
    $text=preg_replace('/[\p{P}\p{S}]+/u',' ',$text)??$text;
    return trim(preg_replace('/\s+/u',' ',$text)??$text);
}

function mcare_chat_normalize_informal(string $text): string
{
    $text=mcare_chat_normalize($text);
    $corrections=[
        'murafpsaha'=>'murafasha','ntago meze neza'=>'ntameze neza','cyanye'=>'cyane','cyaneee'=>'cyane',
        'cyeane'=>'cyane','cane'=>'cyane','urimo kurya'=>'urimo kurya','ndashaka muganga'=>'ndashaka muganga',
    ];
    foreach($corrections as $from=>$to)$text=preg_replace('/(?<![\p{L}\p{N}])'.preg_quote($from,'/').'(?![\p{L}\p{N}])/u',$to,$text)??$text;
    return $text;
}

function mcare_chat_has_phrase(string $text,array $phrases): bool
{
    foreach($phrases as $phrase){$phrase=mcare_chat_normalize_informal($phrase);if($phrase!==''&&preg_match('/(?<![\p{L}\p{N}])'.preg_quote($phrase,'/').'(?![\p{L}\p{N}])/u',$text))return true;}
    return false;
}

function mcare_chat_phrase_is_negated(string $text,string $phrase): bool
{
    $text=mcare_chat_normalize_informal($text);$phrase=mcare_chat_normalize_informal($phrase);$pattern='/(?<![\p{L}\p{N}])'.preg_quote($phrase,'/').'(?![\p{L}\p{N}])/u';
    if(!preg_match($pattern,$text,$match,PREG_OFFSET_CAPTURE))return false;
    if(preg_match('/^(?:sinabona|ntabwo|sinumva|sindwaye|simfite)\b/u',$phrase))return true;
    $before=substr($text,0,$match[0][1]);
    return (bool)preg_match('/(?:^|\s)(?:no|not|never|without|dont|don t|do not|does not|did not|nta|ntabwo|sinabona|simbona|sinumva|simfite|sindwaye)(?:\s+\p{L}+[\p{L}\p{M}]*){0,4}\s*$/u',$before);
}

function mcare_chat_symptom_lexicon(): array
{
    return [
        'headache'=>['headache','head hurts','my head hurts','head is hurting','pain in my head','umutwe','ndibwa umutwe','umutwe urimo kurya','umutwe urandya','umutwe uribwa','umutwe urababara','ndumva umutwe undya','ndwaye umutwe','kuribwa umutwe'],
        'abdominal_pain'=>['abdominal pain','stomach pain','belly pain','pain in my abdomen','ububabare mu nda','ndababara mu nda','ndibwa mu nda','kuribwa mu nda','inda irandya'],
        'fever'=>['fever','high temperature','mfite umuriro','ndafite umuriro','umuriro'],
        'nausea_vomiting'=>['nausea','vomiting','vomit','kuruka','ndagira isesemi','isesemi'],
        'tiredness'=>['tired','exhausted','fatigue','ndushye','ndumva ndushye','umunaniro'],
        'breathing_difficulty'=>['trouble breathing','difficulty breathing','shortness of breath','guhumeka bigoranye','kubura umwuka'],
        'vision_changes'=>['blurred vision','vision changes','my vision is blurry','kutabona neza','kubona ibihu','mbona ibihu','ndabona ibihu','sinabona ibihu','ntabwo mbona ibihu'],
        'bleeding'=>['vaginal bleeding','bleeding','kuva amaraso','ndava amaraso'],
    ];
}

function mcare_chat_extract_symptoms(string $message): array
{
    $text=mcare_chat_normalize_informal($message);$found=[];
    foreach(mcare_chat_symptom_lexicon() as $concept=>$phrases){
        $hit=false;foreach($phrases as $phrase)if(mcare_chat_has_phrase($text,[$phrase])&&!mcare_chat_phrase_is_negated($text,$phrase)){$hit=true;break;}
        // Kinyarwanda often describes headache with a head noun and an informal
        // pain verb. Recognize the construction even when spelling varies.
        if($concept==='headache'&&!$hit&&mcare_chat_has_phrase($text,['umutwe'])&&mcare_chat_has_phrase($text,['urimo','urya','undya','urandya','uribwa','urababara','ndya','ndibwa','ndwaye']))$hit=true;
        if($hit)$found[]=$concept;
    }
    return $found;
}

function mcare_chat_update_state(array $state,array $extracted): array
{
    $state=array_replace_recursive(mcare_chat_initial_state($extracted['patient_context']??[]),$state);
    $symptomNames=$extracted['symptoms']??[];
    foreach($symptomNames as $name){
        $index=null;foreach($state['reported_symptoms'] as $i=>$reported)if(($reported['name']??'')===$name){$index=$i;break;}
        $isNew=$index===null;
        if($isNew){$state['reported_symptoms'][]=['name'=>$name,'original_text'=>$extracted['original_text'],'original_expression'=>$extracted['original_text'],'original_expressions'=>[$extracted['original_text']],'normalized_symptom'=>$name,'reported_severity'=>$extracted['reported_severity'],'onset'=>$extracted['onset'],'duration'=>$extracted['duration'],'frequency'=>$extracted['frequency'],'associated_symptoms'=>[],'worsening'=>$extracted['worsening'],'status'=>'unresolved','repeat_count'=>0];$index=array_key_last($state['reported_symptoms']);}
        else{$s=&$state['reported_symptoms'][$index];$s['repeat_count']=(int)($s['repeat_count']??0)+1;if(!in_array($extracted['original_text'],$s['original_expressions']??[],true))$s['original_expressions']=array_slice(array_merge($s['original_expressions']??[],[$extracted['original_text']]),-20);if($extracted['reported_severity'])$s['reported_severity']=$extracted['reported_severity'];if($extracted['onset'])$s['onset']=$extracted['onset'];if($extracted['duration'])$s['duration']=$extracted['duration'];if($extracted['frequency'])$s['frequency']=$extracted['frequency'];if($extracted['worsening']!==null)$s['worsening']=$extracted['worsening'];unset($s);}
    }
    if(count($symptomNames)>1)foreach($state['reported_symptoms'] as &$reported)if(in_array($reported['name'],$symptomNames,true))$reported['associated_symptoms']=array_values(array_unique(array_merge($reported['associated_symptoms']??[],array_values(array_diff($symptomNames,[$reported['name']])))));unset($reported);
    foreach($extracted['negated_symptoms']??[] as $negated){foreach($state['reported_symptoms'] as &$reported){$reported['associated_symptoms_status'][$negated]='denied';if($reported['name']===$negated)$reported['status']='denied';}unset($reported);if($negated==='vision_changes')$state['answered_questions'][]='visual_changes';}
    if($extracted['correction'])$state['correction_received']=true;
    if(!empty($extracted['pregnancy_status_reported'])){$state['patient_context']['status']=$extracted['pregnancy_status_reported'];$state['patient_context']['status_source']='user_reported';}
    if($extracted['onsetAnswer']??false){$state['answered_questions'][]='onset';foreach($state['reported_symptoms'] as &$reported)if(empty($reported['onset']))$reported['onset']=$extracted['onset'];unset($reported);}
    if($extracted['worsening']!==null)$state['answered_questions'][]='worsening';
    if($extracted['reported_severity'])$state['answered_questions'][]='severity';
    if(!empty($extracted['pregnancy_status_reported']))$state['answered_questions'][]='pregnancy_or_postpartum_status';
    if($extracted['symptoms'])$state['answered_questions'][]='symptom_details';
    $state['asked_questions']=array_values(array_unique($state['asked_questions']));$state['answered_questions']=array_values(array_unique($state['answered_questions']));
    $state['patient_context']=$extracted['patient_context']??($state['patient_context']??[]);
    $missing=[];
    foreach($state['reported_symptoms'] as $symptom){
        if(empty($symptom['onset']))$missing['onset']=true;
        if(empty($symptom['reported_severity']))$missing['severity']=true;
        if($symptom['name']==='headache'&&!in_array('visual_changes',$symptom['associated_symptoms']??[],true)&&($symptom['associated_symptoms_status']['vision_changes']??'')!=='denied')$missing['associated_symptoms']=true;
        if(empty($state['patient_context']['status'])||$state['patient_context']['status']==='unknown')$missing['pregnancy_or_postpartum_status']=true;
    }
    $state['missing_information']=array_keys($missing);
    $state['last_extracted']=$extracted;
    return $state;
}

function mcare_chat_detect_intents(string $message): array
{
    $text=mcare_chat_normalize_informal($message);$intents=[];
    if(mcare_chat_has_phrase($text,['muraho','mwaramutse','mwiriwe','amakuru','hi','hello','hey']))$intents[]='greeting';
    if(mcare_chat_has_phrase($text,['ntameze neza','simeze neza','meze nabi','ndarembye','ndumva ndwaye','ndwaye','hari ikitagenda neza','something is wrong with my body','i do not feel well',"i don't feel well",'i am not feeling well','feeling unwell','i feel sick']))$intents[]='discomfort';
    if(mcare_chat_has_phrase($text,['murafasha','mufashe','muntabare','mfasha','ndabigenza ate','nabigenza nte','nabigenza ate','nkorere iki','nkore iki','nkore iki se','nkwiye kujya kwa muganga','ningende kwa muganga','what should i do','what can i do','what can i do now','should i go to hospital','should i go to the hospital','do i need to go to hospital','help me','can you help','how can you help']))$intents[]='help_request';
    if(mcare_chat_has_phrase($text,['nurse','doctor','midwife','umuforomo','umubyaza','umuganga','ndashaka kuvugana','ndashaka muganga','talk to a nurse','human help']))$intents[]='human_handoff';
    if(mcare_chat_has_phrase($text,['thank you','thanks','murakoze','urakoze']))$intents[]='thanks';
    if(mcare_chat_has_phrase($text,['nutrition','food','eat','meal','imirire','ibiryo','kurya','amafunguro']))$intents[]='nutrition_question';
    if(mcare_chat_has_phrase($text,['pregnant','pregnancy','gutwita','inda','atwite','postpartum','nyuma yo kubyara']))$intents[]='maternal_question';
    if(mcare_chat_extract_symptoms($message))$intents[]='symptom';
    return array_values(array_unique($intents));
}

function mcare_chat_patient_context(PDO $db,int $motherId): array
{
    $q=$db->prepare("SELECT pregnancy_status,lmp,edd FROM tbl_pregnancies WHERE mother_id=? ORDER BY (pregnancy_status='active') DESC,created_at DESC LIMIT 1");$q->execute([$motherId]);$row=$q->fetch(PDO::FETCH_ASSOC);
    if(!$row)return ['status'=>'unknown','gestational_age_weeks'=>null,'trimester'=>null];
    $status=$row['pregnancy_status']==='active'?'pregnant':($row['pregnancy_status']==='delivered'?'postpartum':'unknown');$weeks=null;
    if($status==='pregnant'){try{$days=!empty($row['lmp'])?(int)(new DateTimeImmutable($row['lmp']))->diff(new DateTimeImmutable('today'))->format('%r%a'):(!empty($row['edd'])?280-(int)(new DateTimeImmutable('today'))->diff(new DateTimeImmutable($row['edd']))->format('%r%a'):null);if($days!==null&&$days>=0)$weeks=intdiv($days,7);}catch(Throwable $ignored){$weeks=null;}}
    return ['status'=>$status,'gestational_age_weeks'=>$weeks,'trimester'=>$weeks===null?null:($weeks<14?1:($weeks<28?2:3))];
}

function mcare_chat_initial_state(array $patientContext=[]): array
{
    return ['version'=>1,'reported_symptoms'=>[],'asked_questions'=>[],'answered_questions'=>[],'missing_information'=>[],'pending_question'=>null,'patient_context'=>$patientContext,'correction_received'=>false,'alert_ids'=>[]];
}

function mcare_chat_extract_structured(string $message,string $language,array $patientContext=[]): array
{
    $text=mcare_chat_normalize_informal($message);$symptoms=mcare_chat_extract_symptoms($message);$severity=null;
    if(mcare_chat_has_phrase($text,['severe','very severe','really bad','extremely painful','cyane','cyane cyane','cyane pe','birakabije','ndarembye']))$severity='described_as_severe';
    elseif(mcare_chat_has_phrase($text,['mild','slight','byoroheje']))$severity='described_as_mild';
    elseif(mcare_chat_has_phrase($text,['moderate','biringaniye']))$severity='described_as_moderate';
    $onset=null;foreach(['ejo','yesterday','uyu munsi','today','last night','this morning','ejobundi'] as $time)if(mcare_chat_has_phrase($text,[$time])){$onset=$time;break;}
    $duration=null;if(preg_match('/\b(?:for|since)\s+(\d+)\s+(day|days|week|weeks|hour|hours)\b/u',$text,$m))$duration=$m[1].' '.$m[2];elseif(preg_match('/\biminsi\s+(\d+)\b/u',$text,$m))$duration=$m[1].' days';elseif(preg_match('/\bicyumweru\s+(\d+)\b/u',$text,$m))$duration=$m[1].' weeks';
    $frequency=null;if(mcare_chat_has_phrase($text,['constantly','all the time','always','buri gihe','bihoraho']))$frequency='continuous';elseif(mcare_chat_has_phrase($text,['sometimes','comes and goes','rimwe na rimwe','biraza bikagenda']))$frequency='intermittent';elseif(mcare_chat_has_phrase($text,['daily','every day','buri munsi']))$frequency='daily';
    $worsening=null;if(mcare_chat_has_phrase($text,['getting worse','worsening','worse now','birushijeho gukomera','biragenda birushaho','birushaho kuba bibi']))$worsening=true;elseif(mcare_chat_has_phrase($text,['getting better','improving','biragenda neza']))$worsening=false;
    $negatedSymptoms=[];foreach(mcare_chat_symptom_lexicon() as $concept=>$phrases)foreach($phrases as $phrase)if(mcare_chat_has_phrase($text,[$phrase])&&mcare_chat_phrase_is_negated($text,$phrase)){$negatedSymptoms[]=$concept;break;}
    $negatedSymptoms=array_values(array_unique($negatedSymptoms));
    $correction=mcare_chat_has_phrase($text,['i am telling you','i already said','i told you','listen to what i said','ndimo kukubwira','ndakubwiye','nakubwiye ko']);
    $pregnancyStatus=null;
    if(mcare_chat_has_phrase($text,['i am pregnant','i’m pregnant','currently pregnant','ndatwite','ntwite','ndi gutwita']))$pregnancyStatus='pregnant';
    elseif(mcare_chat_has_phrase($text,['i gave birth recently','recently gave birth','postpartum','maze kubyara','mbyaye vuba','maze igihe gito mbyaye']))$pregnancyStatus='postpartum';
    $onsetAnswer=$onset!==null&&mcare_chat_has_phrase($text,['byatangiye','natangiye','yatangiye','started','began','it began','it started']);
    return ['original_text'=>$message,'normalized_text'=>$text,'language'=>$language,'intent'=>mcare_chat_detect_intents($message),'symptoms'=>$symptoms,'negated_symptoms'=>$negatedSymptoms,'reported_severity'=>$severity,'onset'=>$onsetAnswer?$onset:null,'time_reference'=>$onset,'duration'=>$duration,'frequency'=>$frequency,'worsening'=>$worsening,'correction'=>$correction,'onsetAnswer'=>$onsetAnswer,'pregnancy_status_reported'=>$pregnancyStatus,'patient_context'=>$patientContext];
}

function mcare_chat_time_reference(string $normalizedText): ?string
{
    foreach(['uyu munsi','this morning','last night','since this morning','since yesterday','yesterday','ejobundi','ejo','today'] as $time)if(mcare_chat_has_phrase($normalizedText,[$time]))return $time;
    return null;
}

function mcare_chat_has_recent_urgent_context(array $state): bool
{
    $timestamp=strtotime((string)($state['urgent_guidance_given_at']??''));
    return $timestamp!==false&&$timestamp>0&&(time()-$timestamp)<=86400&&!empty($state['urgent_cues']);
}

function mcare_chat_is_duplicate_urgent_report(array $state,array $extracted,array $cues): bool
{
    if(!mcare_chat_has_recent_urgent_context($state)||empty($extracted['symptoms'])||empty($cues))return false;
    if(array_diff($cues,$state['urgent_cues']??[]))return false;
    $reported=array_column($state['reported_symptoms']??[],'name');
    foreach($extracted['symptoms'] as $symptom)if(!in_array($symptom,$reported,true))return false;
    return true;
}

function mcare_chat_next_question(array &$state,string $language): string
{
    $rw=$language==='rw';$symptoms=$state['reported_symptoms']??[];$main=$symptoms?end($symptoms):null;$name=$main['name']??'';
    if($name==='headache'&&($state['patient_context']['status']??'unknown')==='unknown'&&!in_array('pregnancy_or_postpartum_status',$state['asked_questions'],true)){$key='pregnancy_or_postpartum_status';$text=$rw?'Ese muratwite ubu cyangwa mwarabyaye vuba?':'Are you currently pregnant or have you given birth recently?';}
    elseif(empty($main['onset'])&&!in_array('onset',$state['asked_questions'],true)){$key='onset';$text=$rw?'Byatangiye ryari?':'When did it start?';}
    elseif($name==='headache'&&!in_array('visual_changes',$state['asked_questions'],true)){$key='visual_changes';$text=$rw?'Ese mubona ibihu cyangwa mwabona nabi?':'Have you noticed blurred vision or other changes in your vision?';}
    elseif(empty($main['reported_severity'])&&!in_array('severity',$state['asked_questions'],true)){$key='severity';$text=$rw?'Ububabare burakaze, buri hagati cyangwa buroroheje?':'Would you describe the pain as severe, moderate, or mild?';}
    else{$key='human_review';$text=$rw?'Murakoze kubinsobanurira. Niba bikomeje cyangwa bikabije, vugana n’umukozi w’ubuzima kugira ngo agusuzume.':'Thank you for explaining. If it continues or becomes severe, contact a health professional for an assessment.';}
    $state['asked_questions'][]=$key;$state['asked_questions']=array_values(array_unique($state['asked_questions']));$state['pending_question']=$key;
    return $text;
}

function mcare_chat_urgent_followup(array &$state,array $cues,string $language): string
{
    $rw=$language==='rw';$asked=$state['asked_questions']??[];$answered=$state['answered_questions']??[];$key=null;$question='';
    if(in_array('severe headache',$cues,true)){
        $hasVision=in_array('vision_changes',array_column($state['reported_symptoms']??[],'name'),true);
        if(!$hasVision&&!in_array('visual_changes',$asked,true)&&!in_array('visual_changes',$answered,true)){$key='visual_changes';$question=$rw?'Ese mubona ibihu cyangwa mwabona nabi?':'Are you having blurred vision or other changes in your vision?';}
        elseif(!in_array('associated_abdominal_pain',$asked,true)&&!in_array('associated_abdominal_pain',$answered,true)){$key='associated_abdominal_pain';$question=$rw?'Ese mufite n’ububabare bukabije mu nda?':'Do you also have severe abdominal pain?';}
    }elseif(in_array('fever',$cues,true)){
        $fever=null;foreach($state['reported_symptoms']??[] as $symptom)if(($symptom['name']??'')==='fever'){$fever=$symptom;break;}
        if(empty($fever['onset'])&&!in_array('onset',$asked,true)&&!in_array('onset',$answered,true)){$key='onset';$question=$rw?'Umuriro watangiye ryari?':'When did the fever start?';}
        elseif(!in_array('associated_symptoms',$asked,true)&&!in_array('associated_symptoms',$answered,true)){$key='associated_symptoms';$question=$rw?'Ese hari ibindi bimenyetso mufite?':'Are you having any other symptoms?';}
    }
    if($key!==null){$state['pending_question']=$key;$state['asked_questions'][]=$key;$state['asked_questions']=array_values(array_unique($state['asked_questions']));}
    else $state['pending_question']=null;
    return $question;
}

function mcare_chat_select_reply(string $question,string $language,array $state): ?array
{
    $text=mcare_chat_normalize_informal($question);$rw=$language==='rw';$intents=mcare_chat_detect_intents($question);$extracted=mcare_chat_extract_structured($question,$language,$state['patient_context']??[]);$candidates=[];$handoff=false;
    if(in_array('human_handoff',$intents,true)){$candidates[]=['score'=>100,'safe'=>true,'intent'=>'human_handoff','text'=>$rw?'Yego, ushobora kuvugana n’umukozi w’ubuzima. Koresha buto ya “Chat with your care team” kugira ngo utangire ikiganiro.':'Yes, you can talk with a care-team professional. Use the “Chat with your care team” button to open live chat.'];$handoff=true;}
    elseif(in_array('thanks',$intents,true)&&count($intents)===1)$candidates[]=['score'=>80,'safe'=>true,'intent'=>'thanks','text'=>$rw?'Murakaza neza. Niba hari ikindi kibahangayikishije, mwambwira.':'You’re welcome. If something else is concerning you, tell me.'];
    else{
        $state=mcare_chat_update_state($state,$extracted);
        $reported=$state['reported_symptoms']??[];$currentNames=$extracted['symptoms']??[];$existingName=null;
        foreach($currentNames as $name)foreach($reported as $item)if(($item['name']??'')===$name&&(int)($item['repeat_count']??0)>0){$existingName=$name;break 2;}
        $correction=$extracted['correction']||($existingName!==null);
        if(!empty($extracted['negated_symptoms'])){$denied=$extracted['negated_symptoms'][0];$rwLabel=['vision_changes'=>'kutabona ibihu','headache'=>'kuribwa umutwe','fever'=>'kugira umuriro','abdominal_pain'=>'ububabare bwo mu nda'][$denied]??$denied;if(($state['pending_question']??'')==='visual_changes')$state['pending_question']=null;$next=$reported?mcare_chat_next_question($state,$language):'';$ack=$rw?'Murakoze kubisobanura. Numvise ko mutarwaye '.$rwLabel.'.':'Thanks for clarifying. I understand you do not have '.$denied.'.';$candidates[]=['score'=>94,'safe'=>true,'intent'=>'negative_symptom_clarification','text'=>trim($ack.' '.$next)];}
        elseif($currentNames&&$extracted['worsening']===true){$name=$currentNames[0];$rwName=['headache'=>'umutwe','abdominal_pain'=>'ububabare bwo mu nda','fever'=>'umuriro','nausea_vomiting'=>'isesemi cyangwa kuruka','tiredness'=>'umunaniro','breathing_difficulty'=>'guhumeka bigoranye','vision_changes'=>'kutabona neza','bleeding'=>'kuva amaraso'][$name]??$name;$candidates[]=['score'=>100,'safe'=>true,'intent'=>'worsening_update','text'=>$rw?'Numvise ko '.$rwName.' birushijeho gukomera. Mbabarira. Nyamuneka vugana n’umukozi w’ubuzima vuba kugira ngo agusuzume.':'I understand your '.$name.' is getting worse. I’m sorry. Please contact a health professional promptly for assessment.'];}
        elseif($currentNames){$name=$currentNames[0];$rwName=['headache'=>'umutwe','abdominal_pain'=>'ububabare bwo mu nda','fever'=>'umuriro','nausea_vomiting'=>'isesemi cyangwa kuruka','tiredness'=>'umunaniro','breathing_difficulty'=>'guhumeka bigoranye','vision_changes'=>'kutabona neza','bleeding'=>'kuva amaraso'][$name]??$name;
            if($correction)$ack=$rw?'Mbabarira, ubu ndabyumvise: muribwa '.$rwName.'.':'I’m sorry—I understand now that you have '.$name.'.';
            else $ack=$rw?'Mbabarira ko muribwa '.$rwName.'.':'I’m sorry you’re experiencing '.$name.'.';
            $next=mcare_chat_next_question($state,$language);$state['correction_received']=$correction||($state['correction_received']??false);
            $candidates[]=['score'=>100,'safe'=>true,'intent'=>$correction?'symptom_acknowledgement':'symptom_clarification','text'=>$ack.' '.$next];
        }elseif(($state['pending_question']??'')==='pregnancy_or_postpartum_status'&&!empty($extracted['pregnancy_status_reported'])){
            $state['pending_question']=null;$next=mcare_chat_next_question($state,$language);$ack=$rw?'Murakoze kumenyesha ko '.($extracted['pregnancy_status_reported']==='pregnant'?'mutwite':'mwabyaye vuba').'.':'Thanks for telling me.';$candidates[]=['score'=>96,'safe'=>true,'intent'=>'patient_context_update','text'=>$ack.' '.$next];
        }elseif(($state['pending_question']??'')==='severity'&&$extracted['reported_severity']&&$reported){
            $lastName=$reported[array_key_last($reported)]['name']??'';foreach($state['reported_symptoms'] as &$item)if(($item['name']??'')===$lastName)$item['reported_severity']=$extracted['reported_severity'];unset($item);$state['answered_questions'][]='severity';$state['answered_questions']=array_values(array_unique($state['answered_questions']));$state['pending_question']=null;$next=mcare_chat_next_question($state,$language);$ack=$rw?'Murakoze kubisobanura.':'Thanks for clarifying.';$candidates[]=['score'=>95,'safe'=>true,'intent'=>'severity_update','text'=>$ack.' '.$next];
        }elseif($reported&&($time=mcare_chat_time_reference($text))!==null){
            $state['answered_questions'][]='onset';$state['answered_questions']=array_values(array_unique($state['answered_questions']));if(($state['pending_question']??'')==='onset')$state['pending_question']=null;
            $main=end($reported);foreach($state['reported_symptoms'] as &$item)if(($item['name']??'')===($main['name']??''))$item['onset']=$time;unset($item);$state['missing_information']=array_values(array_diff($state['missing_information']??[],['onset']));$ack=$rw?'Murakoze, numvise ko byatangiye '.$time.'.':'Thanks, I understand it started '.$time.'.';$next=mcare_chat_next_question($state,$language);$candidates[]=['score'=>95,'safe'=>true,'intent'=>'contextual_followup','text'=>$ack.' '.$next];
        }elseif($extracted['worsening']===true&&$reported){
            foreach($state['reported_symptoms'] as &$item)if(($item['name']??'')===($reported[array_key_last($reported)]['name']??''))$item['worsening']=true;unset($item);
            $state['answered_questions'][]='worsening';$state['pending_question']=null;
            $candidates[]=['score'=>100,'safe'=>true,'intent'=>'worsening_update','text'=>$rw?'Mbabarira ko birushijeho gukomera. Ibyo ndabyanditse. Nyamuneka vugana n’umukozi w’ubuzima vuba kugira ngo agufashe gusuzumwa.':'I’m sorry it has become worse. I’ve noted that. Please contact a health professional promptly for assessment.'];
        }elseif(in_array('help_request',$intents,true)&&$reported){
            $latest=$reported[array_key_last($reported)];$name=(string)($latest['name']??'');
            $labelsRw=['headache'=>'umutwe','abdominal_pain'=>'ububabare bwo mu nda','fever'=>'umuriro','nausea_vomiting'=>'isesemi cyangwa kuruka','tiredness'=>'umunaniro','breathing_difficulty'=>'guhumeka bigoranye','vision_changes'=>'kutabona neza','bleeding'=>'kuva amaraso'];
            $labelsEn=['headache'=>'headache','abdominal_pain'=>'abdominal pain','fever'=>'fever','nausea_vomiting'=>'nausea or vomiting','tiredness'=>'tiredness','breathing_difficulty'=>'difficulty breathing','vision_changes'=>'vision changes','bleeding'=>'bleeding'];
            $label=$rw?($labelsRw[$name]??$name):($labelsEn[$name]??$name);
            $urgentContext=mcare_chat_has_recent_urgent_context($state);
            if($urgentContext){
                $notified=!empty($state['urgent_team_notified']);
                $textReply=$rw?'Numvise ko ubaza icyo wakora. Kubera '.$label.' wavuze, jya ku kigo nderabuzima ubu kugira ngo bagusuzume; niba bishoboka, usabe umuntu uri hafi aguherekeze. '.($notified?'Itsinda ry’ubuzima ryamenyeshejwe.':''):'I understand you’re asking what to do about the '.$label.' you reported. Please go to a health facility now for assessment; if possible, ask someone nearby to accompany you. '.($notified?'Your care team has been notified.':'');
                $candidates[]=['score'=>110,'safe'=>true,'intent'=>'contextual_urgent_guidance','text'=>$textReply];
            }else{
                $textReply=$rw?'Numvise ko ubaza icyo wakora ku '.$label.' wavuze. Ushobora kwandikira itsinda ry’ubuzima ukoresheje “Chat with your care team” kugira ngo rikugire inama zijyanye n’uko umerewe.':'I understand you’re asking what to do about the '.$label.' you mentioned. Use “Chat with your care team” to get advice based on your situation.';
                $candidates[]=['score'=>105,'safe'=>true,'intent'=>'contextual_help','text'=>$textReply];
            }
        }elseif(in_array('discomfort',$intents,true)||in_array('help_request',$intents,true)){
            $state['asked_questions'][]='symptom_details';$state['pending_question']='symptom_details';$state['asked_questions']=array_values(array_unique($state['asked_questions']));
            $candidates[]=['score'=>90,'safe'=>true,'intent'=>'support_and_clarify','text'=>$rw?'Mbabarira kumva ko mutameze neza. Ni ibihe bimenyetso mufite?':'I’m sorry you’re not feeling well. What symptoms are you having?'];
        }elseif(in_array('greeting',$intents,true)&&count($intents)===1){
            $repeatedGreeting=($state['last_reply_intent']??'')==='greeting';
            $greeting=$rw?($repeatedGreeting?'Muraho nanone! Ni iki wifuza kumbaza?':'Mwaramutse neza! Ni iki wifuza kumbaza?'):($repeatedGreeting?'Hello again! What would you like to ask?':'Hello! What would you like to ask?');
            $candidates[]=['score'=>80,'safe'=>true,'intent'=>'greeting','text'=>$greeting];
        }
        elseif(in_array('nutrition_question',$intents,true)||in_array('maternal_question',$intents,true))$candidates[]=['score'=>65,'safe'=>true,'intent'=>'maternal_information','text'=>$rw?'Mumbwire icyo mwifuza kumenya ku gutwita, imirire cyangwa kwiyitaho nyuma yo kubyara, kugira ngo nshake inyigisho zijyanye na cyo.':'Tell me what you would like to know about pregnancy, nutrition, or postpartum care so I can look for relevant guidance.'];
    }
    if(!$candidates)return null;$safe=array_values(array_filter($candidates,static fn($candidate)=>($candidate['safe']??false)===true));if(!$safe)return null;usort($safe,static fn($a,$b)=>$b['score']<=>$a['score']);$selected=$safe[0];
    return ['reply'=>$selected['text'],'context'=>$state,'handoff'=>$handoff,'intent'=>$selected['intent'],'state'=>$state];
}

function mcare_chat_open_conversation(PDO $db,int $motherId,int $userId,string $language): array
{
    $db->exec("DELETE t FROM tbl_mcare_chat_turns t JOIN tbl_mcare_chat_conversations c ON c.conversation_id=t.conversation_id WHERE c.status='active' AND c.updated_at < DATE_SUB(NOW(),INTERVAL 30 DAY)");
    $expiredState=json_encode(mcare_chat_initial_state(),JSON_UNESCAPED_UNICODE);
    $db->prepare("UPDATE tbl_mcare_chat_conversations SET status='closed',conversation_state=? WHERE mother_id=? AND user_id=? AND status='active' AND updated_at < DATE_SUB(NOW(),INTERVAL 30 DAY)")->execute([$expiredState,$motherId,$userId]);
    $id=(int)($_SESSION['mcare_chat_conversation_id']??0);$row=null;
    if($id>0){$q=$db->prepare("SELECT * FROM tbl_mcare_chat_conversations WHERE conversation_id=? AND mother_id=? AND user_id=? AND status='active'");$q->execute([$id,$motherId,$userId]);$row=$q->fetch(PDO::FETCH_ASSOC)?:null;}
    if(!$row){$q=$db->prepare("SELECT * FROM tbl_mcare_chat_conversations WHERE mother_id=? AND user_id=? AND status='active' ORDER BY updated_at DESC LIMIT 1");$q->execute([$motherId,$userId]);$row=$q->fetch(PDO::FETCH_ASSOC)?:null;}
    if(!$row){$state=mcare_chat_initial_state(mcare_chat_patient_context($db,$motherId));$q=$db->prepare("INSERT INTO tbl_mcare_chat_conversations(mother_id,user_id,language,status,conversation_state) VALUES(?,?,?,'active',?)");$q->execute([$motherId,$userId,$language,json_encode($state,JSON_UNESCAPED_UNICODE)]);$id=(int)$db->lastInsertId();$row=['conversation_id'=>$id,'conversation_state'=>json_encode($state,JSON_UNESCAPED_UNICODE)];}
    $id=(int)$row['conversation_id'];$_SESSION['mcare_chat_conversation_id']=$id;
    $state=json_decode((string)$row['conversation_state'],true);if(!is_array($state))$state=mcare_chat_initial_state(mcare_chat_patient_context($db,$motherId));
    return ['id'=>$id,'state'=>$state];
}

function mcare_chat_save_state(PDO $db,int $conversationId,array $state): void
{
    $q=$db->prepare('UPDATE tbl_mcare_chat_conversations SET conversation_state=?,language=? WHERE conversation_id=?');$q->execute([json_encode($state,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE),$state['language']??'rw',$conversationId]);
}

function mcare_chat_store_turn(PDO $db,int $conversationId,string $speaker,string $original,string $normalized,?array $structured,?string $intent): void
{
    $q=$db->prepare('INSERT INTO tbl_mcare_chat_turns(conversation_id,speaker,original_text,normalized_text,structured_data,intent) VALUES(?,?,?,?,?,?)');$q->execute([$conversationId,$speaker,$original,$normalized?:null,$structured?json_encode($structured,JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE):null,$intent]);
    if($speaker==='mother'){$trim=$db->prepare('DELETE FROM tbl_mcare_chat_turns WHERE conversation_id=? AND turn_id NOT IN (SELECT turn_id FROM (SELECT turn_id FROM tbl_mcare_chat_turns WHERE conversation_id=? ORDER BY turn_id DESC LIMIT 100) retained)');$trim->execute([$conversationId,$conversationId]);}
}

function mcare_chat_close_conversation(PDO $db,int $conversationId,int $motherId,int $userId): void
{
    if($conversationId>0){$q=$db->prepare("UPDATE tbl_mcare_chat_conversations SET status='closed',conversation_state=? WHERE conversation_id=? AND mother_id=? AND user_id=?");$q->execute([json_encode(mcare_chat_initial_state()),$conversationId,$motherId,$userId]);$db->prepare('DELETE FROM tbl_mcare_chat_turns WHERE conversation_id=?')->execute([$conversationId]);}
    unset($_SESSION['mcare_chat_conversation_id']);
}
