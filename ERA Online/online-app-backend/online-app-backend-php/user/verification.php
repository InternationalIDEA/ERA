<?php
header('Access-Control-Allow-Origin: *');
define('included', TRUE);
include '../method_request.php';
POST_ONLY();
include '../db_config.php';
include '../list_response_text.php';

$conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);

if (mysqli_connect_errno()) {
    echo "Failed to connect to MySQL: " . mysqli_connect_error();
    die();
}

$user_id = $_POST['id'];
$email = $_POST['email'];
$hash = $_POST['token'];

// verification
$sql = "UPDATE tbl_user SET verified = '1' WHERE `user_id` = '$user_id' AND `email` = '$email' AND `hash` = '$hash'";
if (mysqli_query($conn, $sql)) {
    $sql_exist = "SELECT `email` FROM `tbl_user` WHERE `user_id` = '$user_id' AND `email` = '$email' AND `hash` = '$hash' AND `verified` = '1'";
    if (mysqli_num_rows(mysqli_query($conn, $sql_exist))) {
        StatusResponse(200, $str["200_account_verified"]);
    } else {
        StatusResponse(400, $str["400_failed_verifying_account"]);
    }
} else {
    StatusResponse(400, $str["400_failed_verifying_account"]);
}

mysqli_close($conn);
