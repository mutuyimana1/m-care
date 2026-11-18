<?php
function hashUserPassword($password) {
    return password_hash($password, PASSWORD_BCRYPT);
}
function verifyUserPassword($password, $hash) {
    return password_verify($password, $hash);
}
