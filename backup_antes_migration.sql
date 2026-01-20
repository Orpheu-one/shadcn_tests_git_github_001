/*M!999999\- enable the sandbox mode */ 
-- MariaDB dump 10.19  Distrib 10.11.11-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: connectados_001
-- ------------------------------------------------------
-- Server version	10.11.11-MariaDB-0+deb12u1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `Client`
--

DROP TABLE IF EXISTS `Client`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Client` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `frst_name` varchar(191) NOT NULL,
  `lst_name` varchar(191) DEFAULT NULL,
  `phone` varchar(191) NOT NULL,
  `email` varchar(191) DEFAULT NULL,
  `address` varchar(191) NOT NULL,
  `lat` double DEFAULT NULL,
  `long` double DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Client_phone_key` (`phone`),
  UNIQUE KEY `Client_email_key` (`email`),
  KEY `Client_phone_idx` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Client`
--

LOCK TABLES `Client` WRITE;
/*!40000 ALTER TABLE `Client` DISABLE KEYS */;
INSERT INTO `Client` VALUES
(1,'Abdullah','Lesch','921015401','Gayle55@hotmail.com','21788 Wuckert Ridge Suite 688',NULL,NULL),
(2,'Kasey','Grant','937110322','Edgardo43@hotmail.com','107 Nicolette Isle Suite 109',NULL,NULL),
(3,'Brandon','Hoeger','935952951','Damon64@gmail.com','2097 Patrick Crossroad Suite 693',NULL,NULL),
(4,'Damon','Willms','902983164','Cathrine.McClure-Koch@yahoo.com','348 Wellington Street Apt. 356',NULL,NULL),
(5,'Sierra','Kessler','961549580','Louvenia_Cassin95@hotmail.com','9447 The Fairway Apt. 768',NULL,NULL),
(6,'Stanton','Greenfelder','967697980','Noble.Heathcote@gmail.com','4339 King Grove Apt. 821',NULL,NULL),
(7,'Ethyl','Hand','938846375','Benny_Gutmann90@yahoo.com','176 Aletha Station Apt. 459',NULL,NULL),
(8,'Philip','Dach','950082011','Aidan24@hotmail.com','175 Goyette Valley Apt. 485',NULL,NULL),
(9,'Fabian','Haag','937472596','Maia_Kuhn@hotmail.com','58790 Park Crescent Apt. 113',NULL,NULL),
(10,'Cristinne','Madeira','936955139','Cristinne_Madeira@yahoo.com','72746 Lang Grove Apt. 683',NULL,NULL),
(14,'Paulo','Teixeira','967897878','paulo_teixeira@gmail.com','Avenida 25 Abril nº 2 1º Esq - 2685 Sacavem',NULL,NULL),
(16,'Carlos','Madeira','9615845623','carlos_madeira@live.com','Rua da luz 5 -Porto',NULL,NULL),
(18,'MARIA','Matos','927897878','teresa@dominio.pt','Rua da Luz nº7 Cscais',NULL,NULL),
(19,'Ana','Gouveia','96321321','ana_gouveia@gmail.com','rua moçambique no 15- sacavem',NULL,NULL),
(20,'Paulo Pinheiro','Teixeira','923396689','paulopinheiro.vivanet@gmail.com','Largo Cristóvão da Gama nº 6A- Damaia de Baixo',NULL,NULL),
(21,'Alexandra','Matos','21963963',NULL,'Rua Moçambique nº 10 Prior Velho',NULL,NULL),
(22,'Robusto','Claude','21741741',NULL,'Avenida do sucesso 66- Planeta TERRA',NULL,NULL);
/*!40000 ALTER TABLE `Client` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `Event`
--

DROP TABLE IF EXISTS `Event`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `Event` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` varchar(191) NOT NULL,
  `userId` int(11) NOT NULL,
  `clientId` int(11) NOT NULL,
  `type` enum('SALE','CALLBACK') NOT NULL DEFAULT 'SALE',
  `channel` enum('REMOTE','F2F') NOT NULL DEFAULT 'REMOTE',
  `status` enum('PROJECT','CLOSED','LOST') NOT NULL DEFAULT 'PROJECT',
  `obs` text DEFAULT NULL,
  `Scheduled` datetime(3) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL,
  `calledback_at` datetime(3) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Event_event_id_key` (`event_id`),
  UNIQUE KEY `Event_clientId_key` (`clientId`),
  KEY `Event_userId_fkey` (`userId`),
  KEY `Event_status_idx` (`status`),
  CONSTRAINT `Event_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `Client` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Event_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `Event`
--

LOCK TABLES `Event` WRITE;
/*!40000 ALTER TABLE `Event` DISABLE KEYS */;
INSERT INTO `Event` VALUES
(1,'EV-SDIKD0',1,1,'SALE','REMOTE','PROJECT','Venustas tremo deputo pel calamitas cognomen.','2025-12-29 03:25:57.497','2025-12-25 08:42:22.309','2025-12-25 08:42:22.309',NULL),
(2,'EV-SSZKTD',2,2,'SALE','REMOTE','PROJECT','Sopor vulgo decimus expedita varietas strenuus maxime.','2025-12-28 16:34:37.049','2025-12-25 08:42:22.322','2025-12-25 08:42:22.322',NULL),
(3,'EV-C0EPKD',3,3,'SALE','F2F','CLOSED','Aequitas vapulus conatus terebro verumtamen tredecim.','2025-12-31 05:56:01.988','2025-12-25 08:42:22.358','2026-01-04 09:20:08.812',NULL),
(4,'EV-WL0GXL',4,4,'SALE','REMOTE','PROJECT','Autus clementia vetus tamen asperiores ipsam texo comedo deleo pax.','2025-12-31 02:29:27.041','2025-12-25 08:42:22.392','2025-12-25 08:42:22.392',NULL),
(5,'EV-G63KGJ',5,5,'SALE','REMOTE','PROJECT','Tutis coaegresco suscipit solum.','2025-12-31 09:34:39.387','2025-12-25 08:42:22.407','2025-12-25 08:42:22.407',NULL),
(6,'EV-38B2BD',6,6,'SALE','REMOTE','PROJECT','Bellum magni cilicium reprehenderit adsidue quasi vomer amitto calco adicio.','2025-12-26 02:45:20.692','2025-12-25 08:42:22.418','2025-12-25 08:42:22.418',NULL),
(7,'EV-PGDZDI',7,7,'SALE','REMOTE','PROJECT','Conscendo coruscus dens clamo adopto claustrum substantia.','2025-12-30 18:13:04.112','2025-12-25 08:42:22.452','2025-12-25 08:42:22.452',NULL),
(8,'EV-FTYGUA',8,8,'SALE','REMOTE','PROJECT','Adfero facere video canonicus aro vito deinde celebrer color.','2025-12-28 09:03:56.501','2025-12-25 08:42:22.465','2025-12-25 08:42:22.465',NULL),
(9,'EV-6XIKUT',9,9,'SALE','REMOTE','PROJECT','Venia certus taceo circumvenio avarus nostrum earum fugit corporis cibus.','2025-12-28 00:21:49.043','2025-12-25 08:42:22.478','2025-12-25 08:42:22.478',NULL),
(10,'EV-ABGPSS',10,10,'SALE','REMOTE','CLOSED','Comis vesica bestia vindico quas occaecati videlicet vel socius.','2025-12-31 03:50:08.230','2025-12-25 08:42:22.493','2026-01-07 10:15:51.401',NULL),
(14,'EVT_1767360365782_a0jdc',16,14,'CALLBACK','REMOTE','PROJECT','Teste',NULL,'2026-01-02 13:26:05.800','2026-01-08 20:54:23.605','2026-01-30 20:53:00.000'),
(16,'EVT_1767438213673_3y0vn',6,16,'SALE','REMOTE','CLOSED','Teste criação com dif vars',NULL,'2026-01-03 11:03:33.705','2026-01-11 14:14:44.986',NULL),
(18,'EVT_1767608999679_jrohd',20,18,'CALLBACK','F2F','PROJECT','Teste',NULL,'2026-01-05 10:29:59.699','2026-01-18 07:33:02.031','2026-01-19 07:32:00.000'),
(19,'EVT_1768773452445',21,19,'SALE','F2F','PROJECT','Teste-02- create event com new user',NULL,'2026-01-18 21:57:32.522','2026-01-18 21:57:32.522',NULL),
(20,'EVT_1768776726140',21,20,'SALE','F2F','PROJECT',NULL,NULL,'2026-01-18 22:52:06.183','2026-01-18 22:52:06.183',NULL),
(21,'EVT_1768818293286',21,21,'SALE','F2F','PROJECT','teste calendar events big calendar',NULL,'2026-01-19 10:24:53.548','2026-01-19 10:24:53.548',NULL),
(22,'EVT_1768818409578',21,22,'CALLBACK','F2F','PROJECT','Teste callback big-calendar',NULL,'2026-01-19 10:26:49.601','2026-01-19 10:26:49.601','2026-01-19 12:00:41.863');
/*!40000 ALTER TABLE `Event` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `User` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `userId` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `frst_name` varchar(191) NOT NULL,
  `lst_name` varchar(191) NOT NULL,
  `phone` varchar(191) DEFAULT NULL,
  `avatar` varchar(191) DEFAULT NULL,
  `desc` varchar(191) DEFAULT NULL,
  `role` enum('OPERATOR','ADMIN','D2D','SUPERVISOR') NOT NULL DEFAULT 'OPERATOR',
  `is_active` tinyint(1) NOT NULL DEFAULT 1,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `internalId` varchar(4) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_userId_key` (`userId`),
  UNIQUE KEY `User_email_key` (`email`),
  UNIQUE KEY `User_internalId_key` (`internalId`),
  KEY `User_internalId_idx` (`internalId`)
) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `User`
--

LOCK TABLES `User` WRITE;
/*!40000 ALTER TABLE `User` DISABLE KEYS */;
INSERT INTO `User` VALUES
(1,'user_Pn4Xw79wuijf0NR','caterina_bogisich93@yahoo.com','Caterina','Bogisich','924111395','https://avatars.githubusercontent.com/u/52790773','unique supporter, dreamer 🚳','OPERATOR',1,'2025-12-25 08:42:22.122','GVXD'),
(2,'user_7DaOZJEhouFY55C','gene.pollich96@gmail.com','Gene','Pollich','925252378','https://avatars.githubusercontent.com/u/35094812','illusion enthusiast, creator','OPERATOR',1,'2025-12-25 08:42:22.150','MHFN'),
(3,'user_lc781HYAyBANffM','seamus_kirlin73@yahoo.com','Seamus','Kirlin','900926372','https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/66.jpg','coach, friend, traveler','OPERATOR',1,'2025-12-25 08:42:22.165','OJGM'),
(4,'user_4I1jFwyQBdeS4md','honofria.zulauf@gmail.com','Honofria','Pinheiro','929910674','https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/62.jpg','devil enthusiast  🦛','OPERATOR',1,'2025-12-25 08:42:22.175','XIJX'),
(5,'user_SSC78VNBerKDq2n','caesar_mcglynn88@hotmail.com','Cesar','Teixeira','909111768','https://avatars.githubusercontent.com/u/14392189','fedora junkie','OPERATOR',1,'2025-12-25 08:42:22.188','FEFE'),
(6,'user_BPALaSyqyDL6yvV','tracy_strosin77@yahoo.com','Tracy','Strosin','980012630','https://avatars.githubusercontent.com/u/96965509','geek, designer, leader 🍾','OPERATOR',1,'2025-12-25 08:42:22.199','KPYV'),
(7,'user_e6G9v1Uy7J4ze9e','rick.kozey43@yahoo.com','Rick','Kozey','985704860','https://avatars.githubusercontent.com/u/53983568','video advocate','OPERATOR',1,'2025-12-25 08:42:22.211','UENE'),
(8,'user_9lamWDiCf3YNRac','leonardo_hansen@yahoo.com','Leonardo','Hansen','990341336','https://avatars.githubusercontent.com/u/59916211','model','OPERATOR',1,'2025-12-25 08:42:22.218','EISF'),
(9,'user_ZnEfpgZWUogqrcN','domenico_brakus61@yahoo.com','Domenico','Brakus','905181576','https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/94.jpg','grad','ADMIN',1,'2025-12-25 08:42:22.228','CJAA'),
(10,'user_bRsEDWMnPtVdM0C','werner.ortiz@gmail.com','Werner','Ortiz','942101081','https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/62.jpg','mobility supporter, person','SUPERVISOR',1,'2025-12-25 08:42:22.240','MHDM'),
(11,'user_kxDMVtvBJr706n9','walker.ward@gmail.com','Walker','Ward','900429899','https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/male/512/37.jpg','model, singer','D2D',1,'2025-12-25 08:42:22.247','SWSQ'),
(12,'user_HvgPb5LvmYnbInk','antonio_alves@yahoo.com','Rui','Alves','938166893','https://cdn.jsdelivr.net/gh/faker-js/assets-person-portrait/female/512/40.jpg','founder, entrepreneur, designer 💂','D2D',1,'2025-12-25 08:42:22.253','CHVM'),
(13,'user_TPfWxNIiyrz0xqf','marisa_wintheiser@hotmail.com','Marisa','Wintheiser','975550189','https://avatars.githubusercontent.com/u/89682450','goat supporter  ♎','D2D',1,'2025-12-25 08:42:22.259','SFHM'),
(14,'user_snRxu5URUkQgyrR','jaylon_gutkowski@hotmail.com','Jaylon','Gutkowski','982880233','https://avatars.githubusercontent.com/u/97249105','grad, author, author 📗','D2D',1,'2025-12-25 08:42:22.266','OVZC'),
(15,'user_lLB11LfIb1f2xat','otilia_sauer47@yahoo.com','Otilia','Sauer','929424549','https://avatars.githubusercontent.com/u/87945146','public speaker, author','D2D',1,'2025-12-25 08:42:22.272','ZDUZ'),
(16,'user_37TbAhUagkbsrR4h7l3XgmVf1DN','rodrigues_coimbra@gmail.com','Rodrigues','Coimbra','923396689',NULL,NULL,'OPERATOR',1,'2025-12-28 13:51:05.699','ABCD'),
(19,'user_37mr2vTPcjDa7p9TOKISnbnE0uz','geral@luispinheiro.pt','Luis','Pinheiro','923565129',NULL,NULL,'OPERATOR',1,'2026-01-04 09:28:03.240','AWST'),
(20,'user_37pnO0cK6eI3V6zvvZDNAH2U3D5','carlos_antunes@live.com','Carlos','Antunes','914564545',NULL,NULL,'OPERATOR',1,'2026-01-05 10:27:23.822','MLKP'),
(21,'user_38RmKPwsjBO8jZnqFuhobogh1Cj','mcm@gmail.com','Mariana','Mascate','21147147',NULL,NULL,'OPERATOR',1,'2026-01-18 21:11:32.316','WWWW');
/*!40000 ALTER TABLE `User` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) unsigned NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES
('3230540c-79a7-41f0-b20c-d28bfb4c1579','25b9b7e6df8bbb7cc912b61e4c40a2801f1ca54995429bca7e6ce73f68178cd9','2025-12-25 08:39:27.324','20251225083926_fix_internal_id',NULL,NULL,'2025-12-25 08:39:26.644',1),
('d01a2b34-3502-448b-8a98-076a81d046d8','a3be3d94102f0921f68175329f88b42666b3fda6b9b422b862ca19d3a8713e59','2025-12-25 08:32:24.243','20251113154356_first_data_update',NULL,NULL,'2025-12-25 08:32:23.965',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-01-20 10:54:02
