<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/inc/connect.php';
require_once dirname(__DIR__).'/asterisk/outbound_ami_events.php';

$db->beginTransaction();
try{
    $mother=$db->prepare("INSERT INTO tbl_mothers(f_name,l_name,phone,is_active,consent_given) VALUES('Synthetic','Call Test','0780000001',1,1)");$mother->execute();$motherId=(int)$db->lastInsertId();
    $db->prepare("INSERT INTO mcare_call_consent(mother_id,consent_status,consent_source,consented_at) VALUES(?,'granted','isolated smoke fixture',NOW())")->execute([$motherId]);
    $make=static function(string $status,string $action)use($db,$motherId):int{$uuid=sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',random_int(0,65535),random_int(0,65535),random_int(0,65535),(random_int(0,4095)|0x4000),(random_int(0,16383)|0x8000),random_int(0,65535),random_int(0,65535),random_int(0,65535));$q=$db->prepare('INSERT INTO mcare_outbound_calls(call_uuid,mother_id,destination_number,purpose,status,ami_action_id) VALUES(?,?,?,\'test\',?,?)');$q->execute([$uuid,$motherId,'250780000001',$status,$action]);return(int)$db->lastInsertId();};
    $answered=$make('initiating','mcare-event-answer');
    outbound_process_event($db,['Event'=>'OriginateResponse','ActionID'=>'mcare-event-answer','Response'=>'Success','Uniqueid'=>'smoke-answered-1','Channel'=>'PJSIP/250780000001@mcare-mtn-00000001']);
    outbound_process_event($db,['Event'=>'Newstate','Uniqueid'=>'smoke-answered-1','Channel'=>'PJSIP/250780000001@mcare-mtn-00000001','Context'=>'mcare-outbound','Exten'=>(string)$answered,'ChannelStateDesc'=>'Ringing']);
    outbound_process_event($db,['Event'=>'Newstate','Uniqueid'=>'smoke-answered-1','Channel'=>'PJSIP/250780000001@mcare-mtn-00000001','Context'=>'mcare-outbound','Exten'=>(string)$answered,'ChannelStateDesc'=>'Up']);
    outbound_process_event($db,['Event'=>'Hangup','Uniqueid'=>'smoke-answered-1','Channel'=>'PJSIP/250780000001@mcare-mtn-00000001','Cause'=>'16']);
    $q=$db->prepare('SELECT status,answered_at,ended_at FROM mcare_outbound_calls WHERE call_id=?');$q->execute([$answered]);$row=$q->fetch(PDO::FETCH_ASSOC);if($row['status']!=='completed'||!$row['answered_at']||!$row['ended_at'])throw new RuntimeException('Answered lifecycle was not recorded correctly.');

    $busy=$make('ringing','mcare-event-busy');outbound_process_event($db,['Event'=>'OriginateResponse','ActionID'=>'mcare-event-busy','Response'=>'Success','Uniqueid'=>'smoke-busy-1','Channel'=>'PJSIP/250780000001@mcare-mtn-00000002']);outbound_process_event($db,['Event'=>'Hangup','Uniqueid'=>'smoke-busy-1','Channel'=>'PJSIP/250780000001@mcare-mtn-00000002','Cause'=>'17']);
    $q=$db->prepare('SELECT status FROM mcare_outbound_calls WHERE call_id=?');$q->execute([$busy]);if($q->fetchColumn()!=='busy')throw new RuntimeException('Busy lifecycle was not recorded.');

    $noAnswer=$make('ringing','mcare-event-noanswer');outbound_process_event($db,['Event'=>'OriginateResponse','ActionID'=>'mcare-event-noanswer','Response'=>'Success','Uniqueid'=>'smoke-noanswer-1','Channel'=>'PJSIP/250780000001@mcare-mtn-00000003']);outbound_process_event($db,['Event'=>'Hangup','Uniqueid'=>'smoke-noanswer-1','Channel'=>'PJSIP/250780000001@mcare-mtn-00000003','Cause'=>'19']);
    $q=$db->prepare('SELECT status FROM mcare_outbound_calls WHERE call_id=?');$q->execute([$noAnswer]);if($q->fetchColumn()!=='no_answer')throw new RuntimeException('No-answer lifecycle was not recorded.');
    $db->rollBack();
    echo "Asterisk answered, busy, and no-answer lifecycle mapping passed with rolled-back synthetic rows; no calls were placed.\n";
}catch(Throwable $e){if($db->inTransaction())$db->rollBack();throw $e;}
