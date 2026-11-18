<?php
require_once __DIR__ . '/inc/connect.php';
require_once __DIR__ . '/inc/auth.php';

$language=(string)($_POST['preferred_language']??'');
if(!in_array($language,['en','rw'],true)){http_response_code(422);exit('Choose English or Kinyarwanda.');}
$userId=(int)$_SESSION['u_id'];
$db->beginTransaction();
try{
    $db->prepare('UPDATE tbl_users SET preferred_language=? WHERE u_id=? AND is_active=1')->execute([$language,$userId]);
    if((int)$_SESSION['log_role']===5)$db->prepare('UPDATE tbl_mothers m JOIN tbl_users u ON u.mother_id=m.mother_id SET m.preferred_language=? WHERE u.u_id=? AND m.is_active=1')->execute([$language,$userId]);
    audit_log($db,$userId,'UPDATE_INTERFACE_LANGUAGE','tbl_users',$userId,null,['preferred_language'=>$language]);
    $db->commit();
}catch(Throwable $ex){if($db->inTransaction())$db->rollBack();throw $ex;}
$returnTo=basename((string)($_POST['return_to']??'home'));
if(!in_array('*',$allowed,true)&&!in_array($returnTo,$allowed,true))$returnTo='home';
header('Location: '.$returnTo);
exit;
