#!/usr/bin/env php
<?php
declare(strict_types=1);
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
require_once dirname(__DIR__) . '/inc/connect.php';
require_once dirname(__DIR__) . '/inc/asterisk_ami.php';

function outbound_event_call_id(PDO $db, array $event): int
{
    if (!empty($event['ActionID'])) {
        $q=$db->prepare('SELECT call_id FROM mcare_outbound_calls WHERE ami_action_id=? LIMIT 1');$q->execute([$event['ActionID']]);
        $id=(int)$q->fetchColumn();if($id)return $id;
    }
    if (!empty($event['Uniqueid'])) {
        $q=$db->prepare('SELECT call_id FROM mcare_outbound_calls WHERE asterisk_uniqueid=? LIMIT 1');$q->execute([$event['Uniqueid']]);
        $id=(int)$q->fetchColumn();if($id)return $id;
    }
    if (($event['Context']??'')==='mcare-outbound' && !empty($event['Exten']) && ctype_digit($event['Exten'])) {
        $q=$db->prepare('SELECT call_id FROM mcare_outbound_calls WHERE call_id=? AND status IN (\'pending\',\'initiating\',\'ringing\')');$q->execute([(int)$event['Exten']]);
        return (int)$q->fetchColumn();
    }
    return 0;
}

function outbound_log_event(PDO $db,int $callId,string $type,?string $detail=null):void
{
    $q=$db->prepare('INSERT INTO mcare_outbound_call_events(call_id,event_type,event_detail) VALUES(?,?,?)');$q->execute([$callId,$type,$detail]);
}

function outbound_process_event(PDO $db,array $event):void
{
    $type=$event['Event']??'';
    if(!in_array($type,['OriginateResponse','Newstate','Hangup'],true))return;
    $callId=outbound_event_call_id($db,$event);if(!$callId)return;
    if(!empty($event['Uniqueid']))$db->prepare('UPDATE mcare_outbound_calls SET asterisk_uniqueid=COALESCE(asterisk_uniqueid,?),asterisk_channel=COALESCE(asterisk_channel,?) WHERE call_id=?')->execute([$event['Uniqueid'],$event['Channel']??null,$callId]);
    if($type==='OriginateResponse'){
        if(($event['Response']??'')==='Success'){
            $check=$db->prepare('SELECT c.status,co.consent_status FROM mcare_outbound_calls c LEFT JOIN mcare_call_consent co ON co.mother_id=c.mother_id WHERE c.call_id=?');$check->execute([$callId]);$state=$check->fetch(PDO::FETCH_ASSOC);
            if($state&&($state['status']==='cancelled'||$state['consent_status']!=='granted')&&!empty($event['Channel'])){
                try{mcare_ami_hangup(mcare_ami_settings(),(string)$event['Channel'],'mcare-optout-'.bin2hex(random_bytes(10)));outbound_log_event($db,$callId,'cancelled','Asterisk channel ended after cancellation or consent withdrawal');}
                catch(Throwable $e){error_log('M-CARE could not hang up cancelled originate: '.$e->getMessage());}
            }
        }
        if(($event['Response']??'')==='Failure'){
            $db->prepare("UPDATE mcare_outbound_calls SET status='failed',ended_at=NOW(),failure_reason='Asterisk could not originate the channel' WHERE call_id=? AND status IN ('pending','initiating','ringing')")->execute([$callId]);
            outbound_log_event($db,$callId,'originate_failure','Asterisk reported channel originate failure');
        }
        return;
    }
    if($type==='Newstate'){
        $state=$event['ChannelStateDesc']??'';
        $eligibility=$db->prepare('SELECT c.status,co.consent_status FROM mcare_outbound_calls c LEFT JOIN mcare_call_consent co ON co.mother_id=c.mother_id WHERE c.call_id=?');$eligibility->execute([$callId]);$callEligibility=$eligibility->fetch(PDO::FETCH_ASSOC);
        if($callEligibility&&($callEligibility['status']==='cancelled'||$callEligibility['consent_status']!=='granted')&&!empty($event['Channel'])){
            try{mcare_ami_hangup(mcare_ami_settings(),(string)$event['Channel'],'mcare-optout-'.bin2hex(random_bytes(10)));outbound_log_event($db,$callId,'cancelled','Asterisk channel ended after cancellation or consent withdrawal');}
            catch(Throwable $e){error_log('M-CARE could not hang up ineligible channel: '.$e->getMessage());}
            return;
        }
        if(in_array($state,['Ring','Ringing'],true)){
            $db->prepare("UPDATE mcare_outbound_calls SET status='ringing' WHERE call_id=? AND status IN ('pending','initiating')")->execute([$callId]);
            outbound_log_event($db,$callId,'ringing','Asterisk reports ringing');
        }elseif($state==='Up'){
            $db->prepare("UPDATE mcare_outbound_calls SET status='answered',answered_at=COALESCE(answered_at,NOW()) WHERE call_id=? AND status IN ('pending','initiating','ringing')")->execute([$callId]);
            outbound_log_event($db,$callId,'answered','Asterisk reports channel answered');
        }
        return;
    }
    $q=$db->prepare('SELECT status,answered_at FROM mcare_outbound_calls WHERE call_id=?');$q->execute([$callId]);$row=$q->fetch(PDO::FETCH_ASSOC);if(!$row)return;
    if(in_array($row['status'],['completed','busy','no_answer','failed','cancelled'],true))return;
    $cause=(int)($event['Cause']??0);
    if(!empty($row['answered_at'])||in_array($row['status'],['answered','in_progress'],true)){$status='completed';$detail='Answered call ended';}
    elseif($cause===17){$status='busy';$detail='Destination reported busy';}
    elseif(in_array($cause,[18,19],true)){$status='no_answer';$detail='Destination did not answer';}
    else{$status='failed';$detail='Call ended before answer';}
    $db->prepare('UPDATE mcare_outbound_calls SET status=?,ended_at=COALESCE(ended_at,NOW()),duration_seconds=IF(answered_at IS NULL,0,TIMESTAMPDIFF(SECOND,answered_at,NOW())),failure_reason=IF(? IN (\'completed\',\'busy\',\'no_answer\'),NULL,?) WHERE call_id=?')->execute([$status,$status,$detail,$callId]);
    outbound_log_event($db,$callId,'hangup',$detail);
}

function outbound_run(PDO $db):never
{
    $settings=mcare_ami_settings();$backoff=2;
    while(true){
        $errno=0;$error='';$socket=@stream_socket_client('tcp://'.$settings['host'].':'.$settings['port'],$errno,$error,5,STREAM_CLIENT_CONNECT);
        if(!$socket){$db->exec("INSERT INTO mcare_outbound_runtime(runtime_key,runtime_status,heartbeat_at) VALUES('ami_event_listener','disconnected',NOW()) ON DUPLICATE KEY UPDATE runtime_status='disconnected',heartbeat_at=NOW()");error_log('M-CARE AMI event listener cannot connect to local Asterisk.');sleep($backoff);$backoff=min(30,$backoff*2);continue;}
        stream_set_timeout($socket,25);fgets($socket,2048);
        fwrite($socket,"Action: Login\r\nUsername: {$settings['username']}\r\nSecret: {$settings['secret']}\r\nEvents: on\r\n\r\n");
        $login=mcare_ami_read_message($socket,microtime(true)+5);
        if(($login['Response']??'')!=='Success'){$db->exec("INSERT INTO mcare_outbound_runtime(runtime_key,runtime_status,heartbeat_at) VALUES('ami_event_listener','disconnected',NOW()) ON DUPLICATE KEY UPDATE runtime_status='disconnected',heartbeat_at=NOW()");fclose($socket);error_log('M-CARE AMI event listener authentication failed.');sleep($backoff);$backoff=min(30,$backoff*2);continue;}
        $db->exec("INSERT INTO mcare_outbound_runtime(runtime_key,runtime_status,heartbeat_at) VALUES('ami_event_listener','connected',NOW()) ON DUPLICATE KEY UPDATE runtime_status='connected',heartbeat_at=NOW()");
        $backoff=2;
        while(!feof($socket)){
            $message=mcare_ami_read_message($socket,microtime(true)+24);
            if(!$message){$meta=stream_get_meta_data($socket);if(!empty($meta['timed_out'])){$db->exec("UPDATE mcare_outbound_runtime SET heartbeat_at=NOW() WHERE runtime_key='ami_event_listener'");continue;}break;}
            try{outbound_process_event($db,$message);}catch(Throwable $e){error_log('M-CARE AMI event processing failed: '.$e->getMessage());}
        }
        fclose($socket);$db->exec("UPDATE mcare_outbound_runtime SET runtime_status='disconnected',heartbeat_at=NOW() WHERE runtime_key='ami_event_listener'");sleep($backoff);$backoff=min(30,$backoff*2);
    }
}

if(realpath((string)($_SERVER['SCRIPT_FILENAME']??''))===__FILE__)outbound_run($db);
