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

$type = $_POST['type'];
$user_id = $_POST['user_id'];
$email = $_POST['email'];
$hash = $_POST['token'];

if ($type === "password") {
    $password =  $_POST['new_password'];
    if (strlen($password) < 8) {
        StatusResponse(422, $str["422_password_too_short"]);
    }
    $new_hash = hash('sha256', $password);

    // change password
    $sql = "UPDATE tbl_user SET hash = '$new_hash', updated_at = now() WHERE `user_id` = '$user_id' AND `email` = '$email' AND `hash` = '$hash'";
    if (mysqli_query($conn, $sql)) {
        $sql_exist = "SELECT `email` FROM `tbl_user` WHERE `user_id` = '$user_id' AND `email` = '$email' AND `hash` = '$new_hash'";
        if (mysqli_num_rows(mysqli_query($conn, $sql_exist))) {
            $data_row = array(
                "email" => $email,
                "hash" => $new_hash,
                "user_id" => $user_id
            );
            StatusResponse(200, $str["200_password_change_success"], $data_row);
        } else {
            StatusResponse(400, $str["400_failed_change_password"]);
        }
    } else {
        StatusResponse(422, $str["422_failed_change_password"]);
    }
} elseif ($type === "data") {
    $title = $_POST['title'];
    $first_name = $_POST['first_name'];
    $last_name = $_POST['last_name'];
    $institution_name = $_POST['institution_name'];
    $department = $_POST['department'];
    $country = $_POST['country'];
    $expertise_field_of_issue = $_POST['expertise_field_of_issue'];
    $institution_email = $_POST['institution_email'];
    $institution_phone_number = $_POST['institution_phone_number'];

    foreach (array($title, $first_name, $last_name, $institution_name, $department, $country, $expertise_field_of_issue, $institution_email, $institution_phone_number) as $value) {
        if (empty($value)) {
            StatusResponse(422, $str["422_fill_required_data"]);
        }
    }

    // Check if account exist
    $sql_exist = "SELECT `user_id` FROM `tbl_user` WHERE `user_id` = '$user_id' AND `email` = '$email' AND `hash` = '$hash'";
    if (mysqli_num_rows(mysqli_query($conn, $sql_exist))) {
        // update user data
        $sql = "UPDATE tbl_user_data SET 
                title = '$title',
                first_name = '$first_name',
                last_name = '$last_name',
                institution_name = '$institution_name',
                department = '$department',
                country = '$country',
                expertise_field_of_issue = '$expertise_field_of_issue',
                institution_email = '$institution_email',
                institution_phone_number = '$institution_phone_number', 
                updated_at = now()
            WHERE `user_id` = '$user_id'";
        if (mysqli_query($conn, $sql)) {
            StatusResponse(200, $str["200_success_update_data"]);
        } else {
            StatusResponse(422, $str["422_failed_update_data"]);
        }
    } else {
        StatusResponse(401, $str["401_wrong_password"]);
    }
} else {
    StatusResponse(400, $str["400_failed_process"]);
}

mysqli_close($conn);
