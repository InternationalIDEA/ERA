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

$url = $_POST['url'];
$email = $_POST['email'];
$password = $_POST['password'];
$hash = hash('sha256', $password);

$title = $_POST['title'];
$first_name = $_POST['first_name'];
$last_name = $_POST['last_name'];
$institution_name = $_POST['institution_name'];
$department = $_POST['department'];
$country = $_POST['country'];
$expertise_field_of_issue = $_POST['expertise_field_of_issue'];
$institution_email = $_POST['institution_email'];
$institution_phone_number = $_POST['institution_phone_number'];

// Validate Form
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    StatusResponse(422, $str["422_invalid_email_format"]);
}
if (strlen($password) < 8) {
    StatusResponse(422, $str["422_password_too_short"]);
}
foreach (array($title, $first_name, $last_name, $institution_name, $department, $country, $expertise_field_of_issue, $institution_email, $institution_phone_number) as $value) {
    if (empty($value)) {
        StatusResponse(422, $str["422_fill_required_data"]);
    }
}

// Check if email already in use
$sql_exist = "SELECT `email` FROM `tbl_user` WHERE `email` = '$email'";
if (mysqli_num_rows(mysqli_query($conn, $sql_exist))) {
    StatusResponse(422, $str["422_email_already_used"]);
}

// Generate User ID UUID
$user_id = strtoupper(bin2hex(openssl_random_pseudo_bytes(8)));

$sql = "INSERT INTO tbl_user (user_id, email, hash) VALUES ('$user_id', '$email', '$hash')";

if (mysqli_query($conn, $sql)) {
    $sql_user_data = "INSERT INTO tbl_user_data (user_id, title, first_name, last_name, institution_name, department, country, expertise_field_of_issue, institution_email, institution_phone_number) 
        VALUES ('$user_id', '$title', '$first_name', '$last_name', '$institution_name', '$department', '$country', '$expertise_field_of_issue', '$institution_email', '$institution_phone_number')";

    if (mysqli_query($conn, $sql_user_data)) {
        // Send Email Verification
        include '../email_sender.php';
        $m_mail = email_account_verification($url,  $user_id,  $email,  $hash);

        send_email_html($email, $m_mail["subject"], $m_mail["message"]);
        StatusResponse(201, $str["201_account_created_successfull"]);
    } else {
        // Delete in tbl_user if failed to create tbl_user_data
        $sql_delete_user = "DELETE FROM tbl_user WHERE user_id = '$user_id' AND email = '$email'";
        mysqli_query($conn, $sql_delete_user);
        StatusResponse(400, $str["400_failed_creating_account"]);
    }
} else {
    StatusResponse(400, $str["400_failed_creating_account"]);
}

mysqli_close($conn);
