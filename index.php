<?php
include("inc/connect.php");
include("inc/password_security.php");

if (isset($_SESSION['u_id'])) { header('Location: home'); exit; }

if (empty($_SESSION['login_csrf'])) $_SESSION['login_csrf'] = bin2hex(random_bytes(32));

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['usn'], $_POST['pwd'])) {
    if (!isset($_POST['_csrf']) || !hash_equals($_SESSION['login_csrf'], (string)$_POST['_csrf'])) {
        $msge = 'Your sign-in session expired. Reload this page and try again.';
    } else {
    $identifier = trim($_POST['usn']);
    $query = $db->prepare("SELECT * FROM tbl_users WHERE usn = ? OR email = ? LIMIT 1");
    $query->execute([$identifier, $identifier]);
    $row = $query->fetch(PDO::FETCH_ASSOC);

    if (!$row || !verifyUserPassword($_POST['pwd'], $row['pwd'])) {
        $msge = "Incorrect Username or Password";
    } elseif ((int)$row['is_active'] === 0) {
        $msge = "Your account is not active. Please contact your administrator";
    } elseif ((int)$row['log_status'] !== 1) {
        $msge = "Your account is disabled. Please contact your administrator";
    } else {
        session_regenerate_id(true);
        $_SESSION['u_id']       = $row['u_id'];
        $_SESSION['firstname']  = $row['f_name'];
        $_SESSION['lastname']   = $row['l_name'];
        $_SESSION['email']      = $row['email'];
        $_SESSION['log_role']   = $row['log_role'];
        $_SESSION['facility_id'] = $row['facility_id'];
        $_SESSION['user_id']    = $row['u_id'];
        $_SESSION['username']   = $row['usn'];
        $_SESSION['sess_id']    = bin2hex(random_bytes(16));

        $today = date("Y-m-d H:i:s");
        $ip    = $_SERVER['REMOTE_ADDR'] ?? '';
        $fullName = trim($row['f_name'] . ' ' . $row['l_name']);

        $db->prepare("INSERT INTO tbl_user_session (sess_id,username,ip,time_login,status) VALUES (?,?,?,?,?)")
           ->execute([$_SESSION['sess_id'], $fullName, $ip, $today, 'ON']);
        $db->prepare("UPDATE tbl_users SET last_logged_in=? WHERE u_id=?")
           ->execute([$today, $row['u_id']]);

        $pwdStatus = $db->prepare("SELECT password_updated FROM tbl_password_updates WHERE user_id=? LIMIT 1");
        $pwdStatus->execute([$row['u_id']]);
        $passwordUpdated = (int)$pwdStatus->fetchColumn() === 1;
        $_SESSION['password_change_required'] = !$passwordUpdated;

        header('Location: ' . ($passwordUpdated ? 'home' : 'update_password'));
        exit;
    }
    }
}
?>
<!doctype html>
<html>
<head>
    <meta charset="UTF-8">
    <title>M-CARE &mdash; Login</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="theme-color" content="#eaf2ff">
    <link rel="stylesheet" href="assets/vendor/font-awesome/css/font-awesome.css" />
    <style>
        :root{--navy:#15274d;--blue:#426be8;--muted:#7886a0;--line:#d7e1f1}
        *{box-sizing:border-box}body{margin:0;min-height:100vh;padding:34px;background:#eaf2ff url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='700' height='700' viewBox='0 0 700 700'%3E%3Cpath d='M0 0h700v160C520 120 490 300 335 290S155 155 0 270z' fill='%23dfeaff' opacity='.55'/%3E%3Cpath d='M700 700H0V550c150 20 195-100 355-90s205 120 345 28z' fill='%23dfeaff' opacity='.6'/%3E%3C/svg%3E") center/cover fixed;font-family:'DM Sans',Arial,sans-serif;color:var(--navy);display:grid;place-items:center}
        .login-shell{width:min(1120px,100%);min-height:570px;background:#fff;border-radius:20px;overflow:hidden;display:grid;grid-template-columns:42% 58%;box-shadow:0 28px 70px rgba(50,82,137,.2);position:relative}
        .login-panel{padding:56px clamp(30px,5.2vw,74px);display:flex;flex-direction:column;justify-content:center;position:relative;z-index:2;background:white}
        .brand{display:flex;align-items:center;gap:11px;margin-bottom:43px}.brand-mark{width:42px;height:42px;border-radius:13px;background:#edf2ff;color:var(--blue);display:grid;place-items:center;font-size:20px}.brand-name{font:800 18px 'Manrope',sans-serif;letter-spacing:.11em;color:var(--navy)}.brand-caption{font-size:10px;color:var(--muted);letter-spacing:.035em;margin-top:2px}
        .login-heading{font:800 32px 'Manrope',sans-serif;margin:0 0 7px;color:#14264d;letter-spacing:-.04em}.login-intro{font-size:14px;color:#7a879d;margin:0 0 31px}.login-form label{font-size:12px;font-weight:700;margin:0 0 8px;color:#40516e}.field{position:relative;margin-bottom:18px}.field-icon{position:absolute;left:14px;top:13px;color:#8292ad;font-size:14px}.login-input{width:100%;height:46px;padding:0 42px;border:1px solid var(--line);border-radius:7px;outline:none;color:var(--navy);font:14px 'DM Sans',sans-serif;transition:.2s;background:#fff}.login-input::placeholder{color:#a7b1c3}.login-input:focus{border-color:#6689f4;box-shadow:0 0 0 3px rgba(66,107,232,.12)}.password-toggle{position:absolute;right:12px;top:11px;border:0;background:transparent;color:#8492aa;padding:4px;cursor:pointer}.login-meta{display:flex;justify-content:flex-end;margin:-6px 0 20px}.login-meta a,.support a{color:#4168da;text-decoration:none;font-weight:600;font-size:12px}.btn-login{border:0;border-radius:7px;background:linear-gradient(100deg,#4d75ed,#3c63dd);color:#fff;width:100%;height:46px;font:700 14px 'DM Sans',sans-serif;box-shadow:0 7px 14px rgba(67,103,223,.19);cursor:pointer;transition:.2s}.btn-login:hover{background:#345bd0;transform:translateY(-1px)}.btn-login i{margin-left:7px}.login-error{border:1px solid #f2c6c6;border-radius:7px;background:#fff3f3;color:#9a3434;font-size:12px;padding:11px 12px;margin:-13px 0 19px;line-height:1.5}.login-foot{margin-top:25px;color:#8995a8;font-size:11px;display:flex;align-items:center;justify-content:center;gap:7px}.login-foot i{color:#54816d}.support{margin-top:17px;text-align:center;font-size:11px;color:#8995a8}
        .login-visual{position:relative;overflow:hidden;background:linear-gradient(145deg,#d5e5ff,#bcd5fb);min-height:570px}.login-visual:before{content:"";position:absolute;z-index:1;left:-120px;top:-4%;height:108%;width:230px;background:#fff;border-radius:0 52% 52% 0 / 0 38% 62% 0;box-shadow:12px 0 18px rgba(80,121,202,.11)}.login-visual img{position:absolute;width:100%;height:100%;inset:0;object-fit:cover}.visual-caption{position:absolute;right:30px;bottom:26px;z-index:2;background:rgba(255,255,255,.76);backdrop-filter:blur(9px);border:1px solid rgba(255,255,255,.75);border-radius:12px;padding:12px 16px;max-width:250px;box-shadow:0 8px 25px rgba(52,84,144,.09)}.visual-caption strong{display:block;font:700 13px 'Manrope',sans-serif;color:#253b6d;margin-bottom:3px}.visual-caption span{font-size:11px;color:#667895;line-height:1.5}.caption-caret{display:inline-block;width:1px;height:12px;background:#426be8;margin-left:2px;vertical-align:-2px;animation:caretBlink .8s steps(2,start) infinite}@keyframes caretBlink{to{visibility:hidden}}.caption-sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}@media(prefers-reduced-motion:reduce){.caption-caret{display:none}}
        @media(max-width:760px){body{padding:18px}.login-shell{grid-template-columns:1fr;min-height:unset;max-width:460px}.login-panel{padding:34px 30px 29px}.brand{margin-bottom:31px}.login-heading{font-size:29px}.login-visual{min-height:230px;grid-row:1}.login-visual:before{left:-5%;top:auto;bottom:-120px;width:110%;height:175px;border-radius:50% 50% 0 0}.login-visual img{object-fit:cover;object-position:center 40%}.visual-caption{right:14px;bottom:12px;padding:9px 12px}.visual-caption strong{font-size:12px}.visual-caption span{font-size:10px}.brand{margin-bottom:27px}}
        @media(max-width:380px){body{padding:10px}.login-panel{padding:28px 22px}.login-visual{min-height:190px}}
    </style>
</head>
<body>
<main class="login-shell">
    <section class="login-panel" aria-labelledby="login-title">
    <div class="brand"><span class="brand-mark"><i class="fa fa-heartbeat" aria-hidden="true"></i></span><div><div class="brand-name">M-CARE</div><div class="brand-caption">MATERNAL CARE COORDINATION</div></div></div>
    <h1 class="login-heading" id="login-title">Welcome back</h1>
    <p class="login-intro">Sign in to your care team workspace.</p>
    <?php if (!empty($msge)): ?>
        <div class="login-error" role="alert"><i class="fa fa-exclamation-circle"></i> <?php echo htmlspecialchars($msge); ?></div>
    <?php endif; ?>
    <form method="POST" class="login-form" autocomplete="on">
        <input type="hidden" name="_csrf" value="<?php echo htmlspecialchars($_SESSION['login_csrf'], ENT_QUOTES, 'UTF-8'); ?>">
        <div class="field"><label for="usn">Username or email</label><span class="field-icon"><i class="fa fa-user-o" aria-hidden="true"></i></span><input id="usn" type="text" name="usn" class="login-input" placeholder="Enter your username" autocomplete="username" required autofocus></div>
        <div class="field"><label for="pwd">Password</label><span class="field-icon"><i class="fa fa-lock" aria-hidden="true"></i></span><input id="pwd" type="password" name="pwd" class="login-input" placeholder="Enter your password" autocomplete="current-password" required><button class="password-toggle" type="button" aria-label="Show password" onclick="togglePassword()"><i class="fa fa-eye" aria-hidden="true"></i></button></div>
        <div class="login-meta"><a href="mailto:<?php echo htmlspecialchars($com_email, ENT_QUOTES, 'UTF-8'); ?>?subject=M-CARE%20account%20support">Need sign-in help?</a></div>
        <button type="submit" class="btn-login">Sign in <i class="fa fa-arrow-right" aria-hidden="true"></i></button>
    </form>
    <div class="login-foot"><i class="fa fa-shield" aria-hidden="true"></i> Authorized care team access</div>
    <div class="support">Need access? Contact your M-CARE administrator.</div>
    </section>
    <aside class="login-visual" aria-label="Maternal care professional supporting a mother"><img src="assets/images/mcare-login.png" alt="A pregnant mother speaking with a healthcare professional"><div class="visual-caption"><strong>Care, connected.</strong><span class="caption-sr-only">Supporting timely guidance and follow-up for mothers and care teams.</span><span class="caption-animated" aria-hidden="true"></span><span class="caption-caret" aria-hidden="true"></span></div></aside>
</main>
<script>
function togglePassword(){var p=document.getElementById('pwd'),b=document.querySelector('.password-toggle');p.type=p.type==='password'?'text':'password';b.setAttribute('aria-label',p.type==='password'?'Show password':'Hide password');b.innerHTML=p.type==='password'?'<i class="fa fa-eye" aria-hidden="true"></i>':'<i class="fa fa-eye-slash" aria-hidden="true"></i>';}
(function(){var target=document.querySelector('.caption-animated');if(!target)return;var phrase='Supporting timely guidance and follow-up for mothers and care teams.';if(window.matchMedia('(prefers-reduced-motion: reduce)').matches){target.textContent=phrase;return;}var i=0,deleting=false;function tick(){target.textContent=phrase.slice(0,i);if(!deleting&&i<phrase.length){i++;setTimeout(tick,43);}else if(!deleting){deleting=true;setTimeout(tick,1900);}else if(i>0){i--;setTimeout(tick,24);}else{deleting=false;setTimeout(tick,550);}}tick();})();
</script>
</body>
</html>
