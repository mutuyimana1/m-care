<?php
require_once __DIR__ . '/inc/connect.php';
require_once __DIR__ . '/inc/auth.php';
require_once __DIR__ . '/inc/mother_i18n.php';
$role=(int)($_SESSION['log_role']??0);$motherId=0;$mother=null;
if($role===5){
    $motherQ=$db->prepare('SELECT m.* FROM tbl_users u JOIN tbl_mothers m ON m.mother_id=u.mother_id WHERE u.u_id=? AND u.is_active=1 AND m.is_active=1');
    $motherQ->execute([(int)$_SESSION['u_id']]);$mother=$motherQ->fetch(PDO::FETCH_ASSOC)?:null;
    if(!$mother){http_response_code(403);exit('Your account is not linked to an active maternal profile. Please contact your M-CARE care team.');}
    $motherId=(int)$mother['mother_id'];$language=$mother['preferred_language']==='rw'?'rw':'en';
}elseif(in_array($role,[1,2,3,4],true)){
    $motherId=(int)($_GET['mother_id']??0);
    $scope='';$params=[$motherId];
    if($role===3){$scope=' AND m.chw_id=?';$params[]=(int)$_SESSION['u_id'];}
    elseif(in_array($role,[2,4],true)){$scope=' AND m.facility_id=?';$params[]=(int)($_SESSION['facility_id']??0);}
    $motherQ=$db->prepare("SELECT m.* FROM tbl_mothers m WHERE m.mother_id=? AND m.is_active=1$scope");$motherQ->execute($params);$mother=$motherQ->fetch(PDO::FETCH_ASSOC)?:null;
    if(!$mother){http_response_code(404);exit('Mother record not found.');}
    $language='en';
}else{http_response_code(403);exit('You are not authorized to access this page.');}
$t=fn($label)=>mcare_mother_t($label,$language);$e=fn($value)=>htmlspecialchars((string)$value,ENT_QUOTES,'UTF-8');
$pregnancyQ=$db->prepare("SELECT pregnancy_id,lmp,edd,ultrasound_edd,pregnancy_status,CASE WHEN lmp IS NOT NULL THEN DATEDIFF(CURDATE(),lmp) WHEN ultrasound_edd IS NOT NULL THEN 280-DATEDIFF(ultrasound_edd,CURDATE()) ELSE NULL END AS gestation_days FROM tbl_pregnancies WHERE mother_id=? AND pregnancy_status='active' ORDER BY created_at DESC LIMIT 1");
$pregnancyQ->execute([$motherId]);$pregnancy=$pregnancyQ->fetch(PDO::FETCH_ASSOC)?:null;
$view=in_array($_GET['view']??'week',['day','week','month'],true)?$_GET['view']:'week';
if($pregnancy&&$pregnancy['gestation_days']!==null){$days=max(0,min(280,(int)$pregnancy['gestation_days']));$weeks=intdiv($days,7);$trimester=$weeks<13?1:($weeks<28?2:3);$month=max(1,min(10,(int)ceil(max(1,$days)/30.44)));}else{$days=null;$weeks=null;$trimester=null;$month=null;}
$page_title=$role===5?$t('My pregnancy roadmap'):$t('Pregnancy roadmap');include 'inc/links.php';include 'inc/header.php';
?>
<div class="inner-wrapper"><?php include 'inc/sidebar.php'; ?><section role="main" class="content-body"><?php include 'inc/inner-header.php'; ?>
<main class="mcare-roadmap-page">
<header class="mcare-roadmap-hero"><span class="mcare-roadmap-heart"><i class="fa fa-heart-o" aria-hidden="true"></i></span><div><p class="mcare-roadmap-kicker"><?=$t('Your pregnancy journey')?></p><h1><?=$page_title?></h1><?php if($role!==5): ?><p class="mcare-roadmap-mother-name"><?=$e($mother['f_name'].' '.$mother['l_name'])?></p><?php endif; ?><p><?=$t('A simple guide to what to expect, what to do, and when to get care — from early pregnancy to after birth.')?></p></div></header>
<?php if(!$pregnancy): ?><section class="panel"><div class="panel-body"><p><?=$t('No active pregnancy episode is recorded for this mother.')?></p><?php if($role===5): ?><a class="btn btn-primary" href="mother_messages"><?=$t('Ask your care team')?></a><?php endif; ?></div></section>
<?php elseif($days===null): ?><section class="panel"><div class="panel-body"><h2><?=$t('Pregnancy progress')?></h2><p><?=$t('Pregnancy dating is not available yet. Please ask your care team to confirm your pregnancy dates.')?></p><p><strong><?=$t('Estimated due date')?>:</strong> <?=$e($pregnancy['edd']?:$pregnancy['ultrasound_edd']?:$t('Not recorded'))?></p><?php if($role===5): ?><a class="btn btn-primary" href="mother_messages"><?=$t('Ask your care team')?></a><?php endif; ?></div></section>
<?php else: ?>
<section class="mcare-roadmap-current"><div><span class="mcare-roadmap-label"><?=$t('Your current stage')?></span><h2><?=$e($t($trimester===1?'First trimester':($trimester===2?'Second trimester':'Third trimester')))?></h2><p><?php if($view==='day'): ?><?=$t('Day')?> <?=$days+1?><?php elseif($view==='month'): ?><?=$t('Month')?> <?=$month?><?php else: ?><?=$t('Week')?> <?=$weeks+1?> <span>(<?=$days%7?> <?=$t('days into this week')?>)</span><?php endif; ?> · <?=$weeks+1?> <?=$t('weeks pregnant')?></p></div><div class="mcare-roadmap-due"><span><?=$t('Estimated due date')?></span><strong><?=$e($pregnancy['edd']?:$pregnancy['ultrasound_edd']?:$t('Not recorded'))?></strong></div></section>
<form method="get" class="mcare-roadmap-period"><label for="roadmap-view"><?=$t('Show my progress by')?></label><select class="form-control" id="roadmap-view" name="view"><option value="day" <?=$view==='day'?'selected':''?>><?=$t('Day')?></option><option value="week" <?=$view==='week'?'selected':''?>><?=$t('Week')?></option><option value="month" <?=$view==='month'?'selected':''?>><?=$t('Month')?></option></select><button class="btn btn-primary" type="submit"><?=$t('View')?></button></form>
<div class="mcare-roadmap-progress" role="progressbar" aria-label="<?=$e($t('Pregnancy progress'))?>" aria-valuemin="0" aria-valuemax="280" aria-valuenow="<?=$days?>"><span style="width:<?=min(100,round($days/280*100,1))?>%"></span></div><p class="mcare-roadmap-note"><?=$t('Pregnancy dating and milestones are estimates. Your care team can confirm what applies to you.')?></p>
<section class="mcare-trimester-grid" aria-label="<?=$e($t('Pregnancy trimesters'))?>">
<?php foreach([1,2,3] as $n):$active=$n===$trimester;$labels=[1=>['First trimester','Weeks 1–12','Early pregnancy and major development.','Your care team can help arrange your first antenatal contact and discuss recommended checks.'],2=>['Second trimester','Weeks 13–27','Your pregnancy continues to change and grow.','Keep scheduled antenatal contacts and ask your care team about recommended checks.'],3=>['Third trimester','Weeks 28–40','Preparing for birth and your baby’s arrival.','Discuss birth preparedness, where to go, and when to seek urgent care with your care team.']];$item=$labels[$n];?>
<article class="mcare-trimester-card mcare-trimester-<?=$n?> <?=$active?'is-current':''?>"><div class="mcare-trimester-top"><span><?=$e($t($item[0]))?></span><small><?=$e($t($item[1]))?></small></div><div class="mcare-trimester-body"><div class="mcare-trimester-icon"><i class="fa <?=$n===1?'fa-leaf':($n===2?'fa-child':'fa-heart')?>" aria-hidden="true"></i></div><h3><?=$e($t($item[2]))?></h3><p><?=$e($t($item[3]))?></p><?php if($active): ?><span class="mcare-current-badge"><i class="fa fa-map-marker"></i> <?=$t('You are here')?></span><?php endif; ?></div></article>
<?php endforeach; ?>
</section>
<section class="mcare-roadmap-info-grid">
<article class="mcare-roadmap-info mcare-roadmap-checkups"><h2><i class="fa fa-calendar-check-o" aria-hidden="true"></i> <?=$t('Key checkups (antenatal care)')?></h2><ul><li><?=$t('Book and attend antenatal care contacts as advised by your health worker.')?></li><li><?=$t('Ask which tests, measurements, and vaccines are recommended for you.')?></li><li><?=$t('Keep a note of your next appointment and where to go for care.')?></li></ul></article>
<article class="mcare-roadmap-info mcare-roadmap-tips"><h2><i class="fa fa-leaf" aria-hidden="true"></i> <?=$t('Healthy pregnancy tips')?></h2><ul><li><?=$t('Choose varied, nourishing foods and drink safe water.')?></li><li><?=$t('Take supplements and medicines only as advised by your health worker.')?></li><li><?=$t('Ask your health worker about safe activity, rest, and any concerns.')?></li></ul></article>
<article class="mcare-roadmap-info mcare-roadmap-warning"><h2><i class="fa fa-exclamation-triangle" aria-hidden="true"></i> <?=$t('Warning signs — seek care immediately')?></h2><ul><li><?=$t('Vaginal bleeding or severe abdominal pain.')?></li><li><?=$t('Severe headache, blurred vision, or sudden swelling.')?></li><li><?=$t('A change in your baby’s movements, when you can usually feel them.')?></li><li><?=$t('Fever, serious injury, or any sudden worrying change.')?></li></ul><p><?=$t('Do not wait for a message reply if you think you need urgent help.')?></p></article>
</section>
<section class="mcare-journey"><h2><?=$t('My journey at a glance')?></h2><ol><?php foreach(['Confirm pregnancy','Start antenatal care','Growth checks as advised','Prepare for delivery','Give birth with skilled care','Postnatal care for you and your baby'] as $step): ?><li><span class="fa fa-check-circle" aria-hidden="true"></span><strong><?=$e($t($step))?></strong></li><?php endforeach; ?></ol></section>
<p class="mcare-roadmap-disclaimer"><i class="fa fa-info-circle" aria-hidden="true"></i> <?=$t('This roadmap is general information, not a personal diagnosis or care plan. Follow the advice of your health professional.')?></p>
<?php endif; ?>
</main></section></div><?php include 'inc/footer.php';include 'inc/scripts.php'; ?>
