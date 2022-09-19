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

// Login
$sql = "SELECT user_id, email, verified, blocked FROM `tbl_user` WHERE `email` = '$email' AND `hash` = '$hash'";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        if ($row["verified"] == '1') {
            if ($row["blocked"] == '1') {
                StatusResponse(401, $str["401_account_blocked"], array(), false);
            } else {
                $data_row = array(
                    "email" => $email,
                    "hash" => $hash,
                    "user_id" => $row["user_id"]
                );
                StatusResponse(202, $str["202_login_success"], $data_row, true);
            }
        } else {
            // Send Email Verification
            include '../email_sender.php';
            $user_id = $row["user_id"];
            $m_mail = email_account_verification($url,  $user_id,  $email,  $hash);

            send_email_html($email, $m_mail["subject"], $m_mail["message"]);
            StatusResponse(401, $str["401_verify_email"], array(), false);
        }
    }
} else {
    // Check if account exist
    $sql_exist = "SELECT `email` FROM `tbl_user` WHERE `email` = '$email'";
    if (mysqli_num_rows(mysqli_query($conn, $sql_exist))) {
        StatusResponse(401, $str["401_wrong_password"], array(), false);
    } else {
        StatusResponse(401, $str["401_account_not_exist"], array(), false);
    }
}

mysqli_close($conn);
