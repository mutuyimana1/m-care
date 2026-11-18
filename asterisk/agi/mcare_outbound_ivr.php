#!/usr/bin/php
<?php
declare(strict_types=1);
/** Production outbound IVR. Plays approved generic audio only; never speaks patient data. */
ini_set('display_errors','0');
$agi=[];
while(($line=fgets(STDIN))!==false){$line=trim($line);if($line==='')break;$pair=explode(':',$line,2);if(count($pair)===2)$agi[trim($pair[0])]=trim($pair[1]);}
ob_start();
register_shutdown_function(static function():void{while(ob_get_level()>0)ob_end_clean();});
require_once dirname(__DIR__,2).'/inc/connect.php';
function outbound_agi(string $command):string{fwrite(STDOUT,$command."\n");fflush(STDOUT);$result=fgets(STDIN);return $result===false?'':trim($result);}
function outbound_prompt(PDO $db,string $key,string $language):string{
    $q=$db->prepare('SELECT audio_path FROM ivr_voice_prompts WHERE prompt_key=? AND language=? AND is_active=1 LIMIT 1');$q->execute([$key,$language]);$path=(string)($q->fetchColumn()?:'');
    if(!preg_match('~^assets/ivr-prompts/([a-f0-9]{24})\.wav$~',$path,$m))return '';
    $full=dirname(__DIR__,2).'/assets/ivr-prompts/'.$m[1].'.wav';
    return is_file($full)?substr($full,0,-4):'';
}
function outbound_digit(PDO $db,string $key,string $language,int $timeout=10000):string{
    $file=outbound_prompt($db,$key,$language);if($file==='')return '';
    $response=outbound_agi('GET DATA '.$file.' '.$timeout.' 1');
    if(preg_match('/result=(-?\d+)/',$response,$m)){if($m[1]==='-1')$GLOBALS['outbound_hungup']=true;return $m[1]==='-1'?'':($m[1]==='0'?'':$m[1]);}return '';
}
function outbound_play(PDO $db,string $key,string $language):void{$file=outbound_prompt($db,$key,$language);if($file!=='')outbound_agi('STREAM FILE '.$file.' ""');}
function outbound_event(PDO $db,int $callId,string $event,string $detail):void{$q=$db->prepare('INSERT INTO mcare_outbound_call_events(call_id,event_type,event_detail) VALUES(?,?,?)');$q->execute([$callId,$event,$detail]);}

$callId=(int)($_SERVER['argv'][1]??0);
if($callId<1){outbound_agi('HANGUP');exit(1);}
$callQ=$db->prepare("SELECT c.call_id,c.mother_id,c.language,c.status,co.consent_status FROM mcare_outbound_calls c JOIN mcare_call_consent co ON co.mother_id=c.mother_id WHERE c.call_id=? LIMIT 1");$callQ->execute([$callId]);$call=$callQ->fetch(PDO::FETCH_ASSOC);
if(!$call||$call['consent_status']!=='granted'||!in_array($call['status'],['initiating','ringing','answered'],true)){
    if($call){$db->prepare("UPDATE mcare_outbound_calls SET status='cancelled',ended_at=NOW(),failure_reason='Call eligibility changed before answer' WHERE call_id=? AND status IN ('initiating','ringing','answered')")->execute([$callId]);outbound_event($db,$callId,'call_cancelled','Consent or call status changed before answer');}
    outbound_agi('HANGUP');exit(0);
}
$db->prepare("UPDATE mcare_outbound_calls SET status='in_progress',answered_at=COALESCE(answered_at,NOW()) WHERE call_id=? AND status IN ('initiating','ringing','answered')")->execute([$callId]);
outbound_event($db,$callId,'ivr_started','Generic outbound IVR started');
$ended=false;$cancelledByConsent=false;$language=($call['language']??'rw')==='en'?'en':'rw';
try{
    outbound_agi('ANSWER');
    $digit=outbound_digit($db,'outbound_gate',$language);
    if(!empty($GLOBALS['outbound_hungup']))$ended=true;
    elseif($digit!=='1'){$ended=true;outbound_event($db,$callId,'recipient_declined','Call ended at the generic message gate');}
    if(!$ended){
        $choice=outbound_digit($db,'outbound_language',$language);
        if(!empty($GLOBALS['outbound_hungup']))$ended=true;
        elseif($choice==='1')$language='rw';elseif($choice==='2')$language='en';
        $db->prepare('UPDATE mcare_outbound_calls SET language=? WHERE call_id=?')->execute([$language,$callId]);
        outbound_event($db,$callId,'language_selected',$language);
    }
    if(!$ended){
        outbound_play($db,'outbound_welcome',$language);
        for($turn=0;$turn<5;$turn++){
            if(!empty($GLOBALS['outbound_hungup'])){$ended=true;break;}
            $consentCheck=$db->prepare("SELECT consent_status FROM mcare_call_consent WHERE mother_id=?");$consentCheck->execute([(int)$call['mother_id']]);
            if($consentCheck->fetchColumn()!=='granted'){$ended=true;$cancelledByConsent=true;outbound_event($db,$callId,'consent_withdrawn_during_call','Call ended after automated-call consent withdrawal');break;}
            $digit=outbound_digit($db,'outbound_menu',$language);
            if(!empty($GLOBALS['outbound_hungup'])){$ended=true;break;}
            if($digit==='0'){outbound_play($db,'outbound_goodbye',$language);outbound_event($db,$callId,'recipient_ended_call','Recipient selected hangup');$ended=true;break;}
            if($digit==='1'){
                outbound_play($db,'outbound_general_info',$language);
                outbound_event($db,$callId,'general_information_played','Public approved audio prompt played');
            }elseif($digit==='2'){
                $db->prepare("INSERT INTO mcare_call_back_requests(call_id,mother_id) VALUES(?,?) ON DUPLICATE KEY UPDATE status='pending',requested_at=NOW(),resolved_at=NULL,handled_by=NULL")->execute([$callId,(int)$call['mother_id']]);
                outbound_play($db,'outbound_callback_ack',$language);
                outbound_event($db,$callId,'callback_requested','Recipient requested care-team follow-up');
            }else{
                outbound_play($db,'outbound_invalid',$language);
                outbound_event($db,$callId,'invalid_input','Invalid or timed-out menu input');
            }
        }
        if($turn>=5){outbound_play($db,'outbound_goodbye',$language);$ended=true;}
    }
}catch(Throwable $e){error_log('M-CARE outbound IVR error: '.$e->getMessage());$db->prepare("UPDATE mcare_outbound_calls SET status='failed',ended_at=NOW(),failure_reason='IVR processing failed' WHERE call_id=? AND status IN ('answered','in_progress')")->execute([$callId]);outbound_event($db,$callId,'ivr_failed','IVR processing failed');$ended=true;}
if($ended){
    if($cancelledByConsent)$db->prepare("UPDATE mcare_outbound_calls SET status='cancelled',ended_at=COALESCE(ended_at,NOW()),duration_seconds=TIMESTAMPDIFF(SECOND,answered_at,NOW()),failure_reason='Automated-call consent withdrawn' WHERE call_id=? AND status IN ('answered','in_progress')")->execute([$callId]);
    else $db->prepare("UPDATE mcare_outbound_calls SET status='completed',ended_at=COALESCE(ended_at,NOW()),duration_seconds=TIMESTAMPDIFF(SECOND,answered_at,NOW()) WHERE call_id=? AND status IN ('answered','in_progress')")->execute([$callId]);
    outbound_event($db,$callId,'ivr_ended','Outbound IVR session ended');
}
outbound_agi('HANGUP');
