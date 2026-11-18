<?php
require_once __DIR__ . '/inc/connect.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/ivr_service.php';

$role=(int)($_SESSION['log_role']??0);$userId=(int)($_SESSION['u_id']??0);
if(!in_array($role,[1,4],true))ivr_json_response(['ok'=>false,'error'=>'This development tool is available to administrators and supervisors.'],403);
$action=(string)($_GET['action']??$_POST['action']??'');
$canAccessCall=static fn(int $id):?array=>ivr_actor_scope($db,$role,$userId,$id);
$getCall=static function(int $id)use($db,$role,$userId):?array{$sql='SELECT * FROM ivr_calls WHERE ivr_call_id=? AND is_test=1';$args=[$id];if($role===4){$sql.=' AND created_by=?';$args[]=$userId;}$q=$db->prepare($sql);$q->execute($args);return $q->fetch(PDO::FETCH_ASSOC)?:null;};

try {
    if($_SERVER['REQUEST_METHOD']==='GET'){
        if($action==='call'){$call=$getCall((int)($_GET['call_id']??0));if(!$call)ivr_json_response(['ok'=>false,'error'=>'Test call not found.'],404);ivr_json_response(['ok'=>true,'call'=>ivr_call_view($db,$call)]);}
        if($action==='list'){
            $scope=$role===4?' AND c.created_by=?':'';$args=$role===4?[$userId]:[];
            $q=$db->prepare("SELECT c.ivr_call_id,c.call_uuid,c.call_source,c.caller_number,c.caller_fixture,c.language,c.state,c.current_menu,c.status,c.started_at,c.ended_at,c.duration_seconds,c.waiting_seconds,(SELECT e.event_payload FROM ivr_call_events e WHERE e.ivr_call_id=c.ivr_call_id ORDER BY e.event_id DESC LIMIT 1) last_payload FROM ivr_calls c WHERE c.is_test=1$scope ORDER BY c.started_at DESC LIMIT 100");$q->execute($args);$calls=$q->fetchAll(PDO::FETCH_ASSOC);
            foreach($calls as &$call){$data=json_decode((string)($call['last_payload']??''),true);$call['last_message']=$data['message']??null;unset($call['last_payload']);}unset($call);
            ivr_json_response(['ok'=>true,'calls'=>$calls]);
        }
        if($action==='queue'){
            $scope=$role===4?' AND c.created_by=?':'';$args=$role===4?[$userId]:[];
            $q=$db->prepare("SELECT q.queue_id,q.ivr_call_id,q.queue_status,q.queued_at,c.call_uuid,c.caller_number,c.caller_fixture,c.language,TIMESTAMPDIFF(SECOND,q.queued_at,NOW()) wait_seconds FROM ivr_call_queue q JOIN ivr_calls c ON c.ivr_call_id=q.ivr_call_id WHERE q.queue_status='waiting' AND c.is_test=1$scope ORDER BY q.queued_at");$q->execute($args);ivr_json_response(['ok'=>true,'queue'=>$q->fetchAll(PDO::FETCH_ASSOC)]);
        }
        if($action==='stats'){
            $scope=$role===4?' AND created_by=?':'';$args=$role===4?[$userId]:[];
            $q=$db->prepare("SELECT COUNT(*) total_calls,SUM(status IN ('active','queued','answered_simulated')) active_calls,SUM(status='completed') completed_calls,SUM(status='failed') failed_calls,ROUND(AVG(CASE WHEN duration_seconds IS NOT NULL THEN duration_seconds END),1) avg_duration,ROUND(AVG(CASE WHEN waiting_seconds IS NOT NULL THEN waiting_seconds END),1) avg_wait,SUM(status IN ('active','queued','answered_simulated')) concurrent_calls FROM ivr_calls WHERE is_test=1$scope");$q->execute($args);$stats=$q->fetch(PDO::FETCH_ASSOC)?:[];
            $langQ=$db->prepare("SELECT COALESCE(language,'not_selected') language,COUNT(*) total FROM ivr_calls WHERE is_test=1$scope GROUP BY language");$langQ->execute($args);$byLanguage=$langQ->fetchAll(PDO::FETCH_ASSOC);
            $menuSql="SELECT e.menu_key,COUNT(*) total FROM ivr_call_events e JOIN ivr_calls c ON c.ivr_call_id=e.ivr_call_id WHERE e.event_type='menu_selected' AND c.is_test=1".($role===4?' AND c.created_by=?':'')." GROUP BY e.menu_key ORDER BY total DESC LIMIT 8";$menuQ=$db->prepare($menuSql);$menuQ->execute($args);$byMenu=$menuQ->fetchAll(PDO::FETCH_ASSOC);
            $escSql='SELECT COUNT(*) FROM ivr_emergency_escalations x JOIN ivr_calls c ON c.ivr_call_id=x.ivr_call_id WHERE c.is_test=1'.($role===4?' AND c.created_by=?':'');$escQ=$db->prepare($escSql);$escQ->execute($args);$escalations=(int)$escQ->fetchColumn();$transferSql="SELECT COUNT(*) FROM ivr_call_queue q JOIN ivr_calls c ON c.ivr_call_id=q.ivr_call_id WHERE q.queue_status IN ('answered','rejected') AND c.is_test=1".($role===4?' AND c.created_by=?':'');$transferQ=$db->prepare($transferSql);$transferQ->execute($args);$transfers=(int)$transferQ->fetchColumn();
            ivr_json_response(['ok'=>true,'stats'=>$stats,'by_language'=>$byLanguage,'by_menu'=>$byMenu,'test_escalations'=>$escalations,'simulated_transfers'=>$transfers,'capacity'=>(int)ivr_config($db,'max_concurrent_calls','10')]);
        }
        if($action==='settings'){
            $prompts=$db->query('SELECT prompt_id,prompt_key,language,prompt_text,audio_path,is_active,updated_at FROM ivr_voice_prompts ORDER BY prompt_key,language')->fetchAll(PDO::FETCH_ASSOC);
            $menus=$db->query('SELECT option_id,menu_key,language,digit,option_label,action_key,is_active,sort_order FROM ivr_menu_options ORDER BY menu_key,language,sort_order')->fetchAll(PDO::FETCH_ASSOC);
            $config=['max_concurrent_calls'=>(int)ivr_config($db,'max_concurrent_calls','10'),'speech_test_enabled'=>ivr_config($db,'speech_test_enabled','1')==='1'];
            ivr_json_response(['ok'=>true,'config'=>$config,'prompts'=>$prompts,'menus'=>$menus]);
        }
        ivr_json_response(['ok'=>false,'error'=>'Unknown IVR API action.'],404);
    }

    if($_SERVER['REQUEST_METHOD']!=='POST')ivr_json_response(['ok'=>false,'error'=>'Method not allowed.'],405);
    $csrf=(string)($_POST['_csrf']??'');if(!hash_equals((string)($_SESSION['csrf_token']??''),$csrf))ivr_json_response(['ok'=>false,'error'=>'Your form session expired. Reload the page and try again.'],403);

    if($action==='start'){
        $fixture=(string)($_POST['fixture']??'synthetic_anonymous');
        $fixtures=['synthetic_anonymous','synthetic_pregnancy_1','synthetic_pregnancy_2','synthetic_pregnancy_3'];
        if(!in_array($fixture,$fixtures,true))ivr_json_response(['ok'=>false,'error'=>'Select a listed synthetic test caller.'],422);
        $callerRaw=trim((string)($_POST['caller_number']??''));
        // Accept local phone numbers (digits, optional leading +, spaces/hyphens stripped) or TEST- prefixed IDs.
        $callerDigits=preg_replace('/[\s\-]/','',$callerRaw);
        if(preg_match('/^\+?[0-9]{7,15}$/',$callerDigits)){
            // Normalise to digits only, prefix SIM- so the DB value is clearly a local dev number, not a live trunk.
            $caller='SIM-'.ltrim($callerDigits,'+');
        }else{
            $caller=strtoupper($callerRaw);
            if(!preg_match('/^TEST-[A-Z0-9-]{4,24}$/',$caller))ivr_json_response(['ok'=>false,'error'=>'Enter a local phone number (e.g. 0788708084) or a TEST- prefixed caller ID.'],422);
        }
        $db->beginTransaction();
        $capQ=$db->prepare("SELECT config_value FROM ivr_test_config WHERE config_key='max_concurrent_calls' FOR UPDATE");$capQ->execute();$cap=(int)($capQ->fetchColumn()?:10);$cap=max(1,min(100,$cap));
        $countQ=$db->query("SELECT COUNT(*) FROM ivr_calls WHERE is_test=1 AND status IN ('active','queued','answered_simulated')");$active=(int)$countQ->fetchColumn();
        if($active >= $cap){$db->rollBack();ivr_json_response(['ok'=>false,'error'=>'The configured concurrent test-call limit has been reached.'],429);}
        $uuid=generate_uuid();$insert=$db->prepare("INSERT INTO ivr_calls(call_uuid,call_source,is_test,caller_number,caller_fixture,state,current_menu,status,created_by) VALUES(?,'web_simulator',1,?,?,'welcome','welcome','active',?)");$insert->execute([$uuid,$caller,$fixture,$userId]);$callId=(int)$db->lastInsertId();
        ivr_log_event($db,$callId,'call_started','welcome',$caller,['message'=>'TEST CALL started. This is a browser simulation, not a telephone call.']);$db->commit();
        $call=$getCall($callId);ivr_json_response(['ok'=>true,'call'=>ivr_call_view($db,$call)]);
    }

    if($action==='step'){
        $callId=(int)($_POST['call_id']??0);$digit=(string)($_POST['digit']??'');if(!preg_match('/^[0-9*#]$/',$digit))ivr_json_response(['ok'=>false,'error'=>'Enter one keypad digit.'],422);
        $db->beginTransaction();$find=$db->prepare("SELECT * FROM ivr_calls WHERE ivr_call_id=? AND is_test=1 AND call_source='web_simulator'".($role===4?' AND created_by=?':'').' FOR UPDATE');$args=[$callId];if($role===4)$args[]=$userId;$find->execute($args);$call=$find->fetch(PDO::FETCH_ASSOC);
        if(!$call){$db->rollBack();ivr_json_response(['ok'=>false,'error'=>'Test call not found.'],404);}if(!in_array($call['status'],['active','queued','answered_simulated'],true)){$db->rollBack();ivr_json_response(['ok'=>false,'error'=>'This test call has ended.'],409);}
        $language=in_array($call['language'],['en','rw'],true)?$call['language']:'en';$menu=$call['current_menu'];$lookupMenu=$menu==='welcome'?'welcome':$menu;
        $optionQ=$db->prepare('SELECT action_key,option_label FROM ivr_menu_options WHERE menu_key=? AND language=? AND digit=? AND is_active=1');$optionQ->execute([$lookupMenu,$language,$digit]);$option=$optionQ->fetch(PDO::FETCH_ASSOC);
        if(!$option&&$menu==='welcome'){$optionQ->execute([$lookupMenu,'en',$digit]);$option=$optionQ->fetch(PDO::FETCH_ASSOC);}
        $message='';$newState=$call['state'];$newMenu=$menu;$newStatus=$call['status'];$newLanguage=$call['language'];$eventType='menu_input';$eventValue=$digit;$payload=[];
        if(!$option){$message=ivr_prompt($db,'invalid',$language,'That option is not available. Please try again.')['prompt_text'];$eventType='invalid_input';}
        else{
            $key=$option['action_key'];$eventType='menu_selected';$eventValue=$key;
            if($key==='set_rw'||$key==='set_en'){$newLanguage=$key==='set_rw'?'rw':'en';$newMenu='main';$newState='main_menu';$message=ivr_prompt($db,'main',$newLanguage,'Select a menu option.')['prompt_text'];}
            elseif($key==='repeat'){$newMenu='main';$newState='main_menu';$message=ivr_prompt($db,'main',$language,'Select a menu option.')['prompt_text'];}
            elseif($key==='hangup'){$db->prepare("UPDATE ivr_call_queue SET queue_status='cancelled',resolved_at=NOW() WHERE ivr_call_id=? AND queue_status='waiting'")->execute([$callId]);$newState='completed';$newStatus='completed';$newMenu='ended';$eventType='call_ended';$message=ivr_prompt($db,'ended',$language,'The test call has ended.')['prompt_text'];}
            elseif($key==='pregnancy_info'){$newState='education';$newMenu='education';$message=ivr_prompt($db,'education',$language,'Select pregnancy stage information.')['prompt_text'];}
            elseif($key==='emergency'){$newState='emergency';$newMenu='emergency';$message=ivr_prompt($db,'emergency',$language,'Seek immediate professional medical care if this may be an emergency.')['prompt_text'];}
            elseif($key==='nutrition'){$items=ivr_get_education($db,$language,null,'nutrition');$newState='content';$newMenu='main';$eventType='content_retrieved';$message=$items?implode("\n\n",array_map(static fn($item)=>$item['title']."\n".$item['content_body'],$items)):($language==='rw'?'Nta nyigisho zemewe ziri muri sisitemu muri uru rurimi.':'No approved nutrition education is currently published in this language.');}
            elseif($key==='appointment'||$key==='medication'){$type=$key==='appointment'?'appointment':'medication_reminder';$infoQ=$db->prepare('SELECT label_en,label_rw,details_en,details_rw,scheduled_at FROM ivr_test_fixture_data WHERE fixture_key=? AND data_type=?');$infoQ->execute([$call['caller_fixture'],$type]);$info=$infoQ->fetch(PDO::FETCH_ASSOC);$newState='content';$newMenu='main';$eventType=$key.'_lookup';if($info){$label=$language==='rw'?$info['label_rw']:$info['label_en'];$details=$language==='rw'?$info['details_rw']:$info['details_en'];$date=$info['scheduled_at']?date('d M Y H:i',strtotime($info['scheduled_at'])):'';$message=trim($label.($date?' · '.$date:'')."\n".$details);}else{$message=$language==='rw'?'Nta makuru y’ikigeragezo abitswe kuri iyi serivisi. Nta makuru y’umuntu nyawe yakoreshejwe.':'No synthetic test information is configured for this option. No real patient record was accessed.';}}
            elseif($key==='queue'){$db->prepare("INSERT INTO ivr_call_queue(ivr_call_id,queue_status) VALUES(?,'waiting') ON DUPLICATE KEY UPDATE queue_status='waiting',queued_at=CURRENT_TIMESTAMP,resolved_at=NULL")->execute([$callId]);$newState='queue_waiting';$newMenu='main';$newStatus='queued';$eventType='queue_entered';$message=ivr_prompt($db,'queue',$language,'The test call is waiting in a simulated queue.')['prompt_text'];}
            elseif($key==='back'){$newState='main_menu';$newMenu='main';$newStatus='active';$message=ivr_prompt($db,'main',$language,'Select a menu option.')['prompt_text'];}
            elseif($key==='escalate_test'){$db->prepare("INSERT INTO ivr_emergency_escalations(ivr_call_id,signal_key,escalation_status) VALUES(?,'caller_requested_test_escalation','recorded_test')")->execute([$callId]);$newState='emergency_ack';$newMenu='emergency';$eventType='emergency_test_escalation';$message=ivr_prompt($db,'emergency_instruction',$language,'Seek immediate professional medical care now.')['prompt_text'].' '.($language==='rw'?'Ikigeragezo cyonyine cyanditswe; nta butumwa bw’ubuzima bwoherejwe.':'A test event was recorded only; no health worker was notified.');}
            elseif(preg_match('/^trimester_(1|2|3|all)$/',$key,$match)){$trimester=$match[1]==='all'?null:(int)$match[1];$items=ivr_get_education($db,$language,$trimester,'pregnancy');$newState='content';$newMenu='main';$eventType='content_retrieved';$message=$items?implode("\n\n",array_map(static fn($item)=>$item['title']."\n".$item['content_body'],$items)):($language==='rw'?'Nta nyigisho zemewe ziri muri sisitemu muri uru rurimi.':'No approved pregnancy education is currently published for this language and stage.');}
            elseif($newState==='queue_waiting'||$newState==='queue_answered'){$message=$language==='rw'?'Ikiganiro cy’abakozi cy’ikigeragezo kiracyakurikiranwa.':'This simulated connection is managed from the test dashboard.';}
        }
        if($newState==='completed'){$db->prepare("UPDATE ivr_calls SET state=?,current_menu=?,status=?,last_input=?,ended_at=NOW(),duration_seconds=TIMESTAMPDIFF(SECOND,started_at,NOW()) WHERE ivr_call_id=?")->execute([$newState,$newMenu,$newStatus,$digit,$callId]);}
        else{$db->prepare('UPDATE ivr_calls SET state=?,current_menu=?,status=?,language=?,last_input=? WHERE ivr_call_id=?')->execute([$newState,$newMenu,$newStatus,$newLanguage,$digit,$callId]);}
        ivr_log_event($db,$callId,$eventType,$menu,$eventValue,['message'=>$message]);$db->commit();$updated=$getCall($callId);ivr_json_response(['ok'=>true,'call'=>ivr_call_view($db,$updated),'message'=>$message]);
    }

    if($action==='end'){
        $callId=(int)($_POST['call_id']??0);$db->beginTransaction();$call=$canAccessCall($callId);if(!$call){$db->rollBack();ivr_json_response(['ok'=>false,'error'=>'Test call not found.'],404);}if($call['call_source']!=='web_simulator'){$db->rollBack();ivr_json_response(['ok'=>false,'error'=>'Hang up the local SIP softphone to end an Asterisk test call.'],409);}if(!in_array($call['status'],['completed','failed'],true)){$db->prepare("UPDATE ivr_calls SET state='completed',current_menu='ended',status='completed',ended_at=NOW(),duration_seconds=TIMESTAMPDIFF(SECOND,started_at,NOW()) WHERE ivr_call_id=?")->execute([$callId]);$db->prepare("UPDATE ivr_call_queue SET queue_status='cancelled',resolved_at=NOW() WHERE ivr_call_id=? AND queue_status='waiting'")->execute([$callId]);ivr_log_event($db,$callId,'call_ended',$call['current_menu'],'caller_hangup',['message'=>'TEST CALL ended by simulator user.']);}$db->commit();ivr_json_response(['ok'=>true]);
    }

    if($action==='queue_resolve'){
        $callId=(int)($_POST['call_id']??0);$decision=(string)($_POST['decision']??'');if(!in_array($decision,['answer','reject'],true))ivr_json_response(['ok'=>false,'error'=>'Choose answer or reject.'],422);
        $db->beginTransaction();$callQ=$db->prepare('SELECT * FROM ivr_calls WHERE ivr_call_id=? AND is_test=1'.($role===4?' AND created_by=?':'').' FOR UPDATE');$args=[$callId];if($role===4)$args[]=$userId;$callQ->execute($args);$call=$callQ->fetch(PDO::FETCH_ASSOC);if(!$call){$db->rollBack();ivr_json_response(['ok'=>false,'error'=>'Test call not found.'],404);}
        $queueQ=$db->prepare("SELECT * FROM ivr_call_queue WHERE ivr_call_id=? AND queue_status='waiting' FOR UPDATE");$queueQ->execute([$callId]);$queue=$queueQ->fetch(PDO::FETCH_ASSOC);if(!$queue){$db->rollBack();ivr_json_response(['ok'=>false,'error'=>'This test call is no longer waiting.'],409);}
        $waitQ=$db->prepare('SELECT TIMESTAMPDIFF(SECOND,?,NOW())');$waitQ->execute([$queue['queued_at']]);$wait=(int)$waitQ->fetchColumn();
        if($decision==='answer'){$db->prepare("UPDATE ivr_call_queue SET queue_status='answered',handled_by=?,resolved_at=NOW(),resolution_note='Simulated staff answer; no transfer was made' WHERE queue_id=?")->execute([$userId,$queue['queue_id']]);$db->prepare("UPDATE ivr_calls SET status='answered_simulated',state='queue_answered',current_menu='main',waiting_seconds=? WHERE ivr_call_id=?")->execute([$wait,$callId]);$msg='A simulated healthcare worker accepted this test request. No real call was transferred.';$type='queue_answered_simulated';}
        else{$db->prepare("UPDATE ivr_call_queue SET queue_status='rejected',handled_by=?,resolved_at=NOW(),resolution_note='Simulated unavailable; no transfer was made' WHERE queue_id=?")->execute([$userId,$queue['queue_id']]);$db->prepare("UPDATE ivr_calls SET status='active',state='queue_rejected',current_menu='main',waiting_seconds=? WHERE ivr_call_id=?")->execute([$wait,$callId]);$msg='The simulated worker is unavailable. The test caller can continue the IVR.';$type='queue_rejected_simulated';}
        ivr_log_event($db,$callId,$type,'queue',$decision,['message'=>$msg]);$db->commit();ivr_json_response(['ok'=>true,'message'=>$msg]);
    }

    if($action==='save_config'){
        $capacity=(int)($_POST['max_concurrent_calls']??0);if($capacity<1||$capacity>100)ivr_json_response(['ok'=>false,'error'=>'Capacity must be between 1 and 100 simulated calls.'],422);
        $db->prepare("INSERT INTO ivr_test_config(config_key,config_value,updated_by) VALUES('max_concurrent_calls',?,?) ON DUPLICATE KEY UPDATE config_value=VALUES(config_value),updated_by=VALUES(updated_by)")->execute([(string)$capacity,$userId]);$speech=isset($_POST['speech_test_enabled'])&&$_POST['speech_test_enabled']==='1'?'1':'0';$db->prepare("INSERT INTO ivr_test_config(config_key,config_value,updated_by) VALUES('speech_test_enabled',?,?) ON DUPLICATE KEY UPDATE config_value=VALUES(config_value),updated_by=VALUES(updated_by)")->execute([$speech,$userId]);audit_log($db,$userId,'IVR_TEST_CONFIG','ivr_test_config',0,null,['max_concurrent_calls'=>$capacity,'speech_test_enabled'=>$speech]);ivr_json_response(['ok'=>true,'message'=>'Development IVR settings saved.']);
    }

    if($action==='save_prompt'){
        $id=(int)($_POST['prompt_id']??0);$text=trim((string)($_POST['prompt_text']??''));if($id<1||$text===''||mb_strlen($text)>1500)ivr_json_response(['ok'=>false,'error'=>'Prompt text must contain 1 to 1500 characters.'],422);
        $db->prepare('UPDATE ivr_voice_prompts SET prompt_text=?,updated_by=? WHERE prompt_id=?')->execute([$text,$userId,$id]);audit_log($db,$userId,'IVR_PROMPT_TEXT','ivr_voice_prompts',$id,null,['text_updated'=>true]);ivr_json_response(['ok'=>true,'message'=>'Voice prompt text saved.']);
    }

    if($action==='save_menu'){
        $id=(int)($_POST['option_id']??0);$label=trim((string)($_POST['option_label']??''));$enabled=($_POST['is_active']??'0')==='1'?1:0;if($id<1||$label===''||mb_strlen($label)>180)ivr_json_response(['ok'=>false,'error'=>'Menu label must contain 1 to 180 characters.'],422);
        $db->prepare('UPDATE ivr_menu_options SET option_label=?,is_active=?,updated_by=? WHERE option_id=?')->execute([$label,$enabled,$userId,$id]);audit_log($db,$userId,'IVR_MENU_OPTION','ivr_menu_options',$id,null,['option_label'=>$label,'is_active'=>$enabled]);ivr_json_response(['ok'=>true,'message'=>'IVR menu option saved.']);
    }

    if($action==='upload_prompt'){
        $id=(int)($_POST['prompt_id']??0);$file=$_FILES['audio']??null;if($id<1||!$file||$file['error']!==UPLOAD_ERR_OK)ivr_json_response(['ok'=>false,'error'=>'Choose a prompt audio file.'],422);if($file['size']>10*1024*1024)ivr_json_response(['ok'=>false,'error'=>'Prompt audio files must be 10 MB or smaller.'],413);
        $mime=(new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);$exts=['audio/wav'=>'wav','audio/x-wav'=>'wav','audio/mpeg'=>'mp3','audio/ogg'=>'ogg','audio/webm'=>'webm'];if(!isset($exts[$mime]))ivr_json_response(['ok'=>false,'error'=>'Upload a WAV, MP3, OGG, or WebM prompt audio file.'],415);
        $promptQ=$db->prepare('SELECT prompt_key,language,audio_path FROM ivr_voice_prompts WHERE prompt_id=?');$promptQ->execute([$id]);$prompt=$promptQ->fetch(PDO::FETCH_ASSOC);if(!$prompt)ivr_json_response(['ok'=>false,'error'=>'Prompt not found.'],404);
        $dir=__DIR__.'/assets/ivr-prompts';if(!is_dir($dir)&&!mkdir($dir,0750,true))throw new RuntimeException('Could not create the local prompt directory.');$filename=bin2hex(random_bytes(12)).'.'.$exts[$mime];$relative='assets/ivr-prompts/'.$filename;if(!move_uploaded_file($file['tmp_name'],$dir.'/'.$filename))throw new RuntimeException('Could not save the prompt audio.');
        $db->prepare('UPDATE ivr_voice_prompts SET audio_path=?,updated_by=? WHERE prompt_id=?')->execute([$relative,$userId,$id]);if($prompt['audio_path']&&str_starts_with($prompt['audio_path'],'assets/ivr-prompts/')){@unlink(__DIR__.'/'.$prompt['audio_path']);}audit_log($db,$userId,'IVR_PROMPT_AUDIO','ivr_voice_prompts',$id,null,['audio_uploaded'=>true]);ivr_json_response(['ok'=>true,'message'=>'Prompt audio uploaded. The prompt is generic and contains no call recording.','audio_path'=>$relative]);
    }

    if($action==='speech_test'){
        if(ivr_config($db,'speech_test_enabled','1')!=='1')ivr_json_response(['ok'=>false,'error'=>'Speech testing is disabled in development settings.'],403);
        if((string)($_POST['language']??'')!=='rw')ivr_json_response(['ok'=>false,'error'=>'The installed local speech model supports Kinyarwanda transcription only. English speech transcription is not configured.'],422);
        $speechCallId=(int)($_POST['call_id']??0);$speechCall=null;if($speechCallId>0){$speechCall=$getCall($speechCallId);if(!$speechCall||$speechCall['call_source']!=='web_simulator'||$speechCall['status']!=='active')ivr_json_response(['ok'=>false,'error'=>'Choose one of your active browser-simulated calls.'],404);if($speechCall['language']!=='rw')ivr_json_response(['ok'=>false,'error'=>'Choose Kinyarwanda on that call before testing its voice input.'],422);if($speechCall['current_menu']!=='main')ivr_json_response(['ok'=>false,'error'=>'For voice intent suggestions, return the selected test call to its main menu first.'],422);}
        $file=$_FILES['audio']??null;if(!$file||$file['error']!==UPLOAD_ERR_OK)ivr_json_response(['ok'=>false,'error'=>'Choose a local sample recording.'],422);if($file['size']>25*1024*1024)ivr_json_response(['ok'=>false,'error'=>'Audio must be 25 MB or smaller.'],413);
        $mime=(new finfo(FILEINFO_MIME_TYPE))->file($file['tmp_name']);if(!in_array($mime,['audio/wav','audio/x-wav','audio/flac','audio/x-flac','application/octet-stream'],true))ivr_json_response(['ok'=>false,'error'=>'Use a WAV or FLAC sample for the local Kinyarwanda recognizer.'],415);
        $base=rtrim((string)getenv('MCARE_ASR_SERVICE_URL'),'/');$token=(string)getenv('MCARE_ASR_SERVICE_TOKEN');if($base===''||$token===''||!function_exists('curl_init'))ivr_json_response(['ok'=>false,'error'=>'The local Kinyarwanda speech service is not configured. Review ai_service/kinyarwanda_asr/README.md.'],503);
        $ch=curl_init($base.'/v1/transcribe');$cfile=new CURLFile($file['tmp_name'],$mime,'sample.wav');curl_setopt_array($ch,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>['file'=>$cfile],CURLOPT_HTTPHEADER=>['Authorization: Bearer '.$token],CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>5,CURLOPT_TIMEOUT=>150]);$body=curl_exec($ch);$code=(int)curl_getinfo($ch,CURLINFO_HTTP_CODE);$curlError=curl_error($ch);curl_close($ch);if($body===false)ivr_json_response(['ok'=>false,'error'=>'Could not reach the local speech service: '.$curlError],503);$decoded=json_decode((string)$body,true);if($code!==200||!is_array($decoded))ivr_json_response(['ok'=>false,'error'=>$decoded['detail']??'The speech service could not transcribe this sample.'],503);
        $intent=null;$aiBase=rtrim((string)getenv('MCARE_AI_SERVICE_URL'),'/');$aiToken=(string)getenv('MCARE_AI_SERVICE_TOKEN');if($aiBase!==''&&$aiToken!==''&&function_exists('curl_init')){$ai=curl_init($aiBase.'/v1/analyze');curl_setopt_array($ai,[CURLOPT_POST=>true,CURLOPT_POSTFIELDS=>json_encode(['text'=>$decoded['text'],'language_hint'=>'rw']),CURLOPT_HTTPHEADER=>['Authorization: Bearer '.$aiToken,'Content-Type: application/json'],CURLOPT_RETURNTRANSFER=>true,CURLOPT_CONNECTTIMEOUT=>2,CURLOPT_TIMEOUT=>8]);$aiBody=curl_exec($ai);if($aiBody!==false&&curl_getinfo($ai,CURLINFO_HTTP_CODE)===200)$intent=json_decode((string)$aiBody,true);curl_close($ai);}
        $suggestedDigit=null;if($intent){$warnings=$intent['potential_warning_signals']??[];$suggestedDigit=$warnings?'2':(['appointment'=>'4','medication'=>'5','nutrition'=>'3','postpartum'=>'1','symptom'=>'2'][$intent['intent']??'']??null);if($speechCallId>0)ivr_log_event($db,$speechCallId,'speech_menu_suggestion',$speechCall['current_menu'],$intent['intent']??'unknown',['suggested_digit'=>$suggestedDigit,'warning_cues'=>count($warnings),'transcript_stored'=>false]);}
        ivr_json_response(['ok'=>true,'transcript'=>$decoded['text'],'language'=>'rw','review_required'=>true,'intent_analysis'=>$intent,'suggested_digit'=>$suggestedDigit,'call_id'=>$speechCallId?:null,'message'=>'This is a draft transcript and advisory menu suggestion. Review it and confirm with a keypad choice; no call state, triage, alert, or notification is changed by speech analysis.']);
    }

    ivr_json_response(['ok'=>false,'error'=>'Unknown IVR API action.'],404);
}catch(Throwable $exception){if($db->inTransaction())$db->rollBack();error_log('IVR development API error: '.$exception->getMessage());ivr_json_response(['ok'=>false,'error'=>'The IVR test request could not be completed. Check the local development logs.'],500);}
