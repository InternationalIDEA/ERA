<?php
if (!defined('included')) {
    header('HTTP/1.0 404 Not Found');
    die;
}

$httpHost = $_SERVER['HTTP_HOST'];

function send_email($email, $subject, $message)
{
    global $httpHost;
    $to      = $email;
    $headers = 'From: Electoral Redistricting App <no-reply@' . $httpHost . '>' . "\r\n" .
        'X-Mailer: PHP/' . phpversion();

    mail($to, $subject, $message, $headers);
}

function send_email_html($email, $subject, $message)
{
    global $httpHost;
    $to      = $email;
    $from = 'Electoral Redistricting App <no-reply@' . $httpHost . '>';

    // To send HTML mail, the Content-type header must be set
    $headers  = 'MIME-Version: 1.0' . "\r\n";
    $headers .= 'Content-type: text/html; charset=iso-8859-1' . "\r\n";

    // Create email headers
    $headers .= 'From: ' . $from . "\r\n" .
        'X-Mailer: PHP/' . phpversion();

    mail($to, $subject, $message, $headers);
}

// Please Change the URL Image if the image not load
$logoURL = 'http' . (empty($_SERVER['HTTPS']) ? '' : 's') . '://' . $httpHost . '/api/logo.png';
$logoBase64 = "<img alt='logo' style='width: 10em; margin-right: auto; margin-left: auto; display: block;' src='$logoURL'/>";

function email_map_data_uploaded($url, $data_id,  $email)
{
    global $logoBase64;
    $subject = "User Uploaded a Data";
    $link =  $url . "/" . $data_id;

    $message = '<html><body style="background-color: #C1CAD1; padding: 3em;">';
    $message .= '<div style="max-width: 500px; margin-right: auto; margin-left: auto; background-color: #fff; padding: 2em;">';
    $message .= $logoBase64;
    $message .= '<h2 style="text-align: center;">' . $email . ' has uploaded a data</h2>';
    $message .= '<p style="text-align: center;">Click this button to view the data.</p>';
    $message .= '<a href="' . $link . '" target="_blank" style="background-color: #f38336; font-weight: bold; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; margin: auto; font-size: 16px; cursor: pointer; display: flex; width: fit-content;">View Data</a>';
    $message .= '<p style="text-align: center; margin-bottom: 0;">Button not working? Paste this link into your browser:</p>';
    $message .= '<p style="text-align: center;">' . $link . '</p>';
    $message .= '<div style="width: 100%; border-bottom: 1px solid #C1CAD1;"></div>';
    $message .= '<p style="text-align: center; color: darkgray">*This email was sent because you recently registered for Electoral Redistricting App administrator. If you believe this is an error, ignore this message.</p>';
    $message .= '</div>';
    $message .= '</body></html>';

    return array(
        "message" => $message,
        "subject" => $subject,
    );
}

function email_account_verification($url,  $user_id,  $email,  $hash)
{
    global $logoBase64;
    $subject = "Account Verification";
    $link =  $url . "/" . $user_id . "/" . $email . "/" . $hash;

    $message = '<html><body style="background-color: #C1CAD1; padding: 3em;">';
    $message .= '<div style="max-width: 500px; margin-right: auto; margin-left: auto; background-color: #fff; padding: 2em;">';
    $message .= $logoBase64;
    $message .= '<h2 style="text-align: center;">Please verify your email address</h2>';
    $message .= '<p style="text-align: center;">Click this button to verify your email address and finish setting up your account.</p>';
    $message .= '<a href="' . $link . '" target="_blank" style="background-color: #f38336; font-weight: bold; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; margin: auto; font-size: 16px; cursor: pointer; display: flex; width: fit-content;">Verify My Email</a>';
    $message .= '<p style="text-align: center;">Button not working? Paste this link into your browser:</p>';
    $message .= '<p style="text-align: center;">' . $link . '</p>';
    $message .= '<div style="width: 100%; border-bottom: 1px solid #C1CAD1;"></div>';
    $message .= '<p style="text-align: center; color: darkgray">*This email was sent because you recently registered for Electoral Redistricting App account. If you believe this is an error, ignore this message.</p>';
    $message .= '</div>';
    $message .= '</body></html>';

    return array(
        "message" => $message,
        "subject" => $subject,
    );
}

function email_reset_password_verification($url,  $user_id,  $email,  $hash)
{
    global $logoBase64;
    $subject = "Reset Password Verification";
    $link =  $url . "/" . $user_id . "/" . $email . "/" . $hash;

    $message = '<html><body style="background-color: #C1CAD1; padding: 3em;">';
    $message .= '<div style="max-width: 500px; margin-right: auto; margin-left: auto; background-color: #fff; padding: 2em;">';
    $message .= $logoBase64;
    $message .= '<h2 style="text-align: center;">Reset Password Verification</h2>';
    $message .= '<p style="text-align: center;">Click this button to reset your password.</p>';
    $message .= '<a href="' . $link . '" target="_blank" style="background-color: #f38336; font-weight: bold; border: none; color: white; padding: 15px 32px; text-align: center; text-decoration: none; margin: auto; font-size: 16px; cursor: pointer; display: flex; width: fit-content;">Reset My Password</a>';
    $message .= '<p style="text-align: center;">Button not working? Paste this link into your browser:</p>';
    $message .= '<p style="text-align: center;">' . $link . '</p>';
    $message .= '<div style="width: 100%; border-bottom: 1px solid #C1CAD1;"></div>';
    $message .= '<p style="text-align: center; color: darkgray">*This email was sent because you recently registered for Electoral Redistricting App account. If you believe this is an error, ignore this message.</p>';
    $message .= '</div>';
    $message .= '</body></html>';

    return array(
        "message" => $message,
        "subject" => $subject,
    );
}

function email_resetting_password($new_password)
{
    global $logoBase64;
    $subject = "Password Changed";

    $message = '<html><body style="background-color: #C1CAD1; padding: 3em;">';
    $message .= '<div style="max-width: 500px; margin-right: auto; margin-left: auto; background-color: #fff; padding: 2em;">';
    $message .= $logoBase64;
    $message .= '<h2 style="text-align: center;">Your Password Has Changed</h2>';
    $message .= '<p style="text-align: center;">Your new password is : <b>' . $new_password . '</b></p>';
    $message .= '<div style="width: 100%; border-bottom: 1px solid #C1CAD1;"></div>';
    $message .= '<p style="text-align: center; color: darkgray">*This email was sent because you recently registered for Electoral Redistricting App account. If you believe this is an error, ignore this message.</p>';
    $message .= '</div>';
    $message .= '</body></html>';

    return array(
        "message" => $message,
        "subject" => $subject,
    );
}
