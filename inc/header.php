<?php
$sql_role = $db->prepare("SELECT role_name FROM tbl_roles WHERE role_id = ?");
$sql_role->execute([$_SESSION['log_role']]);
$role_row = $sql_role->fetch(PDO::FETCH_ASSOC);
$role = $role_row['role_name'] ?? 'User';
$isMotherAccount = (int)($_SESSION['log_role'] ?? 0) === 5;
$headerLanguage = $uiLanguage ?? 'en';
if ($isMotherAccount) {
    require_once __DIR__ . '/mother_i18n.php';
    $role = mcare_mother_t($role, $headerLanguage);
}
$headerT = fn($text) => $isMotherAccount ? mcare_mother_t($text, $headerLanguage) : $text;

// Unread notifications count
$notif_q = $db->prepare("SELECT COUNT(*) FROM tbl_notifications WHERE user_id=? AND is_read=0");
$notif_q->execute([$_SESSION['u_id']]);
$notif_count = $notif_q->fetchColumn();
$latestGuidanceId = 0;
if ($isMotherAccount) {
    $guidance_q = $db->prepare("SELECT notif_id FROM tbl_notifications WHERE user_id=? AND is_read=0 AND reference_type='symptom_guidance' ORDER BY created_at DESC,notif_id DESC LIMIT 1");
    $guidance_q->execute([$_SESSION['u_id']]);
    $latestGuidanceId = (int)($guidance_q->fetchColumn() ?: 0);
}

// Unread messages count
$msg_q = $db->prepare("SELECT COUNT(*) FROM tbl_messages WHERE receiver_id=? AND is_read=0");
$msg_q->execute([$_SESSION['u_id']]);
$msg_count = $msg_q->fetchColumn();
?>
<header class="header mcare-header">
    <div class="mcare-header-inner">
        <div class="mcare-header-start">
            <button type="button" class="mcare-menu-button visible-xs toggle-sidebar-left" data-toggle-class="sidebar-left-opened" data-target="html" data-fire-event="sidebar-left-opened" aria-label="Open navigation"><i class="fa fa-bars" aria-hidden="true"></i></button>
            <a href="home" class="mcare-brand" aria-label="M-CARE Dashboard">
                <span class="mcare-brand-icon"><i class="fa fa-heartbeat" aria-hidden="true"></i></span>
                <span class="mcare-brand-copy"><strong>M-CARE</strong><small>Maternal care coordination</small></span>
            </a>
        </div>
        <div class="mcare-header-actions">
            <nav class="mcare-header-links" aria-label="Quick links">
                <?php if ($isMotherAccount): ?>
                <a href="mother_messages" class="mcare-header-link" aria-label="<?=$headerT('Live chat')?>" title="<?=$headerT('Live chat')?>"><i class="fa fa-comments-o" aria-hidden="true"></i><?php if ($msg_count > 0): ?><span class="mcare-count"><?php echo (int)$msg_count; ?></span><?php endif; ?></a>
                <a href="mother_report" class="mcare-header-link" aria-label="<?=$headerT('Report symptoms')?>" title="<?=$headerT('Report symptoms')?>"><i class="fa fa-heartbeat" aria-hidden="true"></i></a>
                <a href="mother_updates<?=$latestGuidanceId?'?popup='.$latestGuidanceId:''?>" class="mcare-header-link" aria-label="<?=$headerT('Updates')?>" title="<?=$headerT('Updates')?>"><i class="fa fa-bell-o" aria-hidden="true"></i><?php if ($notif_count > 0): ?><span class="mcare-count"><?php echo (int)$notif_count; ?></span><?php endif; ?></a>
                <?php else: ?>
                <a href="messages" class="mcare-header-link" aria-label="Messages<?php echo $msg_count ? ', '.$msg_count.' unread' : ''; ?>" title="Messages"><i class="fa fa-envelope-o" aria-hidden="true"></i><?php if ($msg_count > 0): ?><span class="mcare-count"><?php echo (int)$msg_count; ?></span><?php endif; ?></a>
                <a href="notifications" class="mcare-header-link" aria-label="Notifications<?php echo $notif_count ? ', '.$notif_count.' unread' : ''; ?>" title="Notifications"><i class="fa fa-bell-o" aria-hidden="true"></i><?php if ($notif_count > 0): ?><span class="mcare-count"><?php echo (int)$notif_count; ?></span><?php endif; ?></a>
                <?php endif; ?>
            </nav>
            <form method="post" action="set_language" class="mcare-language-form" style="display:flex;align-items:center;gap:6px;margin-right:10px">
                <input type="hidden" name="_csrf" value="<?=htmlspecialchars($_SESSION['csrf_token'], ENT_QUOTES, 'UTF-8')?>">
                <input type="hidden" name="return_to" value="<?=htmlspecialchars(basename(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?: 'home'), ENT_QUOTES, 'UTF-8')?>">
                <label for="mcare-header-language" class="sr-only">Language / Ururimi</label>
                <select id="mcare-header-language" name="preferred_language" class="form-control input-sm" aria-label="Language / Ururimi" onchange="this.form.submit()">
                    <option value="en" <?=$headerLanguage==='en'?'selected':''?>>English</option>
                    <option value="rw" <?=$headerLanguage==='rw'?'selected':''?>>Kinyarwanda</option>
                </select>
            </form>
            <div id="userbox" class="userbox mcare-userbox">
                <button type="button" class="userbox-trigger dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" aria-label="Account menu for <?php echo htmlspecialchars($_SESSION['firstname'] . ' ' . $_SESSION['lastname'], ENT_QUOTES, 'UTF-8'); ?>">
                    <span class="profile-avatar" aria-hidden="true"><?php echo htmlspecialchars(strtoupper(substr($_SESSION['firstname'],0,1).substr($_SESSION['lastname'],0,1)), ENT_QUOTES, 'UTF-8'); ?></span>
                    <span class="profile-info"><span class="name"><?php echo htmlspecialchars($_SESSION['firstname'] . ' ' . $_SESSION['lastname']); ?></span><span class="role"><?php echo htmlspecialchars($role); ?></span></span>
                    <i class="fa fa-chevron-down custom-caret" aria-hidden="true"></i>
                </button>
                <div class="dropdown-menu"><ul class="list-unstyled"><li><a href="profile"><i class="fa fa-user-o"></i> <?=$headerT('My Profile')?></a></li><li><a href="update_password"><i class="fa fa-lock"></i> <?=$headerT('Change Password')?></a></li><li class="divider"></li><li><a href="logout"><i class="fa fa-sign-out"></i> <?=$headerT('Sign out')?></a></li></ul></div>
            </div>
        </div>
    </div>
</header>
