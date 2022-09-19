<?php
header('Access-Control-Allow-Origin: *');
define('included', TRUE);
include '../method_request.php';
POST_ONLY();
include '../list_response_text.php';

$token = $_POST['token'];
$password = $_POST['password'];
$hash = hash('sha256', $password);

// Validate Form
if ($hash === $token) {
    StatusResponse(200, $str["200_password_match"]);
} else {
    StatusResponse(403, $str["403_password_not_match"]);
}
