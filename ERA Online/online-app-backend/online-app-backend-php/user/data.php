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
$type = $_POST['type'];

if ($type === "PROFILE") {
    // Check if account exist
    $sql_user = "SELECT user_id, admin FROM `tbl_user` WHERE `user_id` = '$user_id' AND `email` = '$email' AND `hash` = '$hash' AND `verified` = '1' AND `blocked` = '0'";
    $result_user = $conn->query($sql_user);
    if ($result_user->num_rows > 0) {
        while ($row_user = $result_user->fetch_assoc()) {
            // Load User Data
            $sql = "SELECT * FROM `tbl_user_data` WHERE `user_id` = '$user_id'";
            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $data = array(
                        "user_id" => $user_id,
                        "admin" => $row_user["admin"],
                        "email" => $email,
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
                    StatusResponse(200, $str["200_ok"], $data);
                }
            } else {
                StatusResponse(404, $str["404_user_not_exist"]);
            }
        }
    } else {
        StatusResponse(404, $str["404_user_not_exist"]);
    }
} elseif ($type === "USER") {
    $user_data_id = $_POST['user_data_id'];
    // Check if load from admin account
    $sql_user = "SELECT user_id FROM `tbl_user` WHERE `user_id` = '$user_id' AND `email` = '$email' AND `hash` = '$hash' AND `admin` = '1'";
    $result_user = $conn->query($sql_user);
    if ($result_user->num_rows > 0) {
        while ($row_user = $result_user->fetch_assoc()) {
            // Load User Data
            $sql = "SELECT tbl_user.user_id, email, verified, admin, blocked, tbl_user_data.*  FROM `tbl_user` JOIN `tbl_user_data` ON tbl_user.user_id = tbl_user_data.user_id  WHERE tbl_user.user_id = '$user_data_id'";
            $result = $conn->query($sql);

            if ($result->num_rows > 0) {
                while ($row = $result->fetch_assoc()) {
                    $data = array(
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
                    StatusResponse(200, $str["200_ok"], $data);
                }
            } else {
                StatusResponse(404, $str["404_user_not_exist"]);
            }
        }
    } else {
        // Load User Data
        $sql = "SELECT * FROM `tbl_user_data` WHERE `user_id` = '$user_data_id'";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                $data = array(
                    "user_id" => $user_data_id,
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
                StatusResponse(200, $str["200_ok"], $data);
            }
        } else {
            StatusResponse(404, $str["404_user_not_exist"]);
        }
    }
} else {
    StatusResponse(400, $str["400_failed_process"]);
}

mysqli_close($conn);
