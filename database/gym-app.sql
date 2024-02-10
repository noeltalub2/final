-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 06, 2024 at 05:53 PM
-- Server version: 10.4.25-MariaDB
-- PHP Version: 8.1.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `gym-app`
--

-- --------------------------------------------------------

--
-- Table structure for table `announcement`
--

CREATE TABLE `announcement` (
  `announcement_id` int(11) NOT NULL,
  `client_id` int(45) DEFAULT NULL,
  `title` varchar(60) NOT NULL,
  `message` varchar(100) NOT NULL,
  `date` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `announcement`
--

INSERT INTO `announcement` (`announcement_id`, `client_id`, `title`, `message`, `date`) VALUES
(1, 2, 'Payment Notice', 'Please pay you membership as soon as possible', '2/6/2024, 11:15:42 PM'),
(2, NULL, 'SHOP WILL BE CLOSED', 'Feb 10 Our Shop Will Be Closed', '2/8/2024, 11:15:42 PM');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `attendance_id` int(11) NOT NULL,
  `client_id` int(15) NOT NULL,
  `time_in` varchar(15) NOT NULL,
  `time_out` varchar(15) NOT NULL,
  `date` varchar(15) NOT NULL,
  `status` varchar(2) NOT NULL,
  `logs` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`attendance_id`, `client_id`, `time_in`, `time_out`, `date`, `status`, `logs`) VALUES
(1, 2, '10:45 AM', '3:00 PM', '2/6/2024', '1', '02-02-2024');

-- --------------------------------------------------------

--
-- Table structure for table `client`
--

CREATE TABLE `client` (
  `id` int(11) NOT NULL,
  `fullname` varchar(45) NOT NULL,
  `address` varchar(100) DEFAULT NULL,
  `age` int(5) DEFAULT NULL,
  `gender` varchar(45) DEFAULT NULL,
  `height` varchar(45) DEFAULT NULL,
  `weight` varchar(45) DEFAULT NULL,
  `username` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `phonenumber` varchar(45) NOT NULL,
  `password` varchar(60) NOT NULL,
  `join_date` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `client`
--

INSERT INTO `client` (`id`, `fullname`, `address`, `age`, `gender`, `height`, `weight`, `username`, `email`, `phonenumber`, `password`, `join_date`) VALUES
(2, 'Noel Michael T. Talub', 'Brgy. 16 Laoag City', 22, 'Male', '172', '65', 'noeltalub2', 'noelmichaelttalub@gmail.com', '09166838843', '$2b$15$ROwWA6L1PgSju4K4w04o8eR4tViYvBWmeHeEFH/uFFAjLELzZnpWa', '2/4/2024, 2:27:36 PM');

-- --------------------------------------------------------

--
-- Table structure for table `membership`
--

CREATE TABLE `membership` (
  `membership_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `join_date` varchar(45) NOT NULL,
  `membership_service` varchar(45) NOT NULL,
  `membership_plan` varchar(45) NOT NULL,
  `membership_status` varchar(45) NOT NULL,
  `payment_status` varchar(45) NOT NULL,
  `total_amount` varchar(45) NOT NULL,
  `status_change_date` varchar(45) NOT NULL,
  `date_expiration` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `membership`
--

INSERT INTO `membership` (`membership_id`, `client_id`, `join_date`, `membership_service`, `membership_plan`, `membership_status`, `payment_status`, `total_amount`, `status_change_date`, `date_expiration`) VALUES
(2, 2, '2/6/2024, 10:38:29 PM', 'Sauna', '3', 'Cancelled', 'Cancelled', '1000', '', NULL),
(3, 2, '2/6/2024, 10:52:53 PM', 'Cardio', '6', 'Cancelled', 'Cancelled', '1000', '', NULL),
(4, 2, '2/6/2024, 11:12:58 PM', 'Fitness', '3', 'Cancelled', 'Cancelled', '1000', '', NULL),
(5, 2, '2/6/2024, 11:14:42 PM', 'Sauna', '12', 'Cancelled', 'Cancelled', '1000', '2/6/2024, 11:15:42 PM', '8/6/2024, 11:15:42 PM'),
(6, 2, '2/6/2024, 11:31:18 PM', 'Fitness', '1', 'Cancelled', 'Cancelled', '1000', '', NULL),
(7, 2, '2/6/2024, 11:31:43 PM', 'Fitness', '1', 'Cancelled', 'Cancelled', '1000', '', NULL),
(8, 2, '2/6/2024, 11:32:08 PM', 'Cardio', '3', 'Expired', 'Paid', '1000', '2/6/2024, 11:15:42 PM', '8/6/2024, 11:15:42 PM'),
(9, 2, '2/7/2024, 12:23:50 AM', 'Cardio', '6', 'Cancelled', 'Cancelled', '1000', '', NULL),
(10, 2, '2/7/2024, 12:51:29 AM', 'Fitness', '6', 'Cancelled', 'Cancelled', '1800', '', NULL),
(11, 2, '2/7/2024, 12:51:52 AM', 'Sauna', '12', 'Waiting for Activation', 'Pending', '5400', '', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `task`
--

CREATE TABLE `task` (
  `task_id` int(11) NOT NULL,
  `description` varchar(45) NOT NULL,
  `status` varchar(45) NOT NULL,
  `client_id` int(45) NOT NULL,
  `date` varchar(45) NOT NULL,
  `time` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `task`
--

INSERT INTO `task` (`task_id`, `description`, `status`, `client_id`, `date`, `time`) VALUES
(5, '10 Push Up', 'In Progress', 2, '2/6/2024', '12:22:57 PM'),
(6, '1km ThreadMill Walk', 'Done', 2, '2/6/2024', '12:23:56 PM'),
(7, '11 Pull Up', 'Done', 2, '2/7/2024', '12:52:46 AM');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `announcement`
--
ALTER TABLE `announcement`
  ADD PRIMARY KEY (`announcement_id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`attendance_id`),
  ADD KEY `client_id` (`client_id`);

--
-- Indexes for table `client`
--
ALTER TABLE `client`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`,`phonenumber`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `membership`
--
ALTER TABLE `membership`
  ADD PRIMARY KEY (`membership_id`),
  ADD KEY `asd` (`client_id`);

--
-- Indexes for table `task`
--
ALTER TABLE `task`
  ADD PRIMARY KEY (`task_id`),
  ADD KEY `client_id` (`client_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `announcement`
--
ALTER TABLE `announcement`
  MODIFY `announcement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `client`
--
ALTER TABLE `client`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `membership`
--
ALTER TABLE `membership`
  MODIFY `membership_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `task`
--
ALTER TABLE `task`
  MODIFY `task_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `announcement`
--
ALTER TABLE `announcement`
  ADD CONSTRAINT `announcement_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`);

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`);

--
-- Constraints for table `membership`
--
ALTER TABLE `membership`
  ADD CONSTRAINT `asd` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`);

--
-- Constraints for table `task`
--
ALTER TABLE `task`
  ADD CONSTRAINT `client_id` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
