<?php
require_once __DIR__ . '/inc/mother_session.php';
$q=$db->prepare('SELECT report_id,reference_code,report_date,symptoms_json,status FROM tbl_symptom_reports WHERE mother_id=? ORDER BY report_date DESC LIMIT 30');
$q->execute([$motherId]);
$reports=$q->fetchAll(PDO::FETCH_ASSOC);
$q=$db->prepare('SELECT r.referral_date,r.referral_reason,r.status,r.arrival_confirmed,r.outcome,r.outcome_notes,f.facility_name FROM tbl_referrals r LEFT JOIN tbl_facilities f ON f.facility_id=r.referred_to_facility WHERE r.mother_id=? ORDER BY r.referral_date DESC LIMIT 30');
$q->execute([$motherId]);
$referrals=$q->fetchAll(PDO::FETCH_ASSOC);
$page_title=$t('My reports and referrals');include 'inc/links.php';include 'inc/header.php';
?>
<div class="inner-wrapper"><?php include 'inc/sidebar.php'; ?><section role="main" class="content-body"><?php include 'inc/inner-header.php'; ?>
<section class="panel"><header class="panel-heading"><h2 class="panel-title"><?=$t('Symptom reports')?></h2></header><div class="panel-body">
<?php if(!$reports): ?><p class="text-muted"><?=$t('No reports submitted.')?></p><?php else: ?><ul class="list-unstyled">
<?php foreach($reports as $r):
    $ids=array_values(array_filter(array_map('intval',json_decode((string)$r['symptoms_json'],true)?:[])));$names=[];
    if($ids){$symptomQuery=$db->prepare('SELECT symptom_name,symptom_name_rw FROM tbl_symptoms WHERE symptom_id IN ('.implode(',',array_fill(0,count($ids),'?')).') ORDER BY symptom_name');$symptomQuery->execute($ids);foreach($symptomQuery->fetchAll(PDO::FETCH_ASSOC) as $symptom)$names[]=$language==='rw'&&$symptom['symptom_name_rw']?$symptom['symptom_name_rw']:$symptom['symptom_name'];}
?><li class="well mcare-update-item"><div class="mcare-update-heading"><div><strong><?=$e($r['reference_code']?:$t('Report').' '.$r['report_id'])?></strong> · <?=$e($r['report_date'])?> <span class="label label-info"><?=$e($t(ucfirst((string)$r['status'])))?></span></div></div><p class="mcare-update-message"><strong><?=$t('Symptoms')?>:</strong> <?=$e(implode(', ',$names)?:$t('Report submitted'))?></p></li><?php endforeach; ?>
</ul><?php endif; ?>
<a class="btn btn-danger btn-sm" href="mother_report"><i class="fa fa-heartbeat" aria-hidden="true"></i> <?=$t('Report a symptom')?></a>
</div></section>
<section class="panel"><header class="panel-heading"><h2 class="panel-title"><?=$t('Referral updates')?></h2></header><div class="panel-body">
<?php if(!$referrals): ?><p class="text-muted"><?=$t('No referrals recorded.')?></p><?php else: ?><ul class="list-unstyled">
<?php foreach($referrals as $r): ?><li class="well mcare-update-item"><div class="mcare-update-heading"><div><strong><?=$e($r['facility_name']?:$t('Facility to be confirmed'))?></strong> · <?=$e($r['referral_date'])?> <span class="label label-info"><?=$e($t(ucwords(str_replace('_',' ',$r['status']))))?></span></div></div><p class="mcare-update-message"><strong><?=$t('Reason')?>:</strong> <?=$e($r['referral_reason'])?></p><p class="mcare-update-message"><strong><?=$t('Arrival confirmed')?>:</strong> <?=$r['arrival_confirmed']?$t('Yes'):$t('Not yet')?><?php if($r['outcome_notes']||$r['outcome']): ?> · <strong><?=$t('Outcome')?>:</strong> <?=$e($r['outcome_notes']?:$r['outcome'])?><?php endif; ?></p></li><?php endforeach; ?>
</ul><?php endif; ?>
</div></section>
<p><a href="mother_updates"><i class="fa fa-bell-o" aria-hidden="true"></i> <?=$t('Updates')?></a></p>
</section></div><?php include 'inc/footer.php';include 'inc/scripts.php'; ?>
