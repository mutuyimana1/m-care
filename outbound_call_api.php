<?php
declare(strict_types=1);
require_once __DIR__ . '/inc/connect.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/asterisk_ami.php';

function outbound_json(array $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store, private');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function outbound_can_access(PDO $db, int $motherId, int $role, int $userId, int $facilityId): bool
{
    $sql = 'SELECT mother_id FROM tbl_mothers WHERE mother_id=? AND is_active=1';
    $args = [$motherId];
    if ($role === 3) { $sql .= ' AND chw_id=?'; $args[] = $userId; }
    elseif ($role === 2) { if ($facilityId < 1) return false; $sql .= ' AND facility_id=?'; $args[] = $facilityId; }
    elseif ($role !== 1) return false;
    $q = $db->prepare($sql); $q->execute($args);
    return (bool)$q->fetchColumn();
}

function outbound_normalize_phone(string $raw): ?string
{
    $raw=preg_replace('/[\s()-]+/','',$raw);
    if(preg_match('/^0(7[0-9]{8})$/',$raw,$m))return '250'.$m[1];
    if(preg_match('/^\+?250(7[0-9]{8})$/',$raw,$m))return '250'.$m[1];
    return null;
}

function outbound_prompts_ready(PDO $db): bool
{
    $keys=['outbound_gate','outbound_language','outbound_welcome','outbound_menu','outbound_general_info','outbound_callback_ack','outbound_goodbye','outbound_invalid'];
    $q=$db->prepare('SELECT audio_path FROM ivr_voice_prompts WHERE prompt_key=? AND language=? AND is_active=1 LIMIT 1');
    foreach(['rw','en'] as $language){
        foreach($keys as $key){
            $q->execute([$key,$language]);$path=(string)($q->fetchColumn()?:'');
            if(!preg_match('~^assets/ivr-prompts/[a-f0-9]{24}\.wav$~',$path)||!is_file(__DIR__.'/'.$path))return false;
        }
    }
    return true;
}

if (!in_array((int)($_SESSION['log_role'] ?? 0), [1,2,3], true)) outbound_json(['ok'=>false,'error'=>'Not authorized to place calls.'],403);
$role=(int)$_SESSION['log_role'];$userId=(int)$_SESSION['u_id'];$facilityId=(int)($_SESSION['facility_id']??0);
$action=(string)($_GET['action']??$_POST['action']??'');

try {
    if ($_SERVER['REQUEST_METHOD']==='POST' && $action==='bulk') {
        $ids=$_POST['mother_ids']??[];$purpose=(string)($_POST['purpose']??'worker_followup');$priority=(int)($_POST['priority']??5);
        if(!is_array($ids)||!$ids||count($ids)>20)outbound_json(['ok'=>false,'error'=>'Select between 1 and 20 recipients per batch.'],422);
        $ids=array_values(array_unique(array_filter(array_map('intval',$ids),static fn($id)=>$id>0)));
        if(!$ids||count($ids)>20)outbound_json(['ok'=>false,'error'=>'Select between 1 and 20 valid recipients.'],422);
        sort($ids,SORT_NUMERIC);
        $purposes=['test','anc_followup','appointment_reminder','postnatal_followup','missed_appointment','worker_followup','medication_reminder'];
        if(!in_array($purpose,$purposes,true))outbound_json(['ok'=>false,'error'=>'Choose a valid call purpose.'],422);
        if($priority<1||$priority>5)outbound_json(['ok'=>false,'error'=>'Queue priority must be between 1 (highest) and 5 (normal).'],422);
        $settings=mcare_ami_settings();$runtime=$db->query("SELECT heartbeat_at FROM mcare_outbound_runtime WHERE runtime_key='ami_event_listener' AND runtime_status='connected'")->fetchColumn();
        if(!$runtime||strtotime((string)$runtime)<time()-90||!outbound_prompts_ready($db))outbound_json(['ok'=>false,'error'=>'Asterisk listener or approved outbound prompts are not ready. No calls were queued.'],503);
        $scheduler=$db->query("SELECT heartbeat_at FROM mcare_outbound_runtime WHERE runtime_key='outbound_scheduler' AND runtime_status='connected'")->fetchColumn();
        if(!$scheduler||strtotime((string)$scheduler)<time()-120)outbound_json(['ok'=>false,'error'=>'The outbound call queue worker is not running. No calls were queued.'],503);
        $db->beginTransaction();$queued=0;$skipped=0;
        foreach($ids as $motherId){
            if(!outbound_can_access($db,$motherId,$role,$userId,$facilityId)){$skipped++;continue;}
            $mq=$db->prepare('SELECT phone,preferred_language FROM tbl_mothers WHERE mother_id=? AND is_active=1 FOR UPDATE');$mq->execute([$motherId]);$mother=$mq->fetch(PDO::FETCH_ASSOC);
            $cq=$db->prepare("SELECT consent_status,consented_at FROM mcare_call_consent WHERE mother_id=?");$cq->execute([$motherId]);$consent=$cq->fetch(PDO::FETCH_ASSOC);
            $number=$mother?outbound_normalize_phone((string)$mother['phone']):null;
            if(!$number||!$consent||$consent['consent_status']!=='granted'||empty($consent['consented_at'])){$skipped++;continue;}
            $dupe=$db->prepare("SELECT call_id FROM mcare_outbound_calls WHERE mother_id=? AND (status IN ('pending','queued','initiating','ringing','answered','in_progress') OR created_at>=DATE_SUB(NOW(),INTERVAL 24 HOUR)) LIMIT 1");$dupe->execute([$motherId]);
            if($dupe->fetchColumn()){$skipped++;continue;}
            $uuid=sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',random_int(0,65535),random_int(0,65535),random_int(0,65535),(random_int(0,4095)|0x4000),(random_int(0,16383)|0x8000),random_int(0,65535),random_int(0,65535),random_int(0,65535));
            $language=($mother['preferred_language']??'rw')==='en'?'en':'rw';
            $insert=$db->prepare("INSERT INTO mcare_outbound_calls(call_uuid,mother_id,destination_number,purpose,language,status,call_priority,scheduled_at,initiated_by) VALUES(?,?,?,?,?,'queued',?,NOW(),?)");$insert->execute([$uuid,$motherId,$number,$purpose,$language,$priority,$userId]);$callId=(int)$db->lastInsertId();
            $db->prepare("INSERT INTO mcare_outbound_call_events(call_id,event_type,event_detail) VALUES(?,'bulk_call_queued',?)")->execute([$callId,'Staff-selected batch call queued']);$queued++;
        }
        $db->commit();
        if(function_exists('audit_log'))audit_log($db,$userId,'OUTBOUND_BULK_QUEUE','mcare_outbound_calls',0,null,['queued'=>$queued,'skipped'=>$skipped,'purpose'=>$purpose]);
        outbound_json(['ok'=>true,'queued'=>$queued,'skipped'=>$skipped,'message'=>"{$queued} call(s) queued; {$skipped} skipped because of scope, consent, number, or recent-call limits. The worker applies the configured concurrency cap."]);
    }
    if ($_SERVER['REQUEST_METHOD']==='POST' && $action==='start') {
        $motherId=(int)($_POST['mother_id']??0);
        $purpose=(string)($_POST['purpose']??'worker_followup');
        $retryOf=(int)($_POST['retry_of']??0);$retryCount=0;
        $priority=(int)($_POST['priority']??5);
        $purposes=['test','anc_followup','appointment_reminder','postnatal_followup','missed_appointment','worker_followup','medication_reminder'];
        if($motherId<1||!in_array($purpose,$purposes,true)) outbound_json(['ok'=>false,'error'=>'Select a valid mother and call purpose.'],422);
        if($priority<1||$priority>5)outbound_json(['ok'=>false,'error'=>'Queue priority must be between 1 (highest) and 5 (normal).'],422);
        $settings=mcare_ami_settings();
        $runtime=$db->query("SELECT heartbeat_at FROM mcare_outbound_runtime WHERE runtime_key='ami_event_listener' AND runtime_status='connected'")->fetchColumn();
        if(!$runtime||strtotime((string)$runtime)<time()-90) outbound_json(['ok'=>false,'error'=>'Asterisk call status listener is not connected. No call was placed.'],503);
        if(!outbound_prompts_ready($db)) outbound_json(['ok'=>false,'error'=>'Approved English and Kinyarwanda outbound WAV prompts must be uploaded before calls can be placed. No call was placed.'],503);
        $localNow=new DateTimeImmutable('now',new DateTimeZone('Africa/Kigali'));
        $open=(int)(getenv('MCARE_CALLING_HOUR_START')?:8);$close=(int)(getenv('MCARE_CALLING_HOUR_END')?:18);
        if($open<7||$close>20||$close<=$open) outbound_json(['ok'=>false,'error'=>'Calling-hour configuration is invalid.'],503);
        $scheduledAt=null;$scheduleInput=trim((string)($_POST['scheduled_at']??''));
        if($scheduleInput!==''){
            $scheduledAt=DateTimeImmutable::createFromFormat('!Y-m-d\\TH:i',$scheduleInput,new DateTimeZone('Africa/Kigali'));
            $dateErrors=DateTimeImmutable::getLastErrors();
            if(!$scheduledAt||($dateErrors&&($dateErrors['warning_count']||$dateErrors['error_count']))||$scheduledAt<=$localNow||$scheduledAt>$localNow->modify('+30 days'))outbound_json(['ok'=>false,'error'=>'Choose a valid call time within the next 30 days.'],422);
            if((int)$scheduledAt->format('G')<$open||(int)$scheduledAt->format('G')>=$close)outbound_json(['ok'=>false,'error'=>"Scheduled calls must be between {$open}:00 and {$close}:00 Kigali time."],422);
            $scheduler=$db->query("SELECT heartbeat_at FROM mcare_outbound_runtime WHERE runtime_key='outbound_scheduler' AND runtime_status='connected'")->fetchColumn();
            if(!$scheduler||strtotime((string)$scheduler)<time()-120)outbound_json(['ok'=>false,'error'=>'The outbound call queue worker is not running. No call was scheduled.'],503);
        }elseif((int)$localNow->format('G')<$open||(int)$localNow->format('G')>=$close) outbound_json(['ok'=>false,'error'=>"Calls can be started between {$open}:00 and {$close}:00 Kigali time."],422);
        if(!$scheduledAt){$locked=(int)$db->query("SELECT GET_LOCK('mcare_outbound_dispatch',2)")->fetchColumn();if($locked!==1)outbound_json(['ok'=>false,'error'=>'The call dispatcher is busy. Try again shortly.'],429);register_shutdown_function(static function()use($db):void{try{$db->query("SELECT RELEASE_LOCK('mcare_outbound_dispatch')");}catch(Throwable $e){}});}

        $db->beginTransaction();
        $lock=$db->prepare('SELECT mother_id,phone,preferred_language FROM tbl_mothers WHERE mother_id=? AND is_active=1 FOR UPDATE');$lock->execute([$motherId]);$mother=$lock->fetch(PDO::FETCH_ASSOC);
        if(!$mother||!outbound_can_access($db,$motherId,$role,$userId,$facilityId)){$db->rollBack();outbound_json(['ok'=>false,'error'=>'Mother record not found.'],404);}
        $consentQ=$db->prepare("SELECT consent_status,consented_at FROM mcare_call_consent WHERE mother_id=? FOR UPDATE");$consentQ->execute([$motherId]);$consent=$consentQ->fetch(PDO::FETCH_ASSOC);
        if(!$consent||$consent['consent_status']!=='granted'||empty($consent['consented_at'])){$db->rollBack();outbound_json(['ok'=>false,'error'=>'Recorded consent for automated calls is required before calling.'],403);}
        if($retryOf>0){$retryQ=$db->prepare('SELECT call_id,purpose,status,retry_count,call_priority FROM mcare_outbound_calls WHERE call_id=? AND mother_id=? FOR UPDATE');$retryQ->execute([$retryOf,$motherId]);$oldCall=$retryQ->fetch(PDO::FETCH_ASSOC);$latestQ=$db->prepare('SELECT MAX(call_id) FROM mcare_outbound_calls WHERE mother_id=?');$latestQ->execute([$motherId]);if(!$oldCall||(int)$latestQ->fetchColumn()!==$retryOf||!in_array($oldCall['status'],['busy','no_answer','failed'],true)||(int)$oldCall['retry_count']>=2){$db->rollBack();outbound_json(['ok'=>false,'error'=>'This call is not eligible for another retry.'],409);}$retryCount=(int)$oldCall['retry_count']+1;$purpose=$oldCall['purpose'];$priority=(int)$oldCall['call_priority'];}
        $number=outbound_normalize_phone((string)$mother['phone']);
        if(!$number){$db->rollBack();outbound_json(['ok'=>false,'error'=>'The saved phone number is not a valid Rwanda mobile number. Update the mother record first.'],422);}
        $active=$db->query("SELECT COUNT(*) FROM mcare_outbound_calls WHERE status IN ('pending','initiating','ringing','answered','in_progress')")->fetchColumn();
        $capacity=max(1,min(20,(int)(getenv('MCARE_OUTBOUND_MAX_CONCURRENT')?:2)));
        if((int)$active >= $capacity){$db->rollBack();outbound_json(['ok'=>false,'error'=>'The outbound call concurrency limit has been reached. Try again later.'],429);}
        if($retryOf===0){$dupe=$db->prepare("SELECT call_id FROM mcare_outbound_calls WHERE mother_id=? AND (status IN ('pending','queued','initiating','ringing','answered','in_progress') OR created_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)) LIMIT 1");$dupe->execute([$motherId]);if($dupe->fetchColumn()){$db->rollBack();outbound_json(['ok'=>false,'error'=>'A call is already active or was placed for this mother in the last 24 hours.'],409);}}
        $language=($mother['preferred_language']??'rw')==='en'?'en':'rw';
        $uuid=sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',random_int(0,65535),random_int(0,65535),random_int(0,65535),(random_int(0,4095)|0x4000),(random_int(0,16383)|0x8000),random_int(0,65535),random_int(0,65535),random_int(0,65535));
        $actionId='mcare-'.bin2hex(random_bytes(16));
        $initialStatus=$scheduledAt?'queued':'pending';
        $insert=$db->prepare('INSERT INTO mcare_outbound_calls(call_uuid,mother_id,destination_number,purpose,language,status,call_priority,scheduled_at,retry_count,initiated_by,ami_action_id) VALUES(?,?,?,?,?,?,?,?,?,?,?)');
        $insert->execute([$uuid,$motherId,$number,$purpose,$language,$initialStatus,$priority,$scheduledAt?$scheduledAt->format('Y-m-d H:i:s'):null,$retryCount,$userId,$scheduledAt?null:$actionId]);$callId=(int)$db->lastInsertId();
        if($retryOf>0){$db->prepare('UPDATE mcare_outbound_calls SET retry_count=? WHERE call_id=?')->execute([$retryCount,$retryOf]);$db->prepare("INSERT INTO mcare_outbound_call_events(call_id,event_type,event_detail) VALUES(?,'retry_created',?)")->execute([$retryOf,'Retry #'.$retryCount.' queued as call #'.$callId]);}
        $db->prepare('INSERT INTO mcare_outbound_call_events(call_id,event_type,event_detail) VALUES(?,?,?)')->execute([$callId,$scheduledAt?'call_scheduled':'request_created',$purpose]);
        $db->commit();

        if($scheduledAt)outbound_json(['ok'=>true,'call_id'=>$callId,'status'=>'queued','message'=>'Call scheduled. It will be submitted to Asterisk at the selected time if consent and provider status remain valid.']);

        try {
            $response=mcare_ami_originate($settings,$number,$callId,$actionId);
            $db->prepare("UPDATE mcare_outbound_calls SET status='initiating',started_at=NOW() WHERE call_id=? AND status='pending'")->execute([$callId]);
            if(!empty($response['Channel']))$db->prepare('UPDATE mcare_outbound_calls SET asterisk_channel=? WHERE call_id=?')->execute([$response['Channel'],$callId]);
            $db->prepare("INSERT INTO mcare_outbound_call_events(call_id,event_type,event_detail) VALUES(?,'ami_accepted','Originate accepted by Asterisk; this does not confirm answer')")->execute([$callId]);
            if(function_exists('audit_log'))audit_log($db,$userId,'OUTBOUND_CALL_REQUEST','mcare_outbound_calls',$callId,null,['purpose'=>$purpose]);
            outbound_json(['ok'=>true,'call_id'=>$callId,'status'=>'initiating','message'=>'Asterisk accepted the originate request. Mobile ringing and answer status will appear when Asterisk events arrive.']);
        } catch(Throwable $e) {
            $db->prepare("UPDATE mcare_outbound_calls SET status='failed',ended_at=NOW(),failure_reason='Asterisk originate failed' WHERE call_id=?")->execute([$callId]);
            $db->prepare("INSERT INTO mcare_outbound_call_events(call_id,event_type,event_detail) VALUES(?,'originate_failed','Asterisk originate failed')")->execute([$callId]);
            error_log('M-CARE outbound AMI error: '.$e->getMessage());
            outbound_json(['ok'=>false,'call_id'=>$callId,'error'=>'Asterisk did not accept the call request. Check the local Asterisk integration status.'],502);
        }
    }

    if ($_SERVER['REQUEST_METHOD']==='GET' && $action==='history') {
        $motherId=(int)($_GET['mother_id']??0);
        if($motherId<1||!outbound_can_access($db,$motherId,$role,$userId,$facilityId))outbound_json(['ok'=>false,'error'=>'Mother record not found.'],404);
        $q=$db->prepare('SELECT call_id,purpose,language,status,scheduled_at,started_at,answered_at,ended_at,duration_seconds,retry_count,failure_reason,created_at FROM mcare_outbound_calls WHERE mother_id=? ORDER BY call_id DESC LIMIT 30');$q->execute([$motherId]);
        outbound_json(['ok'=>true,'calls'=>$q->fetchAll(PDO::FETCH_ASSOC)]);
    }
    if ($_SERVER['REQUEST_METHOD']==='POST' && $action==='cancel') {
        $callId=(int)($_POST['call_id']??0);
        $db->beginTransaction();$q=$db->prepare('SELECT call_id,mother_id,status,asterisk_channel FROM mcare_outbound_calls WHERE call_id=? FOR UPDATE');$q->execute([$callId]);$call=$q->fetch(PDO::FETCH_ASSOC);
        if(!$call||!outbound_can_access($db,(int)$call['mother_id'],$role,$userId,$facilityId)){$db->rollBack();outbound_json(['ok'=>false,'error'=>'Call not found.'],404);}
        if($call['status']==='queued'){$db->prepare("UPDATE mcare_outbound_calls SET status='cancelled',ended_at=NOW() WHERE call_id=? AND status='queued'")->execute([$callId]);$db->prepare("INSERT INTO mcare_outbound_call_events(call_id,event_type,event_detail) VALUES(?,'cancelled','Scheduled call cancelled by authorized staff')")->execute([$callId]);$db->commit();outbound_json(['ok'=>true,'message'=>'Scheduled call cancelled.']);}
        if(!in_array($call['status'],['initiating','ringing','answered','in_progress'],true)){$db->rollBack();outbound_json(['ok'=>false,'error'=>'This call is no longer active.'],409);}
        $db->prepare("UPDATE mcare_outbound_calls SET status='cancelled',ended_at=NOW(),failure_reason='Cancellation requested' WHERE call_id=?")->execute([$callId]);$db->prepare("INSERT INTO mcare_outbound_call_events(call_id,event_type,event_detail) VALUES(?,'cancelled','Call cancellation requested by authorized staff')")->execute([$callId]);$db->commit();
        try{if(!empty($call['asterisk_channel']))mcare_ami_hangup(mcare_ami_settings(),(string)$call['asterisk_channel'],'mcare-hang-'.bin2hex(random_bytes(12)));outbound_json(['ok'=>true,'message'=>'Cancellation recorded. Asterisk will end the channel; the event listener will catch any channel still starting.']);}
        catch(Throwable $e){error_log('M-CARE outbound cancel error: '.$e->getMessage());outbound_json(['ok'=>false,'error'=>'Cancellation was recorded, but Asterisk did not accept the hangup. Hang up the active channel from Asterisk.'],502);}
    }
    if ($_SERVER['REQUEST_METHOD']==='POST' && $action==='callback_resolve') {
        $callbackId=(int)($_POST['callback_id']??0);$status=(string)($_POST['status']??'');
        if(!in_array($status,['contacted','cancelled'],true))outbound_json(['ok'=>false,'error'=>'Choose a valid callback status.'],422);
        $q=$db->prepare('SELECT b.callback_id,b.mother_id FROM mcare_call_back_requests b WHERE b.callback_id=?');$q->execute([$callbackId]);$callback=$q->fetch(PDO::FETCH_ASSOC);
        if(!$callback||!outbound_can_access($db,(int)$callback['mother_id'],$role,$userId,$facilityId))outbound_json(['ok'=>false,'error'=>'Callback request not found.'],404);
        $db->prepare("UPDATE mcare_call_back_requests SET status=?,resolved_at=NOW(),handled_by=? WHERE callback_id=? AND status='pending'")->execute([$status,$userId,$callbackId]);
        if(function_exists('audit_log'))audit_log($db,$userId,'OUTBOUND_CALLBACK_RESOLVE','mcare_call_back_requests',$callbackId,null,['status'=>$status]);
        outbound_json(['ok'=>true,'message'=>'Callback request updated.']);
    }
    if ($_SERVER['REQUEST_METHOD']==='POST' && $action==='callback_resolve') {
        $callbackId=(int)($_POST['callback_id']??0);$status=(string)($_POST['status']??'');
        if(!in_array($status,['contacted','cancelled'],true))outbound_json(['ok'=>false,'error'=>'Choose a valid callback status.'],422);
        $q=$db->prepare('SELECT b.callback_id,b.mother_id FROM mcare_call_back_requests b WHERE b.callback_id=?');$q->execute([$callbackId]);$callback=$q->fetch(PDO::FETCH_ASSOC);
        if(!$callback||!outbound_can_access($db,(int)$callback['mother_id'],$role,$userId,$facilityId))outbound_json(['ok'=>false,'error'=>'Callback request not found.'],404);
        $db->prepare("UPDATE mcare_call_back_requests SET status=?,resolved_at=NOW(),handled_by=? WHERE callback_id=? AND status='pending'")->execute([$status,$userId,$callbackId]);
        if(function_exists('audit_log'))audit_log($db,$userId,'OUTBOUND_CALLBACK_RESOLVE','mcare_call_back_requests',$callbackId,null,['status'=>$status]);
        outbound_json(['ok'=>true,'message'=>'Callback request updated.']);
    }
    outbound_json(['ok'=>false,'error'=>'Unknown action.'],404);
} catch(Throwable $e) {
    if(isset($db)&&$db->inTransaction())$db->rollBack();
    error_log('M-CARE outbound API error: '.$e->getMessage());
    outbound_json(['ok'=>false,'error'=>'Outbound call request failed. Check application and database setup.'],500);
}
