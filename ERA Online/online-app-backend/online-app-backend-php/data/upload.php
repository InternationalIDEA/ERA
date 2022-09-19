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
$user_id = $_POST['user_id'];
$email = $_POST['email'];
$hash = $_POST['token'];

// Generate Data ID UUID
$data_id = strtoupper(bin2hex(openssl_random_pseudo_bytes(8)));

$title = $_POST['title'];
$description = $_POST['description'];
$spatial_data_file = $_FILES["spatial_data"];
$country = $_POST['country'];

$population_data_source = $_POST['population_data_source'];
$population_data_available_online = $_POST['population_data_available_online'];
$population_data_publish_permission = $_POST['population_data_publish_permission'];
$spatial_data_source = $_POST['spatial_data_source'];
$spatial_data_available_online = $_POST['spatial_data_available_online'];
$spatial_data_publish_permission = $_POST['spatial_data_publish_permission'];
$copyright_holder = $_FILES['copyright_holder'];

function postEmpty($post)
{
    if (empty($post)) {
        return "0";
    }
    return $post;
}

$electoral_district_level = $_POST['electoral_district_level'];
$electoral_system_design = $_POST['electoral_system_design'];
$minimum_seat_allocation = postEmpty($_POST['minimum_seat_allocation']);
$maximum_seat_allocation = postEmpty($_POST['maximum_seat_allocation']);
$standard_allowable_opovov = $_POST['standard_allowable_opovov'];
$electoral_district_drawing_responsibility = $_POST['electoral_district_drawing_responsibility'];
$electoral_district_frequency = postEmpty($_POST['electoral_district_frequency']);
$electoral_district_for_minority = $_POST['electoral_district_for_minority'];

// Validate Form
foreach (array($title, $description, $country, $population_data_source, $population_data_available_online, $population_data_publish_permission, $spatial_data_source, $spatial_data_available_online, $spatial_data_publish_permission, $electoral_district_level, $electoral_system_design, $electoral_district_for_minority) as $value) {
    if (empty($value)) {
        StatusResponse(422, $str["422_fill_required_data"]);
    }
}

// Check if account exist
$sql_exist = "SELECT `user_id` FROM `tbl_user` WHERE `user_id` = '$user_id' AND `email` = '$email' AND `hash` = '$hash'";
if (mysqli_num_rows(mysqli_query($conn, $sql_exist))) {
    // Save Uploaded Data
    $spatial_data_name = $spatial_data_file["name"];
    $spatial_data_format = strtolower(pathinfo($spatial_data_name, PATHINFO_EXTENSION));
    $spatial_data_target_file = "spatial_data/" . $data_id . "." . $spatial_data_format;

    // Check if spatial data file exist
    if (!empty($spatial_data_name)) {

        // Check file size
        $max_file_size = 100000000; // 100MB
        if ($spatial_data_file["size"] > $max_file_size) {
            StatusResponse(422, "Sorry, your file is too large.");
        }

        // Allow certain file formats
        if (
            $spatial_data_format != "jpg" && $spatial_data_format != "png" && $imageFileType != "jpeg"
            && $spatial_data_format != "gif" && $spatial_data_format != "svg" && $spatial_data_format != "pdf" && $spatial_data_format != "json"
        ) {
            StatusResponse(422, "Sorry, your format file is not recognized.");
        }

        if (move_uploaded_file($spatial_data_file["tmp_name"], $spatial_data_target_file)) {
            // StatusResponse(200, "Uploaded.");
        } else {
            StatusResponse(400, "Sorry, there was an error uploading your file.");
        }
    } else {
        StatusResponse(422, "Please choose your files.");
    }

    $copyright_holder_name = $copyright_holder["name"];
    $copyright_holder_format = strtolower(pathinfo($copyright_holder_name, PATHINFO_EXTENSION));
    $copyright_holder_target_file = "";

    // Check if copyright holder file exist
    if (!empty($copyright_holder_name)) {
        $copyright_holder_target_file = "copyright_holder/" . $data_id . ".pdf";

        // Check file size
        $max_file_size = 50000000; // 50MB
        if ($copyright_holder["size"] > $max_file_size) {
            StatusResponse(422, "Sorry, your copyright file is too large.");
        }

        // Allow certain file formats
        if ($copyright_holder_format != "pdf") {
            StatusResponse(422, "Sorry, your copyright file is not recognized.");
        }

        if (move_uploaded_file($copyright_holder["tmp_name"], $copyright_holder_target_file)) {
            // Copyright file Uploaded
        } else {
            StatusResponse(400, "Sorry, there was an error uploading your copyright file.");
        }
    }

    // Insert Data 
    $sql_data = "INSERT INTO tbl_workshop (data_id, user_id, title, description, spatial_data, country, population_data_source, population_data_available_online, population_data_publish_permission, spatial_data_source, spatial_data_available_online, spatial_data_publish_permission, copyright_holder, electoral_district_level, electoral_system_design, minimum_seat_allocation, maximum_seat_allocation, standard_allowable_opovov, electoral_district_drawing_responsibility, electoral_district_frequency, electoral_district_for_minority, status) 
        VALUES ('$data_id', '$user_id', '$title', '$description', '$spatial_data_target_file', '$country', '$population_data_source', '$population_data_available_online', '$population_data_publish_permission', '$spatial_data_source', '$spatial_data_available_online', '$spatial_data_publish_permission', '$copyright_holder_target_file', '$electoral_district_level', '$electoral_system_design', '$minimum_seat_allocation', '$maximum_seat_allocation', '$standard_allowable_opovov', '$electoral_district_drawing_responsibility', '$electoral_district_frequency', '$electoral_district_for_minority', 'Pending')";

    if (mysqli_query($conn, $sql_data)) {
        // Send Email To Admin
        include '../email_sender.php';
        $m_mail = email_map_data_uploaded($url, $data_id,  $email);

        $sql_admin = "SELECT email FROM `tbl_user` WHERE `admin` = '1'";
        $result = $conn->query($sql_admin);

        if ($result->num_rows > 0) {
            while ($row = $result->fetch_assoc()) {
                send_email_html($row["email"], $m_mail["subject"], $m_mail["message"]);
            }
        }

        $data = array(
            "data_id" => $data_id,
        );

        StatusResponse(201, $str["201_data_upload_successfull"], $data);
    } else {
        // Remove file if failed
        unlink($spatial_data_target_file);
        unlink($copyright_holder_target_file);
        StatusResponse(400, $str["400_failed_upload_data"]);
    }
} else {
    StatusResponse(401, $str["401_wrong_password"]);
}

mysqli_close($conn);
