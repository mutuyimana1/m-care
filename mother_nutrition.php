<?php
require_once __DIR__ . '/inc/mother_session.php';
$notice='';$error='';
if($_SERVER['REQUEST_METHOD']==='POST'&&($_POST['action']??'')==='checkin'){
    try{
        $q=$db->prepare("SELECT pregnancy_id FROM tbl_pregnancies WHERE mother_id=? AND pregnancy_status='active' ORDER BY created_at DESC LIMIT 1");$q->execute([$motherId]);$pregnancyId=$q->fetchColumn()?:null;
        $meals=max(0,min(10,(int)($_POST['meals']??0)));
        $db->prepare('INSERT INTO tbl_nutrition_checkins(mother_id,pregnancy_id,checkin_date,meals_per_day,has_eaten,fruit_vegetable,nausea_or_difficulty,food_access_difficulty,notes,recorded_by) VALUES(?,?,?,?,?,?,?,?,?,?)')->execute([$motherId,$pregnancyId,date('Y-m-d'),$meals,isset($_POST['eaten']),isset($_POST['produce']),isset($_POST['difficulty']),isset($_POST['food_access']),trim($_POST['nutrition_notes']??''),(int)$_SESSION['u_id']]);
        $notice=$language==='rw'?'Amakuru ku mirire yabitswe.':'Your nutrition check-in was saved.';
    }catch(Throwable $ex){$error=$t('We could not save that request. Please try again or contact your care team.');}
}
$q=$db->prepare('SELECT checkin_date,meals_per_day,has_eaten,fruit_vegetable,nausea_or_difficulty,food_access_difficulty,notes FROM tbl_nutrition_checkins WHERE mother_id=? ORDER BY checkin_date DESC,created_at DESC LIMIT 30');$q->execute([$motherId]);$checkins=$q->fetchAll(PDO::FETCH_ASSOC);
$page_title=$t('Nutrition check-in');include 'inc/links.php';include 'inc/header.php';
?>
<div class="inner-wrapper"><?php include 'inc/sidebar.php'; ?><section role="main" class="content-body"><?php include 'inc/inner-header.php'; ?>
<?php if($notice): ?><div class="alert alert-success"><?=$e($notice)?></div><?php endif; ?><?php if($error): ?><div class="alert alert-danger"><?=$e($error)?></div><?php endif; ?>
<section class="panel"><header class="panel-heading"><h2 class="panel-title"><?=$t('Nutrition check-in')?></h2></header><div class="panel-body">
<p><?=$t('A simple check-in helps your care team understand your nutrition needs. It is not a diet or medical assessment.')?></p>
<form method="post" class="mcare-nutrition-form"><input type="hidden" name="_csrf" value="<?=$e($_SESSION['csrf_token'])?>"><input type="hidden" name="action" value="checkin">
<div class="row"><div class="col-sm-4"><div class="form-group"><label for="nutrition-meals"><?=$t('Meals today')?></label><input id="nutrition-meals" class="form-control" type="number" min="0" max="10" name="meals" value="0"></div></div></div>
<div class="row"><div class="col-sm-6"><label class="checkbox"><input type="checkbox" name="eaten"> <?=$t('I have eaten today')?></label><label class="checkbox"><input type="checkbox" name="produce"> <?=$t('I have had fruit or vegetables')?></label></div><div class="col-sm-6"><label class="checkbox"><input type="checkbox" name="difficulty"> <?=$t('Nausea or difficulty eating')?></label><label class="checkbox"><input type="checkbox" name="food_access"> <?=$t('Difficulty getting enough food')?></label></div></div>
<div class="form-group"><label for="nutrition-notes"><?=$t('Notes (optional)')?></label><textarea id="nutrition-notes" class="form-control" name="nutrition_notes" rows="3"></textarea></div>
<button class="btn btn-primary" type="submit"><i class="fa fa-check" aria-hidden="true"></i> <?=$t('Save check-in')?></button></form>
</div></section>
<section class="panel"><header class="panel-heading"><h2 class="panel-title"><?=$t('Recent check-ins')?></h2></header><div class="panel-body">
<?php if(!$checkins): ?><p class="text-muted"><?=$t('No check-ins saved yet.')?></p><?php else: ?><ul class="list-unstyled">
<?php foreach($checkins as $c): ?><li class="well mcare-update-item"><div class="mcare-update-heading"><div><strong><?=$t('Nutrition check-in')?></strong> · <?=$e($c['checkin_date'])?></div></div>
<p class="mcare-update-message"><strong><?=$t('Meals today')?>:</strong> <?=$e($c['meals_per_day']??0)?> · <strong><?=$t('I have eaten today')?>:</strong> <?=$c['has_eaten']?$t('Yes'):$t('No')?> · <strong><?=$t('I have had fruit or vegetables')?>:</strong> <?=$c['fruit_vegetable']?$t('Yes'):$t('No')?></p>
<p class="mcare-update-message"><strong><?=$t('Nausea or difficulty eating')?>:</strong> <?=$c['nausea_or_difficulty']?$t('Yes'):$t('No')?> · <strong><?=$t('Difficulty getting enough food')?>:</strong> <?=$c['food_access_difficulty']?$t('Support requested'):$t('No')?></p>
<?php if(trim((string)$c['notes'])!==''): ?><p class="mcare-update-message"><strong><?=$t('Notes')?>:</strong> <?=$e($c['notes'])?></p><?php endif; ?></li><?php endforeach; ?>
</ul><?php endif; ?>
</div></section>
</section></div><?php include 'inc/footer.php';include 'inc/scripts.php'; ?>
