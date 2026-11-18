<?php
require_once __DIR__ . '/inc/connect.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/chat_emergency_alert.php';
require_once __DIR__ . '/inc/mcare_chat_intelligence.php';
require_once __DIR__ . '/inc/mcare_llm.php';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store, private');
if ((int)$_SESSION['log_role'] !== 5) { http_response_code(403); echo json_encode(['error'=>'Unauthorized']); exit; }
$q=$db->prepare('SELECT u.mother_id,m.preferred_language,m.chw_id,m.facility_id FROM tbl_users u JOIN tbl_mothers m ON m.mother_id=u.mother_id WHERE u.u_id=? AND u.is_active=1 AND m.is_active=1');
$q->execute([(int)$_SESSION['u_id']]);$mother=$q->fetch(PDO::FETCH_ASSOC);
if(!$mother){http_response_code(403);echo json_encode(['error'=>'No active maternal profile is linked.']);exit;}
if($_SERVER['REQUEST_METHOD']!=='POST'){http_response_code(405);echo json_encode(['error'=>'Method not allowed']);exit;}
$csrf=(string)($_POST['_csrf']??'');$expectedCsrf=(string)($_SESSION['csrf_token']??'');if($expectedCsrf===''||!hash_equals($expectedCsrf,$csrf)){http_response_code(403);echo json_encode(['error'=>'Invalid request token.']);exit;}
if(($_POST['reset_conversation']??'')==='1'){mcare_chat_close_conversation($db,(int)($_SESSION['mcare_chat_conversation_id']??0),(int)$mother['mother_id'],(int)$_SESSION['u_id']);echo json_encode(['reset'=>true]);exit;}
$question=trim((string)($_POST['question']??''));$topic=(string)($_POST['topic']??'education');$language=$mother['preferred_language']==='rw'?'rw':'en';
if($question===''||mb_strlen($question)>2000){http_response_code(422);echo json_encode(['error'=>$language==='rw'?'Andika ikibazo kigufi (inyuguti zitarenga 2,000).':'Enter a short question (up to 2,000 characters).']);exit;}
$allowedTopics=['education','nutrition','anc','postpartum','appointments','symptoms'];if(!in_array($topic,$allowedTopics,true))$topic='education';
$conversation=mcare_chat_open_conversation($db,(int)$mother['mother_id'],(int)$_SESSION['u_id'],$language);$conversationId=$conversation['id'];$state=$conversation['state'];
$profileContext=mcare_chat_patient_context($db,(int)$mother['mother_id']);$storedPatientContext=is_array($state['patient_context']??null)?$state['patient_context']:[];
$patientContext=$profileContext['status']!=='unknown'?$profileContext:((!empty($storedPatientContext['status'])&&$storedPatientContext['status']!=='unknown')?$storedPatientContext:$profileContext);
$state['patient_context']=$patientContext;
$extracted=mcare_chat_extract_structured($question,$language,$patientContext);$state=mcare_chat_update_state($state,$extracted);$state['language']=$language;
mcare_chat_store_turn($db,$conversationId,'mother',$question,$extracted['normalized_text'],$extracted,implode(',',$extracted['intent']));mcare_chat_save_state($db,$conversationId,$state);
$reply=function(string $text,array $sources=[],array $extra=[])use($db,$conversationId,&$state,$question,$extracted){
    $state['last_reply_intent']=$extra['intent']??($state['last_extracted']['intent'][0]??'general');
    mcare_chat_store_turn($db,$conversationId,'mcare',$text,'', ['intent'=>$state['last_reply_intent']],$state['last_reply_intent']);
    mcare_chat_save_state($db,$conversationId,$state);
    echo json_encode(array_merge(['reply'=>$text,'sources'=>$sources],$extra),JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE);exit;
};
$text=mb_strtolower($question,'UTF-8');
$emergencyCues=mcare_chat_emergency_cues($question);
if(in_array('headache',$extracted['symptoms'],true)&&$extracted['reported_severity']==='described_as_severe'&&!in_array('severe headache',$emergencyCues,true))$emergencyCues[]='severe headache';
if($emergencyCues&&mcare_chat_is_duplicate_urgent_report($state,$extracted,$emergencyCues)){
    $headache=in_array('headache',$extracted['symptoms'],true);
    if($language==='rw'){
        $message=$headache?'Ndabyumvise: umutwe uracyakubabaza cyane. Kubera ko wavuze ko ukomeye, jya ku kigo nderabuzima ubu kugira ngo bagusuzume. ':'Ndabyumvise: ibimenyetso wavuze biracyakubangamiye. Jya ku kigo nderabuzima ubu kugira ngo bagusuzume. ';
        if(!empty($state['urgent_team_notified']))$message.='Itsinda ry’ubuzima ryari ryamenyeshejwe.';
    }else{
        $message=$headache?'I understand: your severe headache is still bothering you. Please go to a health facility now for assessment. ':'I understand those symptoms are still concerning you. Please go to a health facility now for assessment. ';
        if(!empty($state['urgent_team_notified']))$message.='Your care team was already notified.';
    }
    $reply($message,[],['intent'=>'repeat_urgent_acknowledgement']);
}
if($emergencyCues){
    $state['urgent_cues']=$emergencyCues;
    $state['urgent_guidance_given_at']=date(DATE_ATOM);
    $alertCreated=false;
    $alertKey=implode('|',$emergencyCues);$existingAlertId=(int)($state['alert_ids'][$alertKey]??0);
    if($existingAlertId>0){$alertStatus=$db->prepare("SELECT status FROM tbl_alerts WHERE alert_id=? AND mother_id=?");$alertStatus->execute([$existingAlertId,(int)$mother['mother_id']]);$alertCreated=in_array($alertStatus->fetchColumn(),['open','acknowledged','escalated'],true);}
    try{if(!$alertCreated){$existingAlertId=mcare_create_chat_emergency_alert($db,$mother,(int)$mother['mother_id'],(int)$_SESSION['u_id'],$question,$emergencyCues);$alertCreated=$existingAlertId>0;if($alertCreated)$state['alert_ids'][$alertKey]=$existingAlertId;}}
    catch(Throwable $error){error_log('M-CARE chatbot alert creation failed: '.$error->getMessage());}
    $state['urgent_team_notified']=$alertCreated;
    $urgentFollowup=mcare_chat_urgent_followup($state,$emergencyCues,$language);
    if($language==='rw'){
        if(in_array('fever',$emergencyCues,true)&&count($emergencyCues)===1)$message='Mbabarira, numvise ko mufite umuriro. Umuriro igihe utwite cyangwa umaze kubyara ugomba kwitabwaho n’umukozi w’ubuzima vuba. Mujye ku kigo nderabuzima ubu kugira ngo basuzume uko mumeze. '.($urgentFollowup?:'');
        elseif(in_array('severe headache',$emergencyCues,true))$message='Mbabarira, numvise ko muribwa umutwe cyane. Umutwe ukabije igihe utwite cyangwa umaze kubyara ushobora gusaba ubuvuzi bwihuse. Mujye ku kigo nderabuzima ubu. '.($urgentFollowup?:'');
        else $message='Mbabarira, numvise ibimenyetso mwavuze. Bishobora gusaba ubuvuzi bwihuse. Mujye ku kigo nderabuzima cyangwa kwa muganga ubu, cyangwa mukoreshe inzira y’ubutabazi yo mu gace murimo.';
        $message.=$alertCreated?' Itsinda ry’abaganga rikurikirana ubuzima bwawe ryamenyeshejwe kugira ngo risuzume ubutumwa.':' Ntitwashoboye kumenyesha itsinda ry’ubuzima muri porogaramu; hamagara ikigo nderabuzima cyangwa ubutabazi bwo mu gace urimo.';
        $reply($message.' Uyu mufasha ntasuzuma icyateye ibyo bimenyetso.',[],['alert_created'=>$alertCreated]);
    }
    if(in_array('fever',$emergencyCues,true)&&count($emergencyCues)===1)$message='I’m sorry you are feeling unwell. Fever during pregnancy or after birth should be assessed promptly by a health professional. Please go to a health facility now. '.($urgentFollowup?:'');
    elseif(in_array('severe headache',$emergencyCues,true))$message='I’m sorry you are experiencing a severe headache. It needs urgent medical assessment during pregnancy or after birth. Please go to a health facility now. '.($urgentFollowup?:'');
    else $message='I’m sorry you are feeling unwell. These symptoms may need urgent medical assessment. Please go to a health facility now or use your local emergency pathway. ';
    $message.=$alertCreated?' Your care team has been notified to review this message.':' The app could not notify your care team; contact your health facility or local emergency service now.';
    $reply($message.' This helper cannot determine the cause of your symptoms.',[],['alert_created'=>$alertCreated]);
}
// Keep medicine requests on the fixed, conservative safety path.
$medicationTerms=['medicine','medication','drug','tablet','dose','dosage','ibuprofen','aspirin','paracetamol','umuti','imiti','ibinini','igipimo cy’umuti'];
foreach($medicationTerms as $term){if(mb_strpos($text,$term)!==false){if($language==='rw')$reply('Umutekano w’umuti uterwa n’ubwoko bwawo n’uko ubuzima bwawe buhagaze. Uyu mufasha ntashobora kukubwira umuti cyangwa igipimo cyo gufata. Baza umuganga, umubyaza cyangwa umufarumasiye mbere yo gufata, guhagarika cyangwa guhindura umuti. Niba wafashe umuti utari wo cyangwa ufite ingaruka zikomeye, hita ushaka ubuvuzi.');$reply('Medicine safety depends on the specific medicine and your circumstances. This helper cannot recommend a medicine or dose. Ask your clinician, midwife, or pharmacist before starting, stopping, or changing a medicine. If you took the wrong medicine or have a serious reaction, seek urgent care.');}}
// A recent urgent episode and a follow-up asking what to do must be answered
// from the stored safety state before any optional model call.
$currentIntents=mcare_chat_detect_intents($question);
if(mcare_chat_has_recent_urgent_context($state)&&in_array('help_request',$currentIntents,true)){
    $contextReply=mcare_chat_select_reply($question,$language,$state);
    if($contextReply){$state=$contextReply['state'];$reply($contextReply['reply'],[],['handoff'=>false,'intent'=>$contextReply['intent']]);}
}
// Configured multilingual generation uses the existing conversation state and
// approved, language-matched education. Emergency routing above always runs first.
$generated=mcare_llm_generate_reply($db,$question,$language,$state,$conversationId);
if($generated){
    try{
        $db->prepare("INSERT INTO tbl_maternal_ai_events(mother_id,actor_user_id,event_type,language,model_name,model_version,input_digest,result_summary,review_status) VALUES(?,?, 'chat_response',?,?,?, ?,?, 'pending')")
            ->execute([(int)$mother['mother_id'],(int)$_SESSION['u_id'],$language,$generated['provider'],$generated['model'],hash('sha256',$question),json_encode(['sources'=>$generated['sources'],'intent'=>$extracted['intent']],JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE)]);
    }catch(Throwable $error){error_log('M-CARE response event logging failed: '.$error->getMessage());}
    $reply($generated['reply'],$generated['sources'],['handoff'=>false,'intent'=>'generated_response']);
}
// Use the stored structured symptom state to acknowledge what was reported and
// choose a new question only from currently missing information.
$conversationReply=mcare_chat_select_reply($question,$language,$state);
if($conversationReply){
    $state=$conversationReply['state'];
    $reply($conversationReply['reply'],[],['handoff'=>$conversationReply['handoff'],'intent'=>$conversationReply['intent']]);
}
// Greetings are conversational, not health questions. Handle them before the
// language analyzer and guidance lookup so they don't produce a missing-content reply.
$normalizedGreeting=trim(preg_replace('/[\p{P}\p{S}\s]+/u',' ',$text));
$greetings=['hi','hello','hey','good morning','good afternoon','good evening','muraho','muraho neza','mwiriwe','mwiriwe neza','mwaramutse','mwaramutse neza','bite','amakuru','amakuru yawe'];
if(in_array($normalizedGreeting,$greetings,true)){
    if(in_array($normalizedGreeting,['amakuru','amakuru yawe'],true)){
        if($language==='rw')$reply('Murakoze kubaza! Niteguye kubafasha. Ni iki mwifuza kumenya ku buzima bwanyu?');
        $reply('Thanks for asking! I’m ready to help. What would you like to know about maternal health?');
    }
    if($language==='rw'){
        $greetingReply=mb_strpos($normalizedGreeting,'mwaramutse')===0?'Mwaramutse neza!':(mb_strpos($normalizedGreeting,'mwiriwe')===0?'Mwiriwe neza!':'Muraho neza!');
        $reply($greetingReply.' Ni iki mwifuza kumenya ku gutwita cyangwa kwiyitaho nyuma yo kubyara?');
    }
    $reply('Hello! What would you like to know about pregnancy or postpartum care?');
}
$thanks=['thank you','thanks','thank you very much','murakoze','murakoze cyane','urakoze','urakoze cyane'];
if(in_array($normalizedGreeting,$thanks,true)){
    if($language==='rw')$reply('Murakaza neza! Niba hari ikindi mwifuza kumenya, mukomeze mubaze.');
    $reply('You’re welcome. If you have another question, feel free to ask.');
}
// Optional private language service. Emergency wording above remains immediate and
// independent of this network call; service output only routes the mother to care.
$languageServiceUrl=rtrim((string)(getenv('MCARE_AI_SERVICE_URL')?:''),'/');
$languageServiceToken=(string)(getenv('MCARE_AI_SERVICE_TOKEN')?:'');
if($languageServiceUrl!==''&&$languageServiceToken!==''&&function_exists('curl_init')){
    $ch=curl_init($languageServiceUrl.'/v1/analyze');
    curl_setopt_array($ch,[
        CURLOPT_POST=>true,
        CURLOPT_POSTFIELDS=>json_encode(['text'=>$question,'language_hint'=>$language],JSON_UNESCAPED_UNICODE|JSON_INVALID_UTF8_SUBSTITUTE),
        CURLOPT_HTTPHEADER=>['Content-Type: application/json','Authorization: Bearer '.$languageServiceToken],
        CURLOPT_RETURNTRANSFER=>true,
        CURLOPT_CONNECTTIMEOUT_MS=>500,
        CURLOPT_TIMEOUT_MS=>1500,
        CURLOPT_NOSIGNAL=>1,
    ]);
    $analysisBody=curl_exec($ch);$analysisStatus=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE);curl_close($ch);
    if(is_string($analysisBody)&&$analysisStatus>=200&&$analysisStatus<300){
        $analysis=json_decode($analysisBody,true);
        if(is_array($analysis)){
            if(!empty($analysis['potential_warning_signals'])||!empty($analysis['symptom_cues'])||!empty($analysis['clarification_needed'])){
                if($language==='rw')$reply('Ndabona ushobora kuba uvuga ikimenyetso cy’ubuzima, ariko sinshobora kucyemeza cyangwa kugisuzuma. Tanga raporo y’ibimenyetso cyangwa wandikire umukozi w’ubuzima kugira ngo agufashe. Niba wumva urembye, hita ushaka ubuvuzi.');
                $reply('I may have recognized a health concern, but this language module is not clinically validated and cannot assess it. Submit a symptom report or message your care team. If you feel seriously unwell, seek care now.');
            }
        }
    }
}
$medicationTerms=['medicine','medication','drug','tablet','dose','dosage','ibuprofen','aspirin','paracetamol','umuti','imiti','ibinini','igipimo cy’umuti'];
foreach($medicationTerms as $term){if(mb_strpos($text,$term)!==false){if($language==='rw')$reply('Umutekano w’umuti uterwa n’ubwoko bwawo n’uko ubuzima bwawe buhagaze. Uyu mufasha ntashobora kukubwira umuti cyangwa igipimo cyo gufata. Baza umuganga, umubyaza cyangwa umufarumasiye mbere yo gufata, guhagarika cyangwa guhindura umuti. Niba wafashe umuti utari wo cyangwa ufite ingaruka zikomeye, hita ushaka ubuvuzi.');$reply('Medicine safety depends on the specific medicine and your circumstances. This helper cannot recommend a medicine or dose. Ask your clinician, midwife, or pharmacist before starting, stopping, or changing a medicine. If you took the wrong medicine or have a serious reaction, seek urgent care.');}}
$symptomTerms=['pain','headache','fever','bleeding','dizzy','vomit','swelling','vision','uribwa','ububabare','umutwe','umuriro','kuva amaraso','kuruka','kubyimba','amaso'];
if($topic==='symptoms'){if($language==='rw')$reply('Sinshobora gusuzuma ibimenyetso. Ohereza ikibazo mu kiganiro n’umukozi w’ubuzima, cyangwa utange raporo y’ibimenyetso kugira ngo itsinda ry’ubuzima ribisuzume. Niba wumva urembye, hita ujya kwivuza.');$reply('I cannot assess symptoms. Send your concern in the live chat with your care team or submit a symptom report for professional review. If you feel seriously unwell, seek care now.');}
foreach($symptomTerms as $term){if(mb_strpos($text,$term)!==false){if($language==='rw')$reply('Ikibazo kijyanye n’ubuzima kigomba gusuzumwa n’umukozi w’ubuzima. Ohereza ubutumwa mu kiganiro kizima cyangwa utange raporo y’ibimenyetso. Niba wumva urembye, hita ujya kwivuza.');$reply('A health concern needs review by a health professional. Use the live care-team chat or submit a symptom report. If you feel seriously unwell, seek care now.');}}

$preg=$db->prepare("SELECT pregnancy_status,lmp,edd FROM tbl_pregnancies WHERE mother_id=? ORDER BY (pregnancy_status='active') DESC,created_at DESC LIMIT 1");$preg->execute([(int)$mother['mother_id']]);$pregnancy=$preg->fetch(PDO::FETCH_ASSOC);$trimester='all';$postpartum=false;
if($pregnancy&&$pregnancy['pregnancy_status']==='active'){$days=null;if(!empty($pregnancy['lmp']))$days=(int)(new DateTimeImmutable($pregnancy['lmp']))->diff(new DateTimeImmutable('today'))->format('%r%a');elseif(!empty($pregnancy['edd']))$days=280-(int)(new DateTimeImmutable('today'))->diff(new DateTimeImmutable($pregnancy['edd']))->format('%r%a');if($days!==null&&$days>=0){$week=intdiv($days,7);$trimester=$week<14?'1':($week<28?'2':'3');}}elseif($pregnancy&&$pregnancy['pregnancy_status']==='delivered')$postpartum=true;
$rows=[];$languageTables=[['tbl_education_content','category'],['tbl_nutrition_content','content_type']];
foreach($languageTables as [$table,$categoryColumn]){$stmt=$db->prepare("SELECT title,content_body,$categoryColumn category,trimester,language FROM $table WHERE is_active=1 AND language=? ORDER BY created_at DESC LIMIT 250");$stmt->execute([$language]);foreach($stmt->fetchAll(PDO::FETCH_ASSOC) as $row)$rows[]=$row;}
if(!$rows){if($language==='rw')$reply('Nta nyigisho zemejwe ziriho muri uru rurimi ubu. Ushobora kubaza umukozi w’ubuzima mu kiganiro kizima.');$reply('There is no published guidance in your selected language yet. Please ask a care-team professional in live chat.');}
$questionWords=preg_split('/[^\p{L}\p{N}]+/u',$text,-1,PREG_SPLIT_NO_EMPTY);$stop=['the','and','for','with','what','when','where','how','does','should','can','you','your','about','from','are','is','have','has','need','want','tell','me','please','this','that','ibi','iki','ikihe','nka','kuki','ryari','hehe','nigute','ese','mbese','nkeneye','ndashaka','ndashobora','yaba','ni','mu','ku','wa','ya','na','ko','aba','iki','iki'];$tokens=array_values(array_unique(array_filter($questionWords,fn($w)=>mb_strlen($w,'UTF-8')>=3&&!in_array($w,$stop,true))));
// Expand common education topics across English and Kinyarwanda so a question
// can find relevant content even when the mother writes in the other language.
// These are retrieval aliases only; answers still come from published content.
$topicTerms=['nutrition'=>['nutrition','food','eat','meal','diet','amafunguro','ibiryo','kurya','imirire'],'anc'=>['anc','antenatal','pregnancy','pregnant','trimester','inda','atwite','gutwita'],'postpartum'=>['postpartum','after','birth','delivery','breastfeed','postnatal','nyuma','kubyara','konka','konsa'],'appointments'=>['appointment','visit','schedule','clinic','gahunda','igihe','gusura','ikigo','nderabuzima']];
$bilingualAliases=[
    'anc'=>['pregnancy','pregnant','pregnancy care','gutwita','atwite','inda','antenatal','anc','prenatal','clinic visit','gusura ikigo nderabuzima','kwisuzumisha','gusura muganga'],
    'nutrition'=>['nutrition','food','eat','meals','diet','imirire','ibiryo','kurya','amafunguro'],
    'postpartum'=>['postpartum','postnatal','after birth','after delivery','nyuma yo kubyara','maze kubyara','breastfeeding','breastfeed','konsa','konka','kwonsa'],
    'appointments'=>['appointment','schedule','next visit','gahunda','igihe cyo gusura','itariki yo kwisuzumisha'],
];
$inferredTopics=[];
foreach($bilingualAliases as $aliasTopic=>$aliasGroup){$matched=false;foreach($aliasGroup as $alias){if(mb_strpos($text,$alias)!==false){$matched=true;break;}}if($matched){$inferredTopics[]=$aliasTopic;foreach($aliasGroup as $alias){foreach(preg_split('/[^\p{L}\p{N}]+/u',mb_strtolower($alias,'UTF-8'),-1,PREG_SPLIT_NO_EMPTY) as $word){if(mb_strlen($word,'UTF-8')>=3)$tokens[]=$word;}}}}
$tokens=array_values(array_unique($tokens));
$best=null;$bestScore=0;$bestQueryMatches=0;
foreach($rows as $row){$hay=mb_strtolower($row['title'].' '.$row['content_body'].' '.$row['category'],'UTF-8');$title=mb_strtolower($row['title'],'UTF-8');$score=0;$queryMatches=0;foreach($tokens as $token){if(mb_strpos($title,$token)!==false){$score+=4;$queryMatches++;}elseif(mb_strpos($hay,$token)!==false){$score++;$queryMatches++;}}$scoreTopics=$inferredTopics;if(isset($topicTerms[$topic]))$scoreTopics[]=$topic;foreach(array_unique($scoreTopics) as $scoreTopic)if(isset($topicTerms[$scoreTopic]))foreach($topicTerms[$scoreTopic] as $term)if(mb_strpos($hay,$term)!==false){$score+=2;break;}if($pregnancy&&$pregnancy['pregnancy_status']==='active'&&in_array((string)$row['trimester'],[$trimester,'all',''],true))$score++;if($postpartum&&preg_match('/post.?natal|postpartum|after.?birth/i',(string)$row['category']))$score+=2;if($queryMatches>0&&$score>$bestScore){$bestQueryMatches=$queryMatches;$bestScore=$score;$best=$row;}}
if($best===null||$bestScore<2){if($language==='rw')$reply('Sinabonye inyigisho ihuye n’ikibazo cyawe mu byo itsinda ry’ubuzima ryashyizeho. Andikira umukozi w’ubuzima mu kiganiro kizima. Ubu bufasha bugaragaza inyigisho gusa; ntibusuzuma indwara.');$reply('I could not find a matching answer in the guidance published by your care team. Ask a professional in live chat. This helper only shares published guidance and does not diagnose.');}
$content=trim((string)$best['content_body']);if(mb_strlen($content,'UTF-8')>2200)$content=mb_substr($content,0,2200,'UTF-8').'…';
$prefix=$language==='rw'?'Dore inyigisho yatangajwe n’itsinda ry’ubuzima. Niba ikibazo kijyanye n’ibimenyetso cyangwa uko wiyumva, saba umukozi w’ubuzima kugusuzuma:':'Here is guidance published by your care team. If your question is about symptoms or how you feel, ask a health professional to assess you:';
$reply($prefix."\n\n".$content,[$best['title']]);
