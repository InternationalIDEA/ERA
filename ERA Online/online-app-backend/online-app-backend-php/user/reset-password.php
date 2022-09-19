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
$user_id = $_POST['id'];
$hash = $_POST['token'];
$type = $_POST['type'];

// Validate Form
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    StatusResponse(422, $str["422_invalid_email_format"]);
}

if ($type === "VERIFICATION") {
    // Check email exist
    $sql = "SELECT user_id, email, hash FROM `tbl_user` WHERE `email` = '$email' AND `verified` = '1' AND `blocked` = '0'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            // Send Email Password reset
            include '../email_sender.php';
            $user_id = $row["user_id"];
            $hash = $row["hash"];
            $m_mail = email_reset_password_verification($url,  $user_id,  $email,  $hash);

            send_email_html($email, $m_mail["subject"], $m_mail["message"]);
            StatusResponse(200, $str["200_password_reset_request"]);
        }
    } else {
        StatusResponse(401, $str["401_account_not_exist"]);
    }
} elseif ($type === "RESET") {
    // Authenticating
    $sql_exist = "SELECT `email` FROM `tbl_user` WHERE `user_id` = '$user_id' AND `email` = '$email' AND `hash` = '$hash' AND `verified` = '1' AND `blocked` = '0'";
    if (mysqli_num_rows(mysqli_query($conn, $sql_exist))) {
        // Generating new password
        $bytes = random_bytes(5);
        $new_password = bin2hex($bytes);
        $new_hash = hash('sha256', $new_password);

        // Updating Password
        $sql = "UPDATE tbl_user SET hash = '$new_hash' WHERE `user_id` = '$user_id' AND `email` = '$email'";
        if (mysqli_query($conn, $sql)) {
            $sql_updated = "SELECT `email` FROM `tbl_user` WHERE `user_id` = '$user_id' AND `email` = '$email' AND `hash` = '$new_hash'";
            if (mysqli_num_rows(mysqli_query($conn, $sql_updated))) {
                // Send Email Password reset
                include '../email_sender.php';
                $m_mail = email_resetting_password($new_password);

                send_email_html($email, $m_mail["subject"], $m_mail["message"]);
                StatusResponse(200, $str["200_password_reset"]);
            } else {
                StatusResponse(400, $str["400_failed_update_password"]);
            }
        } else {
            StatusResponse(400, $str["400_failed_update_password"]);
        }
    } else {
        StatusResponse(401, $str["401_account_not_exist"]);
    }
}

mysqli_close($conn);
