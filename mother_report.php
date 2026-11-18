<?php
require_once __DIR__ . '/inc/mother_session.php';
require_once __DIR__ . '/inc/report_analysis.php';
require_once __DIR__ . '/inc/report_guidance.php';
$error='';$immediateGuidance='';
if($_SERVER['REQUEST_METHOD']==='POST'&&($_POST['action']??'')==='report'){
    try{
        $selected=array_values(array_unique(array_filter(array_map('intval',$_POST['symptoms']??[]))));
        if(!$selected)throw new RuntimeException('Choose at least one symptom.');
        $marks=implode(',',array_fill(0,count($selected),'?'));
        $q=$db->prepare("SELECT symptom_id,symptom_name,symptom_name_rw,severity_weight FROM tbl_symptoms WHERE is_active=1 AND symptom_id IN ($marks)");$q->execute($selected);$symptomRows=$q->fetchAll(PDO::FETCH_ASSOC);
        if(!$symptomRows)throw new RuntimeException('Choose a symptom from the list.');
        $selected=array_map('intval',array_column($symptomRows,'symptom_id'));
        $q=$db->prepare("SELECT pregnancy_id FROM tbl_pregnancies WHERE mother_id=? AND pregnancy_status='active' ORDER BY created_at DESC LIMIT 1");$q->execute([$motherId]);$pregnancyId=$q->fetchColumn()?:null;
        $reference='MC-'.strtoupper(bin2hex(random_bytes(5)));$onset=trim((string)($_POST['onset_at']??''));$onset=$onset?str_replace('T',' ',$onset):null;
        $db->beginTransaction();
        $db->prepare('INSERT INTO tbl_symptom_reports (mother_id,pregnancy_id,reported_by,symptoms_json,onset_at,severity,symptom_pattern,worsening,already_sought_care,reported_temperature,reported_systolic,reported_diastolic,reference_code,additional_notes) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)')->execute([$motherId,$pregnancyId,(int)$_SESSION['u_id'],json_encode($selected),$onset,($_POST['severity']??'')?:null,($_POST['symptom_pattern']??'')?:null,(int)isset($_POST['worsening']),(int)isset($_POST['already_sought_care']),($_POST['temperature']??'')?:null,($_POST['systolic']??'')?:null,($_POST['diastolic']??'')?:null,$reference,trim($_POST['notes']??'')]);
        $reportId=(int)$db->lastInsertId();
        $analysis=mcare_create_report_analysis($db,$reportId,$motherId,$reference,[
            'onset_at'=>$onset,'severity'=>(string)($_POST['severity']??''),'symptom_pattern'=>(string)($_POST['symptom_pattern']??''),
            'worsening'=>(int)isset($_POST['worsening']),'already_sought_care'=>(int)isset($_POST['already_sought_care']),
            'reported_temperature'=>(string)($_POST['temperature']??''),'reported_systolic'=>(string)($_POST['systolic']??''),
            'reported_diastolic'=>(string)($_POST['diastolic']??''),'additional_notes'=>trim((string)($_POST['notes']??'')),
        ],$symptomRows);
        $maxWeight=max(array_map('intval',array_column($symptomRows,'severity_weight')));$level=$maxWeight>=3?'critical':($maxWeight===2?'high':'medium');
        $db->prepare('INSERT INTO tbl_alerts (report_id,mother_id,pregnancy_id,alert_level,alert_message,assigned_to,facility_id) VALUES (?,?,?,?,?,?,?)')->execute([$reportId,$motherId,$pregnancyId,$level,'Woman-submitted symptom report. Priority source: configured symptom catalogue weights ('.$maxWeight.'); this is a routing priority, not a diagnosis.',$mother['chw_id']?:null,$mother['facility_id']?:null]);
        $alertId=(int)$db->lastInsertId();
        $db->prepare('INSERT INTO tbl_alert_events(alert_id,actor_user_id,event_type,to_user_id,event_note) VALUES(?,?,?,?,?)')->execute([$alertId,(int)$_SESSION['u_id'],'created',$mother['chw_id']?:null,'Generated from selected symptom catalogue entries; maximum configured weight '.$maxWeight.' produced '.$level.' priority.']);
        if($mother['chw_id'])$db->prepare('INSERT INTO tbl_alert_events(alert_id,event_type,to_user_id,event_note) VALUES(?,?,?,?)')->execute([$alertId,'assigned',(int)$mother['chw_id'],'Assigned to the mother’s linked CHW.']);
        $db->prepare('UPDATE tbl_symptom_reports SET alert_generated=1 WHERE report_id=?')->execute([$reportId]);
        $recipients=mcare_notify_report_reviewers($db,$mother,$reportId,$reference,$level);
        foreach($recipients as $recipient)$db->prepare('INSERT INTO tbl_alert_events(alert_id,actor_user_id,event_type,to_user_id,event_note) VALUES(?,?,?,?,?)')->execute([$alertId,(int)$_SESSION['u_id'],'notified',$recipient,'In-app report review notification sent; generated intake summary is available.']);
        audit_log($db,$_SESSION['u_id'],'MOTHER_SYMPTOM_REPORT','tbl_symptom_reports',$reportId,null,['mother_id'=>$motherId]);$db->commit();
        $immediateGuidance=mcare_build_immediate_report_guidance($symptomRows,(string)($_POST['severity']??''),isset($_POST['worsening']),$language,$reference);
        try{$db->prepare("INSERT INTO tbl_notifications(user_id,notif_type,notif_message,reference_id,reference_type) VALUES(?,?,?,?, 'symptom_guidance')")
            ->execute([(int)$_SESSION['u_id'],'guidance',$immediateGuidance,$reportId]);}
        catch(Throwable $notificationError){error_log('Could not save mother symptom guidance notification: '.$notificationError->getMessage());}
    }catch(Throwable $ex){if($db->inTransaction())$db->rollBack();$error=$ex instanceof RuntimeException?mcare_mother_t($ex->getMessage(),$language):$t('We could not save that request. Please try again or contact your care team.');}
}
$symptoms=$db->query('SELECT symptom_id,symptom_name,symptom_name_rw FROM tbl_symptoms WHERE is_active=1 ORDER BY symptom_name')->fetchAll(PDO::FETCH_ASSOC);
$page_title=$t('Report a symptom');include 'inc/links.php';include 'inc/header.php';
?>
<div class="inner-wrapper"><?php include 'inc/sidebar.php'; ?><section role="main" class="content-body"><?php include 'inc/inner-header.php'; ?>
<section class="panel mcare-report-panel"><header class="panel-heading"><h2 class="panel-title"><?=$t('Report a symptom')?></h2></header><div class="panel-body">
<div class="mcare-report-page">
<section class="mcare-report-intro"><div class="mcare-report-intro-icon"><i class="fa fa-heartbeat" aria-hidden="true"></i></div><div><p class="mcare-report-eyebrow"><?=$t('Your care team is here to help')?></p><h1><?=$t('Share how you’re feeling')?></h1><p><?=$t('Tell your care team what you’re experiencing. Add a few details so they can understand your concern.')?></p></div></section>
<?php if($error): ?><div class="alert alert-danger mcare-report-flash"><i class="fa fa-exclamation-circle" aria-hidden="true"></i> <?=$e($error)?></div><?php endif; ?>
<form method="post" class="mcare-report-layout"><input type="hidden" name="_csrf" value="<?=$e($_SESSION['csrf_token'])?>"><input type="hidden" name="action" value="report">
<div class="mcare-report-main">
<section class="mcare-report-card"><div class="mcare-report-card-heading"><span class="mcare-step-number">1</span><div><h2><?=$t('What are you experiencing?')?></h2><p><?=$t('Choose all symptoms that apply. Your care team will review your report.')?></p></div><span class="mcare-selected-count" id="mcare-symptom-count" aria-live="polite">0</span></div>
<fieldset class="mcare-symptom-grid"><legend class="sr-only"><?=$t('Select your symptoms')?></legend><?php foreach($symptoms as $s): ?><label class="mcare-symptom-option"><input type="checkbox" name="symptoms[]" value="<?=$s['symptom_id']?>"><span class="mcare-symptom-check" aria-hidden="true"><i class="fa fa-check"></i></span><span><?= $e(($language==='rw'&&$s['symptom_name_rw'])?$s['symptom_name_rw']:$s['symptom_name']) ?></span></label><?php endforeach; ?></fieldset>
</section>
<section class="mcare-report-card"><div class="mcare-report-card-heading"><span class="mcare-step-number">2</span><div><h2><?=$t('Tell us a little more')?></h2><p><?=$t('These details are optional, but may help your care team follow up.')?></p></div></div>
<div class="mcare-report-fields"><div class="form-group"><label for="mcare-onset"><?=$t('When did it start?')?></label><input id="mcare-onset" class="form-control" type="datetime-local" name="onset_at"></div><div class="form-group"><label for="mcare-severity"><?=$t('How severe does it feel?')?></label><select id="mcare-severity" class="form-control" name="severity"><option value=""><?=$t('Select')?></option><option value="mild"><?=$t('Mild')?></option><option value="moderate"><?=$t('Moderate')?></option><option value="severe"><?=$t('Severe')?></option></select></div><div class="form-group"><label for="mcare-pattern"><?=$t('Pattern')?></label><select id="mcare-pattern" class="form-control" name="symptom_pattern"><option value=""><?=$t('Select')?></option><option value="continuous"><?=$t('Continuous')?></option><option value="comes_goes"><?=$t('Comes and goes')?></option></select></div><div class="mcare-report-toggles"><label class="mcare-toggle-option"><input type="checkbox" name="worsening"><span><?=$t('Getting worse')?></span></label><label class="mcare-toggle-option"><input type="checkbox" name="already_sought_care"><span><?=$t('I have already sought care')?></span></label></div></div>
<div class="mcare-report-vitals"><p class="mcare-field-label"><?=$t('Vitals (if known)')?></p><div class="mcare-report-fields"><div class="form-group"><label for="mcare-temperature"><?=$t('Temperature (if known)')?></label><div class="mcare-input-unit"><input id="mcare-temperature" class="form-control" type="number" step="0.1" name="temperature" inputmode="decimal"><span>°C</span></div></div><div class="form-group"><label><?=$t('Blood pressure (if known)')?></label><div class="mcare-bp-inputs"><input class="form-control" type="number" name="systolic" inputmode="numeric" aria-label="<?=$e($t('Systolic'))?>" placeholder="<?=$e($t('Systolic'))?>"><span>/</span><input class="form-control" type="number" name="diastolic" inputmode="numeric" aria-label="<?=$e($t('Diastolic'))?>" placeholder="<?=$e($t('Diastolic'))?>"><small>mmHg</small></div></div></div></div>
</section>
<section class="mcare-report-card"><div class="mcare-report-card-heading"><span class="mcare-step-number">3</span><div><h2><?=$t('Anything else you want us to know?')?></h2><p><?=$t('Share any extra details in your own words.')?></p></div></div><div class="form-group mcare-report-notes-group"><label for="mcare-report-notes" class="sr-only"><?=$t('Anything else you want us to know?')?></label><textarea id="mcare-report-notes" class="form-control" name="notes" rows="4" maxlength="4000" placeholder="<?=$e($t('Type any additional details here'))?>"></textarea></div><div class="mcare-report-submit"><p><i class="fa fa-lock" aria-hidden="true"></i> <?=$t('Your report is shared with your assigned care team.')?></p><button class="btn btn-danger" type="submit"><i class="fa fa-paper-plane" aria-hidden="true"></i> <?=$t('Send symptom report')?></button></div></section>
</div>
<aside class="mcare-report-aside"><section class="mcare-report-aside-card"><div class="mcare-aside-icon"><i class="fa fa-share-square-o" aria-hidden="true"></i></div><h2><?=$t('What happens next?')?></h2><ol class="mcare-next-steps"><li><span>1</span><p><?=$t('Your report is sent to your care team.')?></p></li><li><span>2</span><p><?=$t('A health worker reviews the information.')?></p></li><li><span>3</span><p><?=$t('You can check updates in your reports and referrals.')?></p></li></ol><a class="mcare-aside-link" href="mother_followup"><?=$t('View my reports')?> <i class="fa fa-arrow-right" aria-hidden="true"></i></a></section><section class="mcare-report-aside-card mcare-aside-chat"><div class="mcare-aside-icon"><i class="fa fa-comments-o" aria-hidden="true"></i></div><h3><?=$t('Want to talk to someone?')?></h3><p><?=$t('Send a message to your care team through live chat.')?></p><a class="btn btn-default btn-block" href="mother_messages"><?=$t('Chat with your care team')?></a></section></aside>
</form>
</div></div></section>
</section></div><?php include 'inc/footer.php';include 'inc/scripts.php'; ?>
<script>
(function(){
const symptomChecks=document.querySelectorAll('input[name="symptoms[]"]'),symptomCount=document.getElementById('mcare-symptom-count');
function updateSymptomCount(){const total=document.querySelectorAll('input[name="symptoms[]"]:checked').length;symptomCount.textContent=String(total);symptomCount.classList.toggle('has-selection',total>0);}
symptomChecks.forEach(input=>input.addEventListener('change',updateSymptomCount));
})();
</script>
