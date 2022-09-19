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

// Check if account an admin
$sql_admin = "SELECT user_id, admin FROM `tbl_user` WHERE `user_id` = '$user_id' AND `email` = '$email' AND `hash` = '$hash' AND `admin` = '1'";
if (!mysqli_num_rows(mysqli_query($conn, $sql_admin))) {
    StatusResponse(403, $str["403_not_an_admin"]);
}

// Load User Data
$sql = "SELECT tbl_user.user_id, email, verified, admin, blocked, tbl_user_data.*  FROM `tbl_user` JOIN `tbl_user_data` ON tbl_user.user_id = tbl_user_data.user_id";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
    $data = array();
    while ($row = $result->fetch_assoc()) {
        $row_data = array(
            "user_id" => $row["user_id"],
            "email" => $row["email"],
            "admin" => $row["admin"],
            "verified" => $row["verified"],
            "blocked" => $row["blocked"],
            "title" => $row["title"],
            "first_name" => $row["first_name"],
            "last_name" => $row["last_name"],
            "institution_name" => $row["institution_name"],
            "department" => $row["department"],
            "country" => $row["country"],
            "expertise_field_of_issue" => $row["expertise_field_of_issue"],
            "institution_email" => $row["institution_email"],
            "institution_phone_number" => $row["institution_phone_number"],
            "created_at" => $row["created_at"],
            "updated_at" => $row["updated_at"]
        );
        array_push($data, $row_data);
    }
    StatusResponse(200, $str["200_ok"], $data);
} else {
    StatusResponse(404, $str["404_user_not_exist"]);
}

mysqli_close($conn);
