<?php
include("inc/connect.php");
if (isset($_SESSION['sess_id'])) {
    $db->prepare("UPDATE tbl_user_session SET time_logout=?, status='OFF' WHERE sess_id=?")
       ->execute([date("Y-m-d H:i:s"), $_SESSION['sess_id']]);
}
session_destroy();
header('Location: index.php');
exit;
