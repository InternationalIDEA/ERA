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
$data_id = $_POST['data_id'];
$status = $_POST['status'];

// Check if account an admin
$sql_admin = "SELECT user_id FROM `tbl_user` WHERE `user_id` = '$user_id' AND `email` = '$email' AND `hash` = '$hash' AND `admin` = '1'";
if (!mysqli_num_rows(mysqli_query($conn, $sql_admin))) {
    StatusResponse(403, $str["403_not_an_admin"]);
}

$sql = "UPDATE tbl_workshop SET status = '$status' WHERE `data_id` = '$data_id'";
if (mysqli_query($conn, $sql)) {
    $sql_exist = "SELECT `title` FROM `tbl_workshop` WHERE `data_id` = '$data_id' AND `status` = '$status'";
    if (mysqli_num_rows(mysqli_query($conn, $sql_exist))) {
        StatusResponse(200, $str["200_status_changed"] . $status);
    } else {
        StatusResponse(400, $str["400_failed_change_map_data_status"]);
    }
} else {
    StatusResponse(400, $str["400_failed_change_map_data_status"]);
}

mysqli_close($conn);
