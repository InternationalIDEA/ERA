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

$user_id = $_POST['user_id'];
$email = $_POST['email'];
$hash = $_POST['token'];
$user_data_id = $_POST['user_data_id'];
$user_data_blocked = $_POST['user_data_blocked'];

if ($user_data_blocked !== "1" && $user_data_blocked !== "0") {
    StatusResponse(400, $str["400_failed_block"]);
}

// Check if account an admin
$sql_admin = "SELECT user_id FROM `tbl_user` WHERE `user_id` = '$user_id' AND `email` = '$email' AND `hash` = '$hash' AND `admin` = '1'";
if (!mysqli_num_rows(mysqli_query($conn, $sql_admin))) {
    StatusResponse(403, $str["403_not_an_admin"]);
}

$sql = "UPDATE tbl_user SET blocked = '$user_data_blocked' WHERE `user_id` = '$user_data_id'";
if (mysqli_query($conn, $sql)) {
    $sql_exist = "SELECT `email` FROM `tbl_user` WHERE `user_id` = '$user_data_id' AND `blocked` = '$user_data_blocked'";
    if (mysqli_num_rows(mysqli_query($conn, $sql_exist))) {
        if ($user_data_blocked === "1") {
            StatusResponse(200, $str["200_user_blocked"]);
        } else if ($user_data_blocked === "0") {
            StatusResponse(200, $str["200_user_unblocked"]);
        }
    } else {
        StatusResponse(400, $str["400_failed_block"]);
    }
} else {
    StatusResponse(400, $str["400_failed_block"]);
}

mysqli_close($conn);
