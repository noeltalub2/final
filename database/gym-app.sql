-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Feb 11, 2024 at 08:12 PM
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
-- Table structure for table `admin`
--

CREATE TABLE `admin` (
  `id` int(11) NOT NULL,
  `fullname` varchar(45) NOT NULL,
  `username` varchar(45) NOT NULL,
  `password` varchar(60) NOT NULL,
  `join_date` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `admin`
--

INSERT INTO `admin` (`id`, `fullname`, `username`, `password`, `join_date`) VALUES
(1, 'Administrator', 'admin', '$2a$12$O8bVaneBBmfdJa6k1G/boe3ZdvxD0sucBA0SY9iBwd8W9Nx54zs9u', '2/5/2024, 1:30:00 PM');

-- --------------------------------------------------------

--
-- Table structure for table `announcement`
--

CREATE TABLE `announcement` (
  `announcement_id` int(11) NOT NULL,
  `client_id` int(45) DEFAULT NULL,
  `title` varchar(60) NOT NULL,
  `message` text NOT NULL,
  `date` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `announcement`
--

INSERT INTO `announcement` (`announcement_id`, `client_id`, `title`, `message`, `date`) VALUES
(1, NULL, ' Welcome to King\'s Gym!', 'Get ready to achieve your fitness goals with us! We\'re thrilled to have you join our community. Let\'s work together to reach new heights!', '2/4/2024, 3:30:21 PM'),
(2, 26, 'Payment Alert', 'Please be informed that your payment for the Body Building membership is due. Kindly settle the payment as soon as possible to avoid any inconvenience. Thank you.', '2/11/2024, 11:29:47 PM');

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `attendance_id` int(11) NOT NULL,
  `client_id` int(15) NOT NULL,
  `time_in` varchar(15) DEFAULT NULL,
  `time_out` varchar(15) DEFAULT NULL,
  `date` varchar(15) NOT NULL,
  `status` tinyint(1) NOT NULL,
  `logs` varchar(15) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`attendance_id`, `client_id`, `time_in`, `time_out`, `date`, `status`, `logs`) VALUES
(13, 24, '7:37:09 PM', '7:37:58 PM', '2/11/2024', 2, ''),
(14, 25, '7:38:27 PM', '7:38:31 PM', '2/11/2024', 2, ''),
(15, 26, '11:55:21 PM', '11:58:31 PM', '2/11/2024', 2, ''),
(16, 24, '12:01:08 AM', NULL, '2/12/2024', 1, ''),
(17, 26, '12:01:09 AM', '12:06:54 AM', '2/12/2024', 2, '');

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
(24, 'asdas', NULL, NULL, NULL, NULL, NULL, 'noeltalub2', 'asda@gmail.com', '12312123123', '$2b$15$N4qm28frYTKUV1OPXwjtw.dkA2yQ0I7QvFRpbgxJQDLY3hLvZMTDG', '2/10/2024, 1:59:24 PM'),
(25, 'qweqweq', NULL, NULL, NULL, NULL, NULL, 'noeltalub3', 'weqweq@gmai.com', '12312371273', '$2b$15$K4FuYWrpp8.bpohhUjy/Kue.ppvNih5gBmwyqbJG8dnNsRTsqg99q', '2/11/2024, 6:26:46 PM'),
(26, 'Jasdj', NULL, NULL, NULL, NULL, NULL, 'noeltalub', 'noeals@gmail.com', '12385858858', '$2b$15$nTsVqI7pbJ76dbI1OVCb3u5SfezFLf.1V/3OKoR4p0FgyvvcUfO1C', '2/11/2024, 10:53:40 PM');

-- --------------------------------------------------------

--
-- Table structure for table `equipment`
--

CREATE TABLE `equipment` (
  `id` int(11) NOT NULL,
  `name` varchar(60) NOT NULL,
  `amount` varchar(60) NOT NULL,
  `quantity` varchar(60) NOT NULL,
  `vendor` varchar(60) NOT NULL,
  `description` varchar(60) NOT NULL,
  `address` varchar(60) NOT NULL,
  `phonenumber` varchar(60) NOT NULL,
  `date` varchar(60) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `equipment`
--

INSERT INTO `equipment` (`id`, `name`, `amount`, `quantity`, `vendor`, `description`, `address`, `phonenumber`, `date`) VALUES
(2, '1231312', '50000', '5', 'SS Industries', 'asdasd', '7 Cedarstone Drive', '0912741723', '2019-03-07');

-- --------------------------------------------------------

--
-- Table structure for table `membership`
--

CREATE TABLE `membership` (
  `membership_id` int(11) NOT NULL,
  `client_id` int(11) NOT NULL,
  `trainer_id` int(45) NOT NULL,
  `join_date` varchar(45) NOT NULL,
  `membership_service` varchar(45) NOT NULL,
  `membership_plan` varchar(45) NOT NULL,
  `membership_status` varchar(45) NOT NULL,
  `payment_status` varchar(45) NOT NULL,
  `total_amount` varchar(45) NOT NULL,
  `status_change_date` varchar(45) NOT NULL,
  `date_expiration` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `task`
--

CREATE TABLE `task` (
  `task_id` int(11) NOT NULL,
  `description` varchar(45) NOT NULL,
  `status` varchar(45) NOT NULL,
  `client_id` int(45) NOT NULL,
  `trainer_id` int(45) DEFAULT NULL,
  `date` varchar(45) NOT NULL,
  `time` varchar(45) NOT NULL,
  `log_date` varchar(45) DEFAULT NULL,
  `log_time` varchar(45) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `trainer`
--

CREATE TABLE `trainer` (
  `trainer_id` int(11) NOT NULL,
  `fullname` varchar(45) NOT NULL,
  `address` varchar(45) NOT NULL,
  `age` int(45) NOT NULL,
  `gender` varchar(45) NOT NULL,
  `username` varchar(45) NOT NULL,
  `email` varchar(45) NOT NULL,
  `phonenumber` varchar(45) NOT NULL,
  `password` varchar(60) NOT NULL,
  `join_date` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `trainer`
--

INSERT INTO `trainer` (`trainer_id`, `fullname`, `address`, `age`, `gender`, `username`, `email`, `phonenumber`, `password`, `join_date`) VALUES
(7, 'Noel', 'Nadj', 22, '', 'noeltalub', 'asdj@gmail.com', '91283182381', '$2b$15$GYJjfKSJggMq2DIK8/4/ZunzKwHavu5.gY58a90r8KqpuygUKUWWW', '2/12/2024, 3:10:43 AM');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admin`
--
ALTER TABLE `admin`
  ADD PRIMARY KEY (`id`);

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
-- Indexes for table `equipment`
--
ALTER TABLE `equipment`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `membership`
--
ALTER TABLE `membership`
  ADD PRIMARY KEY (`membership_id`),
  ADD KEY `asd` (`client_id`),
  ADD KEY `trainer` (`trainer_id`);

--
-- Indexes for table `task`
--
ALTER TABLE `task`
  ADD PRIMARY KEY (`task_id`),
  ADD KEY `client_id` (`client_id`),
  ADD KEY `trainer_id` (`trainer_id`);

--
-- Indexes for table `trainer`
--
ALTER TABLE `trainer`
  ADD PRIMARY KEY (`trainer_id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `email` (`email`,`phonenumber`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admin`
--
ALTER TABLE `admin`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `announcement`
--
ALTER TABLE `announcement`
  MODIFY `announcement_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `attendance_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=18;

--
-- AUTO_INCREMENT for table `client`
--
ALTER TABLE `client`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `equipment`
--
ALTER TABLE `equipment`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `membership`
--
ALTER TABLE `membership`
  MODIFY `membership_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `task`
--
ALTER TABLE `task`
  MODIFY `task_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `trainer`
--
ALTER TABLE `trainer`
  MODIFY `trainer_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

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
  ADD CONSTRAINT `asd` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  ADD CONSTRAINT `membership_ibfk_1` FOREIGN KEY (`trainer_id`) REFERENCES `trainer` (`trainer_id`);

--
-- Constraints for table `task`
--
ALTER TABLE `task`
  ADD CONSTRAINT `client_id` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`),
  ADD CONSTRAINT `task_ibfk_1` FOREIGN KEY (`trainer_id`) REFERENCES `trainer` (`trainer_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
