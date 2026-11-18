<!doctype html>
<?php
$uiLanguage='en';
if(isset($_SESSION['u_id'])){
    try{$langQ=$db->prepare('SELECT preferred_language FROM tbl_users WHERE u_id=? AND is_active=1');$langQ->execute([(int)$_SESSION['u_id']]);$uiLanguage=$langQ->fetchColumn()==='rw'?'rw':'en';}
    catch(Throwable $ignored){$uiLanguage=((int)($_SESSION['log_role']??0)===5&&($_SESSION['preferred_language']??'')==='rw')?'rw':'en';}
}
?>
<html class="fixed" lang="<?=$uiLanguage==='rw'?'rw':'en'?>" data-ui-language="<?=$uiLanguage?>">
<head>
    <meta charset="UTF-8">
    <title><?php echo htmlspecialchars($com_name); ?></title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="shortcut icon" href="assets/uploads/logo/<?php echo $com_logo; ?>" type="image/x-icon" />

    <link rel="stylesheet" href="assets/vendor/bootstrap/css/bootstrap.css" />
    <link rel="stylesheet" href="assets/vendor/font-awesome/css/font-awesome.css" />
    <link rel="stylesheet" href="assets/vendor/magnific-popup/magnific-popup.css" />
    <link rel="stylesheet" href="assets/vendor/bootstrap-datepicker/css/datepicker3.css" />
    <link rel="stylesheet" href="assets/vendor/select2/select2.css" />
    <link rel="stylesheet" href="assets/vendor/jquery-ui/css/ui-lightness/jquery-ui-1.10.4.custom.css" />
    <link rel="stylesheet" href="assets/vendor/bootstrap-multiselect/bootstrap-multiselect.css">
    <link rel="stylesheet" href="assets/vendor/jquery-datatables-bs3/assets/css/datatables.css" />
    <link rel="stylesheet" href="assets/vendor/summernote/summernote.css" />
    <link rel="stylesheet" href="assets/stylesheets/theme.css" />
    <link rel="stylesheet" href="assets/stylesheets/skins/default.css" />
    <link rel="stylesheet" href="assets/stylesheets/theme-custom.css">
    <link rel="stylesheet" href="assets/stylesheets/mcare.css">
    <?php if (basename($_SERVER['SCRIPT_NAME'] ?? '') === 'mother_roadmap.php'): ?><link rel="stylesheet" href="assets/care_roadmap.css"><?php endif; ?>
    <?php if (basename($_SERVER['SCRIPT_NAME'] ?? '') === 'ivr_dashboard.php'): ?><link rel="stylesheet" href="assets/ivr.css"><?php endif; ?>
    <script src="assets/vendor/modernizr/modernizr.js"></script>
    <style>
        .alert-critical { background:#c0392b; color:#fff; }
        .alert-high     { background:#e74c3c; color:#fff; }
        .alert-medium   { background:#e67e22; color:#fff; }
        .alert-low      { background:#f1c40f; color:#333; }
        .badge-critical { background:#c0392b; }
        .badge-high     { background:#e74c3c; }
        .badge-medium   { background:#e67e22; }
        .badge-low      { background:#f39c12; }
        .mcare-pink     { color:#e91e8c; }
    </style>
</head>
<body>
<section class="body">
