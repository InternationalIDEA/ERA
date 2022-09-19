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
$user_data_id = $_POST['user_data_id'];

if ($type === "ADMIN") {
    // Check if account an admin
    $sql_admin = "SELECT user_id, admin FROM `tbl_user` WHERE `user_id` = '$user_id' AND `email` = '$email' AND `hash` = '$hash' AND `admin` = '1'";
    if (!mysqli_num_rows(mysqli_query($conn, $sql_admin))) {
        StatusResponse(403, $str["403_not_an_admin"]);
    } else {
        // Load Map Data
        $sql = "SELECT tbl_user.email, tbl_workshop.*  FROM `tbl_workshop` JOIN `tbl_user` ON tbl_workshop.user_id = tbl_user.user_id";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            $data = array();
            while ($row = $result->fetch_assoc()) {
                $row_data = array(
                    "user_id" => $row["user_id"],
                    "email" => $row["email"],
                    "data_id" => $row["data_id"],
                    "title" => $row["title"],
                    "description" => $row["description"],
                    "country" => $row["country"],
                    "electoral_district_level" => $row["electoral_district_level"],
                    "electoral_system_design" => $row["electoral_system_design"],
                    "status" => $row["status"],
                    "created_at" => $row["created_at"],
                    "updated_at" => $row["updated_at"]
                );
                array_push($data, $row_data);
            }
            StatusResponse(200, $str["200_ok"], $data);
        } else {
            StatusResponse(404, $str["404_map_data_not_exist"]);
        }
    }
} elseif ($type === "USER") {
    if ($user_id === $user_data_id) {
        // Load Map Data User
        $sql = "SELECT *  FROM `tbl_workshop` WHERE `user_id` = '$user_id'";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            $data = array();
            while ($row = $result->fetch_assoc()) {
                $row_data = array(
                    "user_id" => $row["user_id"],
                    "data_id" => $row["data_id"],
                    "title" => $row["title"],
                    "description" => $row["description"],
                    "country" => $row["country"],
                    "electoral_district_level" => $row["electoral_district_level"],
                    "electoral_system_design" => $row["electoral_system_design"],
                    "status" => $row["status"],
                    "created_at" => $row["created_at"],
                    "updated_at" => $row["updated_at"]
                );
                array_push($data, $row_data);
            }
            StatusResponse(200, $str["200_ok"], $data);
        } else {
            StatusResponse(404, $str["404_map_data_not_exist"]);
        }
    } else {
        // Load Map Data User
        $sql = "SELECT *  FROM `tbl_workshop` WHERE `user_id` = '$user_data_id' AND `status` = 'Verified'";
        $result = $conn->query($sql);

        if ($result->num_rows > 0) {
            $data = array();
            while ($row = $result->fetch_assoc()) {
                $row_data = array(
                    "user_id" => $row["user_id"],
                    "data_id" => $row["data_id"],
                    "title" => $row["title"],
                    "description" => $row["description"],
                    "country" => $row["country"],
                    "electoral_district_level" => $row["electoral_district_level"],
                    "electoral_system_design" => $row["electoral_system_design"],
                    "status" => $row["status"],
                    "created_at" => $row["created_at"],
                    "updated_at" => $row["updated_at"]
                );
                array_push($data, $row_data);
            }
            StatusResponse(200, $str["200_ok"], $data);
        } else {
            StatusResponse(404, $str["404_map_data_not_exist"]);
        }
    }
} else {
    // Load Map Data Public
    $sql = "SELECT tbl_user_data.first_name, tbl_user_data.last_name, tbl_workshop.*  FROM `tbl_workshop` JOIN `tbl_user_data` ON tbl_workshop.user_id = tbl_user_data.user_id WHERE `status` = 'Verified'";
    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        $data = array();
        while ($row = $result->fetch_assoc()) {
            $row_data = array(
                "user_id" => $row["user_id"],
                "first_name" => $row["first_name"],
                "last_name" => $row["last_name"],
                "data_id" => $row["data_id"],
                "title" => $row["title"],
                "description" => $row["description"],
                "country" => $row["country"],
                "electoral_district_level" => $row["electoral_district_level"],
                "electoral_system_design" => $row["electoral_system_design"],
                "status" => $row["status"],
                "created_at" => $row["created_at"],
                "updated_at" => $row["updated_at"]
            );
            array_push($data, $row_data);
        }
        StatusResponse(200, $str["200_ok"], $data);
    } else {
        StatusResponse(404, $str["404_map_data_not_exist"]);
    }
}

mysqli_close($conn);
