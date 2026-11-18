<?php
require_once __DIR__ . '/inc/mother_session.php';
$q=$db->prepare("SELECT COUNT(*) FROM tbl_symptom_reports WHERE mother_id=? AND status IN ('pending','reviewed')");$q->execute([$motherId]);$openReports=(int)$q->fetchColumn();
$q=$db->prepare("SELECT COUNT(*) FROM tbl_referrals WHERE mother_id=? AND status IN ('pending','in_transit','arrived')");$q->execute([$motherId]);$openReferrals=(int)$q->fetchColumn();
$q=$db->prepare('SELECT reminder_type,reminder_message,reminder_date FROM tbl_reminders WHERE mother_id=? AND reminder_date>=NOW() ORDER BY reminder_date LIMIT 3');$q->execute([$motherId]);$reminders=$q->fetchAll(PDO::FETCH_ASSOC);
$q=$db->prepare('SELECT COUNT(*) FROM tbl_notifications WHERE user_id=? AND is_read=0');$q->execute([(int)$_SESSION['u_id']]);$unreadUpdates=(int)$q->fetchColumn();
$page_title=$t('Dashboard');include 'inc/links.php';include 'inc/header.php';
?>
<div class="inner-wrapper"><?php include 'inc/sidebar.php'; ?><section role="main" class="content-body"><?php include 'inc/inner-header.php'; ?>
<?php if($reminders): ?><section class="panel"><header class="panel-heading"><h2 class="panel-title"><?=$t('Upcoming')?></h2></header><div class="panel-body"><ul class="list-unstyled"><?php foreach($reminders as $r): ?><li class="well mcare-update-item"><div class="mcare-update-heading"><strong><?=$t('Upcoming')?> <?=$e($t(ucwords(str_replace('_',' ',$r['reminder_type']))))?></strong> · <?=$e($r['reminder_date'])?></div><p class="mcare-update-message"><?=$e($r['reminder_message'])?></p></li><?php endforeach; ?></ul></div></section><?php endif; ?>
<h3><?=$t('Dashboard quick actions')?></h3><div class="row mcare-mother-actions" style="margin-bottom:18px">
<div class="col-xs-6 col-sm-4 col-md-2"><a class="btn btn-danger btn-block" href="mother_report"><i class="fa fa-heartbeat"></i><br><?=$t('Report a symptom')?></a></div>
<div class="col-xs-6 col-sm-4 col-md-2"><a class="btn btn-primary btn-block" href="mother_messages"><i class="fa fa-comments-o"></i><br><?=$t('Live chat')?></a></div>
<div class="col-xs-6 col-sm-4 col-md-2"><a class="btn btn-success btn-block" href="mother_nutrition"><i class="fa fa-leaf"></i><br><?=$t('Nutrition check-in')?></a></div>
<div class="col-xs-6 col-sm-4 col-md-2"><a class="btn btn-info btn-block" href="mother_education"><i class="fa fa-book"></i><br><?=$t('Health education')?></a></div>
<div class="col-xs-6 col-sm-4 col-md-2"><a class="btn btn-warning btn-block" href="mother_followup"><i class="fa fa-list-alt"></i><br><?=$t('My reports and referrals')?></a></div>
<div class="col-xs-6 col-sm-4 col-md-2"><a class="btn btn-default btn-block" href="mother_updates"><i class="fa fa-bell"></i><br><?=$t('Updates')?> (<?=$unreadUpdates?>)</a></div>
</div>
<div class="row"><div class="col-sm-4"><section class="panel"><div class="panel-body"><h4><?=$t('Open symptom reports')?></h4><strong class="amount"><?=$openReports?></strong><p><a href="mother_followup"><?=$t('View follow-up')?></a></p></div></section></div><div class="col-sm-4"><section class="panel"><div class="panel-body"><h4><?=$t('Open referrals')?></h4><strong class="amount"><?=$openReferrals?></strong><p><a href="mother_followup"><?=$t('View follow-up')?></a></p></div></section></div><div class="col-sm-4"><section class="panel"><div class="panel-body"><h4><?=$t('Personal health guidance')?></h4><p><?=$t('Read approved pregnancy nutrition and postnatal information.')?></p><a class="btn btn-sm btn-info" href="mother_chatbot"><?=$t('Chat with M-CARE')?></a></div></section></div></div>
</section></div><?php include 'inc/footer.php'; include 'inc/scripts.php'; ?>
