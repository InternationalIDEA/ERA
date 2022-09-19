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

// Validate Form
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    StatusResponse(422, $str["422_invalid_email_format"]);
}
if (strlen($password) < 8) {
    StatusResponse(422, $str["422_password_too_short"]);
}

// Login
$sql = "SELECT user_id, email, verified FROM `tbl_user` WHERE `email` = '$email' AND `hash` = '$hash'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        if ($row["verified"] == '1') {
            StatusResponse(422, $str["422_account_already_verified"]);
        } else {
            // Send Email Verification
            include '../email_sender.php';
            $user_id = $row["user_id"];
            $m_mail = email_account_verification($url,  $user_id,  $email,  $hash);

            send_email_html($email, $m_mail["subject"], $m_mail["message"]);
            StatusResponse(200, $str["200_resend_verification"]);
        }
    }
} else {
    // Check if account exist
    $sql_exist = "SELECT `email` FROM `tbl_user` WHERE `email` = '$email'";
    if (mysqli_num_rows(mysqli_query($conn, $sql_exist))) {
        StatusResponse(401, $str["401_wrong_password"]);
    } else {
        StatusResponse(401, $str["401_account_not_exist"]);
    }
}

mysqli_close($conn);
