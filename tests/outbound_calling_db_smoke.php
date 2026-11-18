<?php
declare(strict_types=1);
require_once dirname(__DIR__).'/inc/connect.php';
require_once dirname(__DIR__).'/inc/asterisk_ami.php';
require_once dirname(__DIR__).'/asterisk/outbound_scheduler.php';

$required=['mcare_call_consent','mcare_outbound_calls','mcare_outbound_call_events','mcare_call_back_requests','mcare_outbound_runtime'];
foreach($required as $table){$q=$db->prepare('SELECT COUNT(*) FROM information_schema.tables WHERE table_schema=DATABASE() AND table_name=?');$q->execute([$table]);if((int)$q->fetchColumn()!==1)throw new RuntimeException('Missing outbound schema table: '.$table);}
$q=$db->query("SELECT COUNT(*) FROM ivr_voice_prompts WHERE prompt_key LIKE 'outbound_%' AND language IN ('rw','en')");if((int)$q->fetchColumn()!==16)throw new RuntimeException('Expected 16 bilingual production prompt rows.');
$q=$db->query("SELECT COUNT(*) FROM information_schema.columns WHERE table_schema=DATABASE() AND table_name='mcare_outbound_calls' AND column_name='call_priority'");if((int)$q->fetchColumn()!==1)throw new RuntimeException('Queue priority migration was not applied.');
$q=$db->query('SELECT COUNT(*) FROM mcare_outbound_calls');if((int)$q->fetchColumn()!==0)throw new RuntimeException('Isolated smoke database unexpectedly contains outbound calls.');
$db->beginTransaction();$db->query("SELECT c.call_id FROM mcare_outbound_calls c JOIN mcare_call_consent co ON co.mother_id=c.mother_id AND co.consent_status='granted' WHERE c.status='queued' AND (c.scheduled_at IS NULL OR c.scheduled_at<=NOW()) ORDER BY c.call_priority,c.scheduled_at,c.call_id LIMIT 1 FOR UPDATE");$db->rollBack();
putenv('MCARE_REMINDER_CALLS_ENABLED=1');
scheduler_queue_existing_reminders($db);
$q=$db->query('SELECT COUNT(*) FROM mcare_outbound_calls');if((int)$q->fetchColumn()!==0)throw new RuntimeException('The synthetic database must not create reminder calls without opted-in mothers.');
foreach(['MCARE_AMI_USERNAME','MCARE_AMI_SECRET','MCARE_OUTBOUND_PJSIP_ENDPOINT','MCARE_OUTBOUND_CALLER_ID','MCARE_OUTBOUND_NUMBER_FORMAT'] as $key)putenv($key);
try{mcare_ami_settings();throw new RuntimeException('Missing-provider configuration was incorrectly accepted.');}catch(RuntimeException $e){if($e->getMessage()==='Missing-provider configuration was incorrectly accepted.')throw $e;}
echo "Outbound schema, reminder opt-in, and missing-provider fail-closed checks passed; no calls were placed.\n";
