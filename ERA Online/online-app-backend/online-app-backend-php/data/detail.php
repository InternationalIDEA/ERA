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
$data_id = $_POST['data_id'];

// Load Map Data 
$sql = "SELECT tbl_user_data.first_name, tbl_user_data.last_name, tbl_workshop.*  FROM `tbl_workshop` JOIN `tbl_user_data` ON tbl_workshop.user_id = tbl_user_data.user_id WHERE `data_id` = '$data_id'";
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
            "spatial_data" => $row["spatial_data"],
            "country" => $row["country"],
            "population_data_source" => $row["population_data_source"],
            "population_data_available_online" => $row["population_data_available_online"],
            "population_data_publish_permission" => $row["population_data_publish_permission"],
            "spatial_data_source" => $row["spatial_data_source"],
            "spatial_data_available_online" => $row["spatial_data_available_online"],
            "spatial_data_publish_permission" => $row["spatial_data_publish_permission"],
            "copyright_holder" => $row["copyright_holder"],
            "electoral_district_level" => $row["electoral_district_level"],
            "electoral_system_design" => $row["electoral_system_design"],
            "minimum_seat_allocation" => $row["minimum_seat_allocation"],
            "maximum_seat_allocation" => $row["maximum_seat_allocation"],
            "standard_allowable_opovov" => $row["standard_allowable_opovov"],
            "electoral_district_drawing_responsibility" => $row["electoral_district_drawing_responsibility"],
            "electoral_district_frequency" => $row["electoral_district_frequency"],
            "electoral_district_for_minority" => $row["electoral_district_for_minority"],

            "status" => $row["status"],
            "created_at" => $row["created_at"],
            "updated_at" => $row["updated_at"],
        );
        if ($row["status"] == 'Verified') {
            StatusResponse(200, $str["200_ok"], $row_data);
        } elseif ($row["user_id"] == $user_id) {
            StatusResponse(200, $str["200_ok"], $row_data);
        } else {
            // Check if account an admin
            $sql_admin = "SELECT user_id, admin FROM `tbl_user` WHERE `user_id` = '$user_id' AND `email` = '$email' AND `hash` = '$hash' AND `admin` = '1'";
            if (mysqli_num_rows(mysqli_query($conn, $sql_admin))) {
                StatusResponse(200, $str["200_ok"], $row_data);
            } else {
                StatusResponse(404, $str["404_map_data_not_exist"]);
            }
        }
    }
} else {
    StatusResponse(404, $str["404_map_data_not_exist"]);
}

mysqli_close($conn);
