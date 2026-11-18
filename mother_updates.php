<?php
require_once __DIR__ . '/inc/mother_session.php';
require_once __DIR__ . '/inc/report_guidance.php';
$userId=(int)$_SESSION['u_id'];$error='';$popupNotification=null;
if($_SERVER['REQUEST_METHOD']==='POST'&&($_POST['action']??'')==='mark_read'){
    $notificationId=(int)($_POST['notif_id']??0);
    if($notificationId>0)$db->prepare('UPDATE tbl_notifications SET is_read=1 WHERE notif_id=? AND user_id=?')->execute([$notificationId,$userId]);
    header('Location: mother_updates');exit;
}
$q=$db->prepare('SELECT notif_id,notif_type,notif_message,reference_id,reference_type,created_at,is_read FROM tbl_notifications WHERE user_id=? ORDER BY created_at DESC LIMIT 100');$q->execute([$userId]);$updates=$q->fetchAll(PDO::FETCH_ASSOC);
foreach($updates as &$update){if(($update['reference_type']??'')==='symptom_guidance')$update['guidance_data']=mcare_guidance_for_saved_report($db,(int)$update['reference_id'],$motherId,$language);}unset($update);
$popupId=(int)($_GET['popup']??0);if($popupId>0){$popupQuery=$db->prepare("SELECT notif_id,notif_message,reference_id,created_at FROM tbl_notifications WHERE notif_id=? AND user_id=? AND reference_type='symptom_guidance'");$popupQuery->execute([$popupId,$userId]);$popupNotification=$popupQuery->fetch(PDO::FETCH_ASSOC)?:null;if($popupNotification)$popupNotification['guidance_data']=mcare_guidance_for_saved_report($db,(int)$popupNotification['reference_id'],$motherId,$language);}
$page_title=$t('Updates');include 'inc/links.php';include 'inc/header.php';
?>
<div class="inner-wrapper"><?php include 'inc/sidebar.php'; ?><section role="main" class="content-body"><?php include 'inc/inner-header.php'; ?>
<section class="panel"><header class="panel-heading"><h2 class="panel-title"><?=$t('Updates')?></h2></header><div class="panel-body">
<?php if(!$updates): ?><p class="text-muted"><?=$t('No updates yet.')?></p><?php else: ?>
<ul class="list-unstyled">
<?php foreach($updates as $u): ?><li class="well mcare-update-item"><div class="mcare-update-heading"><div><strong><?=$u['reference_type']==='symptom_guidance'?$t('Automated guidance'):$e($u['notif_type'])?></strong> · <?=$e($u['created_at'])?><?php if(!$u['is_read']): ?> <span class="label label-info"><?=$t('New')?></span><?php endif; ?></div><?php if(!$u['is_read']): ?><form method="post"><input type="hidden" name="_csrf" value="<?=$e($_SESSION['csrf_token'])?>"><input type="hidden" name="action" value="mark_read"><input type="hidden" name="notif_id" value="<?=$e($u['notif_id'])?>"><button class="btn btn-default btn-sm" type="submit"><?=$t('Mark read')?></button></form><?php else: ?><span class="text-muted"><?=$t('Read')?></span><?php endif; ?></div>
<?php if(!empty($u['guidance_data'])):$guidanceData=$u['guidance_data'];include __DIR__.'/inc/report_guidance_view.php';else: ?><p class="mcare-update-message"><?=$e($u['notif_message'])?></p><?php endif; ?>
</li><?php endforeach; ?>
</ul><?php endif; ?>
</div></section><?php if($popupNotification): ?><div class="modal fade" id="mcareGuidancePopup" tabindex="-1" role="dialog" aria-labelledby="mcareGuidancePopupTitle" aria-hidden="true"><div class="modal-dialog"><div class="modal-content"><div class="modal-header"><button type="button" class="close" data-dismiss="modal" aria-label="<?=$t('Close')?>"><span aria-hidden="true">&times;</span></button><h4 class="modal-title" id="mcareGuidancePopupTitle"><?=$language==='rw'?'Ubufasha bushingiye kuri raporo yawe':'Immediate guidance based on your report'?></h4></div><div class="modal-body">
<?php if(!empty($popupNotification['guidance_data'])):$guidanceData=$popupNotification['guidance_data'];include __DIR__.'/inc/report_guidance_view.php';else: ?><p><?=$e($popupNotification['notif_message'])?></p><?php endif; ?>
<small class="text-muted"><?=$e($popupNotification['created_at'])?></small></div><div class="modal-footer"><form method="post" class="pull-left"><input type="hidden" name="_csrf" value="<?=$e($_SESSION['csrf_token'])?>"><input type="hidden" name="action" value="mark_read"><input type="hidden" name="notif_id" value="<?=$e($popupNotification['notif_id'])?>"><button type="submit" class="btn btn-primary"><?=$t('Mark read')?></button></form><button type="button" class="btn btn-default" data-dismiss="modal"><?=$t('Close')?></button></div></div></div></div><?php endif; ?></section></div><?php include 'inc/footer.php';include 'inc/scripts.php'; ?>
<?php if($popupNotification): ?><script>jQuery(function($){$('#mcareGuidancePopup').modal('show');});</script><?php endif; ?>
