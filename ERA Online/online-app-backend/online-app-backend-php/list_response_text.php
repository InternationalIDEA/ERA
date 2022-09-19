<?php
if (!defined('included')) {
    header('HTTP/1.0 404 Not Found');
    die;
}

$str = array(
    "200_ok" => "OK",
    "200_user_blocked" => "User is blocked, thank you!",
    "200_user_unblocked" => "User is unblocked, thank you!",
    "200_password_match" => "Password confirmed!",
    "200_success_update_data" => "Data update successful",
    "200_password_change_success" => "Password changed successful",
    "200_account_verified" => "Your Account is verified, thank you!",
    "200_status_changed" => "Status changed to ~ ",
    "200_resend_verification" => "Resend verification, please check your email to verify your account",
    "200_password_reset_request" => "Password reset send, please check your email to resetting your password.",
    "200_password_reset" => "Your password was reset, please check your email to get your new password.",

    "201_data_upload_successfull" => "Data upload successfully, please wait for the aadministrator to accept your data.",
    "201_account_created_successfull" => "Account created successfully, please check your email to verify your account",

    "202_login_success" => "Login successful",

    "400_failed_block" => "Failed to block/unblock user",
    "400_failed_process" => "Failed to process",
    "400_failed_change_password" => "Failed to change your password",
    "400_failed_verifying_account" => "Failed to verifying your account",
    "400_failed_change_map_data_status" => "Failed to change map data status",
    "400_failed_upload_data" => "Failed to upload data",
    "400_failed_creating_account" => "Failed creating account",
    "400_failed_update_password" => "Failed to update password",

    "401_wrong_password" => "Wrong password",
    "401_account_not_exist" => "Your account doesn't exist",
    "401_account_blocked" => "You're not allowed to login",
    "401_verify_email" => "Please check your email address for verification",

    "403_not_an_admin" => "You're not an Administrator",
    "403_password_not_match" => "Password didn't match!",

    "404_user_not_exist" => "User doesn't exist",
    "404_map_data_not_exist" => "Map Data doesn't exist",

    "422_failed_update_data" => "Failed to update your data",
    "422_fill_required_data" => "Please fill the required data",
    "422_failed_change_password" => "Failed to change your password",
    "422_password_too_short" => "Password too short",
    "422_invalid_email_format" => "Invalid email format",
    "422_email_already_used" => "This email is already being used",
    "422_account_already_verified" => "Your account already verified",
);

// Response Status
function StatusResponse($code, $msg, $data = array(), $login = null)
{
    $echo_response = array(
        "message" => $msg,
        "data" => $data,
    );
    if ($login != null) {
        $echo_response["login"] = $login;
    }

    header("Content-Type: application/json");
    http_response_code($code);
    echo json_encode($echo_response);
    die();
}
