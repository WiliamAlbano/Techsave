-- MySQL dump 10.13  Distrib 8.0.39, for Win64 (x86_64)
--
-- Host: localhost    Database: tmedb
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `admin`
--

DROP TABLE IF EXISTS `admin`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `admin` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contacto` int DEFAULT NULL,
  `password` varchar(255) NOT NULL DEFAULT '1234',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `admin`
--

LOCK TABLES `admin` WRITE;
/*!40000 ALTER TABLE `admin` DISABLE KEYS */;
INSERT INTO `admin` VALUES (1,'Joel Fernandes','joelfernandes452@gmail.com',923456789,'1234'),(2,'Wayendy Jack','yndjack@gmail.com',911721881,'1234');
/*!40000 ALTER TABLE `admin` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `atendente`
--

DROP TABLE IF EXISTS `atendente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `atendente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contacto` int DEFAULT NULL,
  `password` varchar(255) NOT NULL DEFAULT '1234',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `atendente`
--

LOCK TABLES `atendente` WRITE;
/*!40000 ALTER TABLE `atendente` DISABLE KEYS */;
INSERT INTO `atendente` VALUES (1,'Carlos Barber','Carlosnhanga35@gmail.com',923456789,'1234'),(5,'Paula Quizanga','paulaquizanga@gmail.com',934314691,'1234'),(6,'Paulo Quissua','paulorover70@gmail.com',934314691,'1234');
/*!40000 ALTER TABLE `atendente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `categoria` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categoria`
--

LOCK TABLES `categoria` WRITE;
/*!40000 ALTER TABLE `categoria` DISABLE KEYS */;
INSERT INTO `categoria` VALUES (1,'Computadores'),(2,'Impressoras'),(3,'Cabos'),(4,'Routers'),(5,'Servidores'),(7,'HUB & SWICTHES'),(8,'Scanners'),(9,'Software'),(10,'Mnitores e Projectores');
/*!40000 ALTER TABLE `categoria` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `cliente`
--

DROP TABLE IF EXISTS `cliente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `cliente` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contacto` int DEFAULT NULL,
  `password` varchar(255) NOT NULL DEFAULT '1234',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `cliente`
--

LOCK TABLES `cliente` WRITE;
/*!40000 ALTER TABLE `cliente` DISABLE KEYS */;
INSERT INTO `cliente` VALUES (3,'Denny Arsénio Manuel Quizanga','denezruss@gmail.com',934314691,'12345'),(4,'Joviana Irina Da Silva Viana','joviana580@gmail.com',911721881,'12345'),(5,'Carlos David','cd0528040@gmail.com',911721881,'1234');
/*!40000 ALTER TABLE `cliente` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `equipamento`
--

DROP TABLE IF EXISTS `equipamento`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `equipamento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nomenclatura` varchar(255) NOT NULL,
  `preco` decimal(10,3) NOT NULL,
  `qtd` int NOT NULL DEFAULT '0',
  `Cor` varchar(30) NOT NULL DEFAULT 'preto',
  `Compatibilidade` varchar(1000) DEFAULT NULL,
  `RAM` varchar(10) DEFAULT NULL,
  `ROM` varchar(20) DEFAULT NULL,
  `Comprimento` decimal(3,2) DEFAULT NULL,
  `WIFI` varchar(3) DEFAULT NULL,
  `Ethernet` varchar(3) DEFAULT NULL,
  `SO` varchar(30) DEFAULT NULL,
  `Resolucao` varchar(10) DEFAULT NULL,
  `grafico` varchar(200) DEFAULT NULL,
  `HDMI` varchar(3) DEFAULT NULL,
  `USB` varchar(3) DEFAULT NULL,
  `Bluetooth` varchar(3) DEFAULT NULL,
  `Processador` varchar(30) DEFAULT NULL,
  `garantia` varchar(500) DEFAULT NULL,
  `categoriaId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `categoriaId` (`categoriaId`),
  CONSTRAINT `equipamento_ibfk_1` FOREIGN KEY (`categoriaId`) REFERENCES `categoria` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `equipamento`
--

LOCK TABLES `equipamento` WRITE;
/*!40000 ALTER TABLE `equipamento` DISABLE KEYS */;
INSERT INTO `equipamento` VALUES (1,'KYOCERA IMPRESSORA LASER MONO ECOSYS P2040DN 40PPM',172990.000,20,'BRANCO','Apple AirPrint, Google Cloud Print, Kyocera Mobile Print, Mopria Print Service',NULL,NULL,NULL,'NÃO','SIM',NULL,'1200x1200',NULL,'NÃO','SIM','NÃO',NULL,NULL,NULL),(2,'HP IMPRESSORA DESKJET E-AIO 2876 ADV. (7.5) WIFI',61814.000,30,'BRANCO','Windows 10, 11 / macOS V10.14 , macOS 10.15 , macOS 11 , macOS 12 , macOS 13','64 MB',NULL,NULL,'SIM',NULL,NULL,NULL,NULL,NULL,'SIM',NULL,NULL,NULL,2),(3,'HP COMPUTADOR DESKTOP 290G9 MT I3-12100 8GB/512GB SSD W11P + MONITOR 21.5\'\' P22V G5',870509.000,40,'PRETO',NULL,'8GB','512GB',NULL,'SIM','SIM','WINDOWS 11 PROFISSIONAL','HD',NULL,'SIM','SIM','SIM','INTEL CORE I3 12ªG',NULL,1),(4,'Redes e internet WP RACK CABO REDE CAT6 O,5M U-UTP AWG 26/7',1313.280,100,'Cinza','',NULL,NULL,0.00,'','',NULL,'',NULL,'','','',NULL,NULL,3),(5,'KASPERSKY ANTIVIRUS STANDARD 3 DISPOSITIVOS',19162.000,30,'','Windows® / macOS® / Android™ / iOS®',NULL,NULL,NULL,'','',NULL,'',NULL,'','','',NULL,NULL,9),(6,'Software MICROSOFT ACTIVADOR OFFICE 365 PESSOAL 1 ANO - ESD',63445.000,30,'','PC / MAC / IPAD / IPHONE / ANDROID',NULL,NULL,NULL,'','',NULL,'',NULL,'','','',NULL,NULL,9),(7,'MICROSOFT ACTIVADOR WINDOWS 11 PRO 64-bit - ESD',306169.000,30,'','',NULL,NULL,NULL,'','',NULL,'',NULL,'','','',NULL,NULL,9),(8,'EPSON PROJECTOR EB-W49 3800 LUMENS WXGA',1049269.680,50,'BRANCO','',NULL,NULL,NULL,'','',NULL,'HD',NULL,'SIM','SIM','',NULL,NULL,10),(9,'HP MONITOR 32\'\' 32C CURVO QHD 400 NITS 2-HDMI 1-DPORT',424700.160,50,'PRETO','',NULL,NULL,NULL,'','',NULL,'QHD',NULL,'SIM','SIM','',NULL,NULL,10),(10,'HPE SERVIDOR TORRE ML30 G10+ E-2314 1P 16GB 8SFF 2X960GB 800W',2850000.000,100,'','',NULL,NULL,NULL,'','',NULL,'',NULL,'','','',NULL,NULL,5),(11,'HPE SERVIDOR RACK DL20 GEN10+ E-2336 1P 32GB 4SFF 2X480GB SATA 800W',2599200.000,100,'CINZA,PRETO,BRANCO','MICROSOFT WINDOWS SERVER | VMWARE ESXI | RED HAT ENTERPRISE LINUX (RHEL)| SUSE LINUX ENTERPRISE SERVER (SLES)| CANONICAL UBUNTU','32GB',NULL,NULL,'','1','NÃO','',NULL,'','SIM','','XEON E-2336',NULL,5);
/*!40000 ALTER TABLE `equipamento` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `fila`
--

DROP TABLE IF EXISTS `fila`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `fila` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ClienteId` int DEFAULT NULL,
  `EquipamentId` int DEFAULT NULL,
  `Data` datetime DEFAULT NULL,
  `Status` varchar(15) NOT NULL,
  `Localizacao` varchar(255) NOT NULL,
  `Service` varchar(18) NOT NULL,
  `DataM` datetime NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ClienteId` (`ClienteId`),
  KEY `EquipamentId` (`EquipamentId`),
  CONSTRAINT `fila_ibfk_1` FOREIGN KEY (`ClienteId`) REFERENCES `cliente` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `fila_ibfk_2` FOREIGN KEY (`EquipamentId`) REFERENCES `equipamento` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `fila`
--

LOCK TABLES `fila` WRITE;
/*!40000 ALTER TABLE `fila` DISABLE KEYS */;
/*!40000 ALTER TABLE `fila` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `solicitacao`
--

DROP TABLE IF EXISTS `solicitacao`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `solicitacao` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ClienteId` int DEFAULT NULL,
  `EquipamentId` int DEFAULT NULL,
  `Status` varchar(10) NOT NULL DEFAULT 'Pendente',
  `Data` datetime DEFAULT NULL,
  `Localizacao` varchar(255) NOT NULL DEFAULT ' ',
  `DataM` datetime NOT NULL,
  `Service` varchar(200) NOT NULL DEFAULT 'Montagem',
  PRIMARY KEY (`id`),
  KEY `ClienteId` (`ClienteId`),
  KEY `EquipamentId` (`EquipamentId`),
  CONSTRAINT `solicitacao_ibfk_1` FOREIGN KEY (`ClienteId`) REFERENCES `cliente` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `solicitacao_ibfk_2` FOREIGN KEY (`EquipamentId`) REFERENCES `equipamento` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `solicitacao`
--

LOCK TABLES `solicitacao` WRITE;
/*!40000 ALTER TABLE `solicitacao` DISABLE KEYS */;
INSERT INTO `solicitacao` VALUES (1,4,NULL,'Pendente','2025-02-11 00:00:00','Talatona-Rua 30-casa 12','2025-02-14 14:30:00','Montagem'),(2,4,2,'Concluida','2025-02-11 00:00:00','Camama1-Condominio BPC-Rua 07','2025-02-14 14:30:00','Montagem'),(3,3,2,'Concluida','2025-02-11 00:00:00','Zango 0-Vida Pacífica-Zona 1','2025-02-15 14:40:00','Montagem'),(4,3,3,'Concluida','2025-02-11 00:00:00','Talatona - condominio Gold-casa 2','2025-02-16 12:00:00','Montagem'),(5,4,4,'Concluida','2025-02-11 00:00:00','Icolo & Bengo','2025-02-15 16:00:00','Montagem'),(6,4,4,'Em curso','2025-02-11 00:00:00','Icolo-Bengo','2025-02-17 15:30:00','Montagem'),(7,5,1,'Em curso','2025-02-11 00:00:00','Morro Bento','2025-02-17 15:45:00','Montagem'),(8,5,2,'Em curso','2025-02-11 00:00:00','Cazenga-Terra Nova-Rua da Mão','2025-02-17 18:00:00','Montagem'),(9,4,2,'Em curso','2025-02-11 00:00:00','Benguela','2025-02-19 13:00:00','Montagem'),(10,4,3,'Em curso','2025-02-11 00:00:00','Mutamba','2025-02-20 10:00:00','Montagem'),(11,3,4,'Em curso','2025-02-13 00:00:00','Talatona','2025-03-05 10:30:00','Montagem'),(12,3,2,'Em curso','2025-02-13 00:00:00','Talatona','2025-03-05 11:00:00','Montagem'),(15,3,2,'Em curso','2025-02-13 00:00:00','Talatona','2025-04-02 14:30:00','Montagem'),(16,3,7,'Em curso','2025-02-13 00:00:00','Zango 0','2025-03-14 12:00:00','Montagem'),(17,5,4,'Em curso','2025-02-13 00:00:00','Zango 1','2025-02-20 10:45:00','Montagem'),(18,5,5,'Em curso','2025-02-13 00:00:00','Alvalade','2025-02-22 10:00:00','Montagem'),(19,5,8,'Em curso','2025-02-13 00:00:00','Camama','2025-03-03 09:30:00','Montagem'),(20,5,11,'Em curso','2025-02-13 00:00:00','Sequele','2025-03-04 12:00:00','Montagem'),(21,5,7,'Em curso','2025-02-13 00:00:00','Zango 8000','2025-03-05 11:10:00','Montagem'),(22,3,11,'Em curso','2025-02-13 00:00:00','Morro-Bento','2025-03-14 14:00:00','Montagem'),(23,3,6,'Em curso','2025-02-13 00:00:00','Talatona','2025-03-12 14:30:00','Montagem');
/*!40000 ALTER TABLE `solicitacao` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tecnico`
--

DROP TABLE IF EXISTS `tecnico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tecnico` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `contacto` int DEFAULT NULL,
  `password` varchar(255) NOT NULL DEFAULT '1234',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tecnico`
--

LOCK TABLES `tecnico` WRITE;
/*!40000 ALTER TABLE `tecnico` DISABLE KEYS */;
INSERT INTO `tecnico` VALUES (1,'Wiliam Albano','Williamalbano@gmail.com',923456789,'1234'),(3,'Denez Russ','Makbele@gmail.com',923001332,'1234');
/*!40000 ALTER TABLE `tecnico` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vendafeita`
--

DROP TABLE IF EXISTS `vendafeita`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `vendafeita` (
  `id` int NOT NULL AUTO_INCREMENT,
  `ClienteId` int DEFAULT NULL,
  `EquipamentId` int DEFAULT NULL,
  `AtendenteId` int DEFAULT NULL,
  `TecnicoId` int DEFAULT NULL,
  `Data` datetime DEFAULT NULL,
  `Localizacao` varchar(255) NOT NULL DEFAULT ' ',
  `DataM` datetime NOT NULL,
  `Status` varchar(15) NOT NULL,
  `Service` varchar(200) NOT NULL DEFAULT 'Montagem',
  PRIMARY KEY (`id`),
  KEY `ClienteId` (`ClienteId`),
  KEY `EquipamentId` (`EquipamentId`),
  KEY `AtendenteId` (`AtendenteId`),
  KEY `TecnicoId` (`TecnicoId`),
  CONSTRAINT `vendafeita_ibfk_1` FOREIGN KEY (`ClienteId`) REFERENCES `cliente` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `vendafeita_ibfk_2` FOREIGN KEY (`EquipamentId`) REFERENCES `equipamento` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `vendafeita_ibfk_3` FOREIGN KEY (`AtendenteId`) REFERENCES `atendente` (`id`) ON DELETE RESTRICT,
  CONSTRAINT `vendafeita_ibfk_4` FOREIGN KEY (`TecnicoId`) REFERENCES `tecnico` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vendafeita`
--

LOCK TABLES `vendafeita` WRITE;
/*!40000 ALTER TABLE `vendafeita` DISABLE KEYS */;
INSERT INTO `vendafeita` VALUES (1,5,8,5,1,'2025-02-13 01:00:00','Camama','2025-03-03 10:30:00','Pendente','Montagem'),(2,5,11,5,3,'2025-02-13 01:00:00','Sequele','2025-03-04 13:00:00','Concluida','Montagem'),(3,5,7,5,1,'2025-02-13 01:00:00','Zango 8000','2025-03-05 12:10:00','Concluida','Montagem'),(4,3,11,5,1,'2025-02-13 01:00:00','Morro-Bento','2025-03-14 15:00:00','Concluida','Montagem'),(5,3,6,5,3,'2025-02-13 01:00:00','Talatona','2025-03-12 15:30:00','Concluida','Montagem');
/*!40000 ALTER TABLE `vendafeita` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-02-13 20:25:36
