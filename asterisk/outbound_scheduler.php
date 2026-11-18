#!/usr/bin/env php
<?php
declare(strict_types=1);
if(PHP_SAPI!=='cli'){http_response_code(404);exit;}
require_once dirname(__DIR__).'/inc/connect.php';
require_once dirname(__DIR__).'/inc/asterisk_ami.php';

function scheduler_event(PDO $db,int $callId,string $type,string $detail):void{$q=$db->prepare('INSERT INTO mcare_outbound_call_events(call_id,event_type,event_detail) VALUES(?,?,?)');$q->execute([$callId,$type,$detail]);}
function scheduler_phone(string $raw):?string{
    $raw=preg_replace('/[\s()-]+/','',$raw);
    if(preg_match('/^0(7[0-9]{8})$/',$raw,$m))return '250'.$m[1];
    if(preg_match('/^\+?250(7[0-9]{8})$/',$raw,$m))return '250'.$m[1];
    return null;
}
function scheduler_prompts_ready(PDO $db):bool{
    $keys=['outbound_gate','outbound_language','outbound_welcome','outbound_menu','outbound_general_info','outbound_callback_ack','outbound_goodbye','outbound_invalid'];
    $q=$db->prepare('SELECT audio_path FROM ivr_voice_prompts WHERE prompt_key=? AND language=? AND is_active=1 LIMIT 1');
    foreach(['rw','en'] as $language)foreach($keys as $key){$q->execute([$key,$language]);$path=(string)($q->fetchColumn()?:'');if(!preg_match('~^assets/ivr-prompts/[a-f0-9]{24}\.wav$~',$path)||!is_file(dirname(__DIR__).'/'.$path))return false;}
    return true;
}
function scheduler_queue_existing_reminders(PDO $db):void{
    if(getenv('MCARE_REMINDER_CALLS_ENABLED')!=='1')return;
    $q=$db->query("SELECT r.reminder_id,r.reminder_type,r.reminder_date,m.mother_id,m.phone,m.preferred_language FROM tbl_reminders r JOIN tbl_mothers m ON m.mother_id=r.mother_id JOIN mcare_call_consent co ON co.mother_id=m.mother_id AND co.consent_status='granted' WHERE r.is_sent=0 AND r.reminder_date BETWEEN DATE_SUB(NOW(),INTERVAL 2 HOUR) AND DATE_ADD(NOW(),INTERVAL 1 MINUTE) AND m.is_active=1 AND m.phone IS NOT NULL AND NOT EXISTS(SELECT 1 FROM mcare_outbound_calls x WHERE x.source_reminder_id=r.reminder_id OR (x.mother_id=m.mother_id AND x.created_at>=DATE_SUB(NOW(),INTERVAL 24 HOUR))) ORDER BY r.reminder_date LIMIT 50");
    $insert=$db->prepare("INSERT IGNORE INTO mcare_outbound_calls(call_uuid,mother_id,source_reminder_id,destination_number,purpose,language,status,scheduled_at) VALUES(?,?,?,?,?,?,'queued',?)");
    foreach($q->fetchAll(PDO::FETCH_ASSOC) as $r){$phone=scheduler_phone((string)$r['phone']);if(!$phone)continue;$type=(string)$r['reminder_type'];$purpose=match($type){'anc_appointment'=>'appointment_reminder','medication'=>'medication_reminder',default=>'worker_followup'};$language=$r['preferred_language']==='en'?'en':'rw';$uuid=bin2hex(random_bytes(16));$insert->execute([$uuid,(int)$r['mother_id'],(int)$r['reminder_id'],$phone,$purpose,$language,$r['reminder_date']]);$callId=(int)$db->lastInsertId();if($callId)scheduler_event($db,$callId,'reminder_queued','An existing due reminder was queued for an opted-in recipient');}
}
function scheduler_once(PDO $db):bool{
    $db->exec("INSERT INTO mcare_outbound_runtime(runtime_key,runtime_status,heartbeat_at) VALUES('outbound_scheduler','disconnected',NOW()) ON DUPLICATE KEY UPDATE runtime_status='disconnected',heartbeat_at=NOW()");
    try{$settings=mcare_ami_settings();}catch(Throwable $e){error_log('M-CARE scheduler configuration is incomplete.');return false;}
    $runtime=$db->query("SELECT heartbeat_at FROM mcare_outbound_runtime WHERE runtime_key='ami_event_listener' AND runtime_status='connected'")->fetchColumn();
    if(!$runtime||strtotime((string)$runtime)<time()-90)return false;
    if(!scheduler_prompts_ready($db))return false;
    $open=(int)(getenv('MCARE_CALLING_HOUR_START')?:8);$close=(int)(getenv('MCARE_CALLING_HOUR_END')?:18);$now=new DateTimeImmutable('now',new DateTimeZone('Africa/Kigali'));
    if($open<7||$close>20||$close<=$open||(int)$now->format('G')<$open||(int)$now->format('G')>=$close)return false;
    if((int)$db->query("SELECT GET_LOCK('mcare_outbound_dispatch',0)")->fetchColumn()!==1)return false;
    try{
        $db->exec("UPDATE mcare_outbound_runtime SET runtime_status='connected',heartbeat_at=NOW() WHERE runtime_key='outbound_scheduler'");
        scheduler_queue_existing_reminders($db);
        $db->beginTransaction();
        $db->exec("UPDATE mcare_outbound_calls c LEFT JOIN mcare_call_consent co ON co.mother_id=c.mother_id SET c.status='cancelled',c.ended_at=NOW(),c.failure_reason='Automated-call consent was withdrawn' WHERE c.status='queued' AND c.scheduled_at<=NOW() AND (co.consent_status IS NULL OR co.consent_status<>'granted')");
        $cap=max(1,min(20,(int)(getenv('MCARE_OUTBOUND_MAX_CONCURRENT')?:2)));
        $active=(int)$db->query("SELECT COUNT(*) FROM mcare_outbound_calls WHERE status IN ('pending','initiating','ringing','answered','in_progress')")->fetchColumn();
        if($active >= $cap){$db->commit();return false;}
        $q=$db->query("SELECT c.call_id,c.destination_number,c.ami_action_id FROM mcare_outbound_calls c JOIN mcare_call_consent co ON co.mother_id=c.mother_id AND co.consent_status='granted' WHERE c.status='queued' AND (c.scheduled_at IS NULL OR c.scheduled_at<=NOW()) ORDER BY c.call_priority,c.scheduled_at,c.call_id LIMIT 1 FOR UPDATE");
        $call=$q->fetch(PDO::FETCH_ASSOC);
        if(!$call){$db->commit();return false;}
        $actionId='mcare-'.bin2hex(random_bytes(16));
        $db->prepare("UPDATE mcare_outbound_calls SET status='pending',ami_action_id=?,started_at=NOW() WHERE call_id=? AND status='queued'")->execute([$actionId,$call['call_id']]);
        $db->commit();
        try{$response=mcare_ami_originate($settings,(string)$call['destination_number'],(int)$call['call_id'],$actionId);$db->prepare("UPDATE mcare_outbound_calls SET status='initiating' WHERE call_id=? AND status='pending'")->execute([(int)$call['call_id']]);if(!empty($response['Channel']))$db->prepare('UPDATE mcare_outbound_calls SET asterisk_channel=? WHERE call_id=?')->execute([$response['Channel'],(int)$call['call_id']]);scheduler_event($db,(int)$call['call_id'],'ami_accepted','Asterisk accepted a queued originate request');return true;}
        catch(Throwable $e){$db->prepare("UPDATE mcare_outbound_calls SET status='failed',ended_at=NOW(),failure_reason='Asterisk originate failed' WHERE call_id=? AND status IN ('pending','initiating')")->execute([(int)$call['call_id']]);scheduler_event($db,(int)$call['call_id'],'originate_failed','Asterisk rejected a queued call');error_log('M-CARE scheduler originate failed: '.$e->getMessage());return false;}
    }catch(Throwable $e){if($db->inTransaction())$db->rollBack();error_log('M-CARE outbound scheduler error: '.$e->getMessage());return false;}
    finally{$db->query("SELECT RELEASE_LOCK('mcare_outbound_dispatch')");}
}

if(realpath((string)($_SERVER['SCRIPT_FILENAME']??''))===__FILE__){
    $once=in_array('--once',$argv,true);
    do{$worked=scheduler_once($db);if(!$once)sleep($worked?1:20);}while(!$once);
}
