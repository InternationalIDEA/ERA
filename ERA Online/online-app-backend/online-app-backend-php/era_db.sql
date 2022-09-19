-- phpMyAdmin SQL Dump
-- version 4.9.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Dec 06, 2021 at 07:51 PM
-- Server version: 10.5.12-MariaDB-cll-lve
-- PHP Version: 7.2.34

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `era_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user`
--

CREATE TABLE `tbl_user` (
  `id` int(11) NOT NULL,
  `user_id` varchar(17) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `hash` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `verified` tinyint(1) NOT NULL DEFAULT 0,
  `admin` tinyint(1) DEFAULT 0,
  `blocked` tinyint(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_user_data`
--

CREATE TABLE `tbl_user_data` (
  `id` int(11) NOT NULL,
  `user_id` varchar(17) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` varchar(5) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `first_name` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `last_name` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `institution_name` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `department` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `expertise_field_of_issue` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `institution_email` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `institution_phone_number` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `tbl_workshop`
--

CREATE TABLE `tbl_workshop` (
  `id` int(11) NOT NULL,
  `data_id` varchar(17) COLLATE utf8mb4_unicode_ci NOT NULL,
  `user_id` varchar(17) COLLATE utf8mb4_unicode_ci NOT NULL,
  `title` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `spatial_data` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `country` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `population_data_source` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `population_data_available_online` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `population_data_publish_permission` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `spatial_data_source` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `spatial_data_available_online` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `spatial_data_publish_permission` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `copyright_holder` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `electoral_district_level` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `electoral_system_design` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `minimum_seat_allocation` int(11) DEFAULT NULL,
  `maximum_seat_allocation` int(11) DEFAULT NULL,
  `standard_allowable_opovov` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `electoral_district_drawing_responsibility` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `electoral_district_frequency` int(11) DEFAULT NULL,
  `electoral_district_for_minority` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `tbl_user`
--
ALTER TABLE `tbl_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `tbl_user_data`
--
ALTER TABLE `tbl_user_data`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `tbl_workshop`
--
ALTER TABLE `tbl_workshop`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `data_id` (`data_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `tbl_user`
--
ALTER TABLE `tbl_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_user_data`
--
ALTER TABLE `tbl_user_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `tbl_workshop`
--
ALTER TABLE `tbl_workshop`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
