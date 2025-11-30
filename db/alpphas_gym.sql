CREATE DATABASE  IF NOT EXISTS `alpphas_gym` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `alpphas_gym`;
-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: alpphas_gym
-- ------------------------------------------------------
-- Server version	8.0.42

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `agendamentos`
--

DROP TABLE IF EXISTS `agendamentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `agendamentos` (
  `id_agendamento` int NOT NULL AUTO_INCREMENT,
  `id_aluno` int NOT NULL,
  `id_profissional` int NOT NULL,
  `tipo_agendamento` enum('treino','consulta','avaliacao') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_hora_inicio` datetime NOT NULL,
  `data_hora_fim` datetime DEFAULT NULL,
  `status` enum('marcado','cancelado','remarcado','concluido') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT 'marcado',
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id_agendamento`),
  KEY `id_aluno` (`id_aluno`),
  KEY `id_profissional` (`id_profissional`),
  CONSTRAINT `agendamentos_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `agendamentos_ibfk_2` FOREIGN KEY (`id_profissional`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `agendamentos`
--

LOCK TABLES `agendamentos` WRITE;
/*!40000 ALTER TABLE `agendamentos` DISABLE KEYS */;
INSERT INTO `agendamentos` VALUES (1,13,14,'consulta','2025-09-26 18:04:00','2025-09-26 18:04:00','cancelado',NULL),(2,13,14,'avaliacao','2025-09-25 09:51:00','2025-09-25 10:51:00','concluido',NULL),(3,13,14,'consulta','2025-09-05 12:50:00','2025-09-05 13:50:00','cancelado',NULL),(4,13,14,'avaliacao','2025-09-05 11:51:00','2025-09-05 12:51:00','cancelado',NULL),(5,13,12,'avaliacao','2025-09-05 17:06:00','2025-09-05 17:06:00','concluido',NULL),(6,13,12,'avaliacao','2025-09-05 17:06:00','2025-09-05 17:06:00','concluido',NULL),(7,13,12,'avaliacao','2025-09-05 17:09:00','2025-09-05 17:09:00','cancelado',NULL),(8,13,12,'treino','2025-09-05 17:48:00','2025-09-05 17:48:00','cancelado',NULL);
/*!40000 ALTER TABLE `agendamentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `alimentos`
--

DROP TABLE IF EXISTS `alimentos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `alimentos` (
  `id_alimento` int NOT NULL AUTO_INCREMENT,
  `id_refeicao` int NOT NULL,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `peso` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_alimento`),
  KEY `fk_refeicao_alimento` (`id_refeicao`),
  CONSTRAINT `alimentos_ibfk_1` FOREIGN KEY (`id_refeicao`) REFERENCES `refeicoes` (`id_refeicao`) ON DELETE CASCADE,
  CONSTRAINT `fk_refeicao_alimento` FOREIGN KEY (`id_refeicao`) REFERENCES `refeicoes` (`id_refeicao`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=500 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `alimentos`
--

LOCK TABLES `alimentos` WRITE;
/*!40000 ALTER TABLE `alimentos` DISABLE KEYS */;
INSERT INTO `alimentos` VALUES (484,6,'arroz','300 g'),(485,7,'arroz','300 g'),(486,8,'Banana','180 g'),(487,9,'pão','200 g'),(489,11,'arroz','200g'),(491,13,'banan','345'),(492,13,'manga','200'),(493,14,'Arroz','200 g'),(495,16,'Arroz','300 g'),(496,16,'Feijão','200 g'),(497,17,'banana','150 g'),(498,18,'tes','12'),(499,19,'batata','146');
/*!40000 ALTER TABLE `alimentos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `avaliacoesfisicas`
--

DROP TABLE IF EXISTS `avaliacoesfisicas`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `avaliacoesfisicas` (
  `id_avaliacao` int NOT NULL AUTO_INCREMENT,
  `id_aluno` int NOT NULL,
  `id_profissional` int NOT NULL,
  `data_avaliacao` date NOT NULL,
  `peso` decimal(5,2) DEFAULT NULL,
  `altura` decimal(4,2) DEFAULT NULL,
  `idade` int DEFAULT NULL,
  `dobra_peitoral` decimal(5,2) DEFAULT NULL,
  `imc` decimal(5,2) DEFAULT NULL,
  `percentual_gordura` decimal(5,2) DEFAULT NULL,
  `massa_gorda` decimal(5,2) DEFAULT NULL,
  `massa_magra` decimal(5,2) DEFAULT NULL,
  `pescoco` decimal(5,2) DEFAULT NULL,
  `ombro` decimal(5,2) DEFAULT NULL,
  `torax` decimal(5,2) DEFAULT NULL,
  `cintura` decimal(5,2) DEFAULT NULL,
  `abdomen` decimal(5,2) DEFAULT NULL,
  `quadril` decimal(5,2) DEFAULT NULL,
  `braco_direito` decimal(5,2) DEFAULT NULL,
  `braco_esquerdo` decimal(5,2) DEFAULT NULL,
  `antebraco_direito` decimal(5,2) DEFAULT NULL,
  `antebraco_esquerdo` decimal(5,2) DEFAULT NULL,
  `coxa_direita` decimal(5,2) DEFAULT NULL,
  `coxa_esquerda` decimal(5,2) DEFAULT NULL,
  `panturrilha_direita` decimal(5,2) DEFAULT NULL,
  `panturrilha_esquerda` decimal(5,2) DEFAULT NULL,
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `dobra_triceps` decimal(5,2) DEFAULT NULL,
  `dobra_subescapular` decimal(5,2) DEFAULT NULL,
  `dobra_biceps` decimal(5,2) DEFAULT NULL,
  `dobra_axilar_media` decimal(5,2) DEFAULT NULL,
  `dobra_supra_iliaca` decimal(5,2) DEFAULT NULL,
  `braco_d_contraido` decimal(5,2) DEFAULT NULL,
  `braco_e_contraido` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id_avaliacao`),
  KEY `fk_avaliacoes_aluno` (`id_aluno`),
  KEY `fk_avaliacoes_profissional` (`id_profissional`),
  CONSTRAINT `avaliacoesfisicas_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `avaliacoesfisicas_ibfk_2` FOREIGN KEY (`id_profissional`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `fk_avaliacoes_aluno` FOREIGN KEY (`id_aluno`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `fk_avaliacoes_profissional` FOREIGN KEY (`id_profissional`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `avaliacoesfisicas`
--

LOCK TABLES `avaliacoesfisicas` WRITE;
/*!40000 ALTER TABLE `avaliacoesfisicas` DISABLE KEYS */;
INSERT INTO `avaliacoesfisicas` VALUES (1,13,12,'2025-08-25',98.00,1.94,31,12.00,26.04,15.49,15.18,82.82,NULL,110.00,90.00,87.00,88.00,96.00,35.00,35.00,36.00,36.00,70.00,70.00,40.00,40.00,NULL,8.00,11.00,6.00,7.00,7.00,38.00,38.00),(3,13,14,'2025-09-05',98.00,1.94,31,12.00,26.04,21.35,20.92,77.08,NULL,145.00,132.00,112.00,104.00,132.00,54.00,54.00,42.00,42.00,123.00,123.00,45.00,45.00,NULL,12.00,12.00,12.00,12.00,12.00,57.00,57.00),(4,11,12,'2025-09-05',109.99,1.90,31,12.00,30.47,21.35,23.48,86.51,NULL,123.00,123.00,123.00,123.00,123.00,12.00,12.00,12.00,12.00,56.00,56.00,34.00,34.00,NULL,12.00,12.00,12.00,12.00,12.00,23.00,23.00);
/*!40000 ALTER TABLE `avaliacoesfisicas` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `exercicios`
--

DROP TABLE IF EXISTS `exercicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `exercicios` (
  `id_exercicio` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `grupo_muscular` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `video` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id_exercicio`)
) ENGINE=InnoDB AUTO_INCREMENT=142 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `exercicios`
--

LOCK TABLES `exercicios` WRITE;
/*!40000 ALTER TABLE `exercicios` DISABLE KEYS */;
INSERT INTO `exercicios` VALUES (1,'Flexão clássica','Peito','','https://youtu.be/rsjhUbDQx-A'),(2,'Flexão diamante','Peito','','https://youtu.be/vQF0ykMk0j8'),(3,'Supino reto com barra (versão curta)','Peito','','https://youtu.be/y-6sxIE2qjg'),(4,'Supino inclinado com halteres','Peito','','https://youtu.be/FCPrBSGjAqs'),(5,'Supino declinado com barra','Peito','','https://youtu.be/mGTQ8gt2ZgA'),(6,'Crucifixo reto com halteres','Peito','','https://youtu.be/lajVDrLzNrE'),(7,'Crossover na polia','Peito','','https://youtu.be/M0dFZkXZN-4'),(8,'Pullover com halter','Peito','','https://youtu.be/TwI1KYJeWjc'),(9,'Push-up com palmas','Peito','','https://youtu.be/3u2o9-0AgqU'),(10,'Flexão inclinada','Peito','','https://youtu.be/LrLzqGrpc3c'),(11,'Peck deck','Peito','','https://youtu.be/jf4tWEr3NtQ'),(12,'Dips entre bancos','Peito','','https://youtu.be/32eWi2uDzC4'),(13,'Decline push-up','Peito','','https://youtu.be/A4Uw1Sz-tFk'),(14,'Push-up arqueiro','Peito','','https://youtu.be/0gLuJwx6UdQ'),(15,'Supino com pegada fechada','Peito','','https://youtu.be/VdwsrD49X5I'),(16,'Flexão com rotação','Peito','','https://youtu.be/9SEeYAtXbPU'),(17,'Flexão hindu','Peito','','https://youtu.be/d1HEcdo_w3Y'),(18,'Crucifixo invertido','Peito','','https://youtu.be/t1KqvNJXicA'),(19,'Push-up explosiva','Peito','','https://youtu.be/UHs-lHqOq44'),(20,'Flexão espartana','Peito','','https://youtu.be/vYrHyqPEvGc'),(21,'Pull-up clássico','Costas','','https://youtu.be/EMau4puuTz0'),(22,'Pull-down na polia','Costas','','https://youtu.be/VZ4OBMMkPkg'),(23,'Remada curvada','Costas','','https://youtu.be/NHXTcZF0Ef8'),(24,'Remada unilateral','Costas','','https://youtu.be/IyMuJRsFnlU'),(25,'Remada alta com barra','Costas','','https://youtu.be/d_KZxkY_0cM'),(26,'Pullover com cabo','Costas','','https://youtu.be/FEn9WQuaVZs'),(27,'Remada baixa polia','Costas','','https://youtu.be/G1GMBq-utX0'),(28,'Levantamento terra','Costas','','https://youtu.be/Rm3o5jN8rMU'),(29,'Hiperextensão lombar','Costas','','https://youtu.be/6lypIyxWU70'),(30,'Superman','Costas','','https://youtu.be/Z74u9pKIBM8'),(31,'Pull-over na polia alta','Costas','','https://youtu.be/ls11gI4XqvU'),(32,'Remada no TRX','Costas','','https://youtu.be/8f53-Wt2MbE'),(33,'Remada invertida','Costas','','https://youtu.be/eozdVDA78K0'),(34,'Pull-up australiano','Costas','','https://youtu.be/63QxqugfBqI'),(35,'One-arm pull-down','Costas','','https://youtu.be/kMvRsShVHZM'),(36,'Remada T-bar','Costas','','https://youtu.be/UwYDAGU3UlM'),(37,'Pull-down pegada V','Costas','','https://youtu.be/y9oe0vNogYc'),(38,'Dead hang','Costas','','https://youtu.be/pXYTReZuiVM'),(39,'Good morning','Costas','','https://youtu.be/jYdz8PF4NXk'),(40,'Puxada atrás na barra','Costas','','https://youtu.be/xnCu9Z9IjRs'),(41,'Agachamento livre','Pernas','','https://youtu.be/b4mLLXX9bRo'),(42,'Agachamento frontal','Pernas','','https://youtu.be/Ux9lp6l21qI'),(43,'Leg press','Pernas','','https://youtu.be/NIUExfvsHb8'),(44,'Passada (lunge)','Pernas','','https://youtu.be/MFFT01rQ7zU'),(45,'Avanço lateral','Pernas','','https://youtu.be/ZXoLdL-uxDI'),(46,'Cadeira extensora','Pernas','','https://youtu.be/3it7EFE9Mdc'),(47,'Cadeira flexora','Pernas','','https://youtu.be/4v69Ge54WCA'),(48,'Stiff','Pernas','','https://youtu.be/mUIMV3kFBLs'),(49,'Panturrilha em pé','Pernas','','https://youtu.be/EwQRj7r2Fgw'),(50,'Panturrilha sentada','Pernas','','https://youtu.be/h4pHFWr6n5M'),(51,'Agachamento búlgaro','Pernas','','https://youtu.be/2C-uNgKwPLE'),(52,'Sumô deadlift','Pernas','','https://youtu.be/z6PJMT2y8G0'),(53,'Cadeira abdutora','Pernas','','https://youtu.be/_3L7Rc9-QLs'),(54,'Cadeira adutora','Pernas','','https://youtu.be/4Zkgf0Yf8Tw'),(55,'Step-up','Pernas','','https://youtu.be/8VI7Nu7Pfi4'),(56,'Agachamento pistola','Pernas','','https://youtu.be/4FX6PjdMD0g'),(57,'Good morning com barra','Pernas','','https://youtu.be/jYdz8PF4NXk'),(58,'Deadlift romeno','Pernas','','https://youtu.be/KFOmkmQ8T2E'),(59,'Glute bridge','Pernas','','https://youtu.be/m2TswKCc9vM'),(60,'Sumô com halteres','Pernas','','https://youtu.be/a9naq4ALxAs'),(61,'Elevação de quadril (glute bridge)','Glúteos','','https://youtu.be/m2TswKCc9vM'),(62,'Ponte unilateral','Glúteos','','https://youtu.be/Wmz6MCqPU20'),(63,'Abdução de quadril em pé','Glúteos','','https://youtu.be/Lv1Qp9qlX9Y'),(64,'Kickback com caneleira','Glúteos','','https://youtu.be/X2cCA-xaDiM'),(65,'Passada com foco no glúteo','Glúteos','','https://youtu.be/MFFT01rQ7zU'),(66,'Step-up lateral','Glúteos','','https://youtu.be/3wpZwp4A1fU'),(67,'Agachamento sumô','Glúteos','','https://youtu.be/1gQYUw4Xaho'),(68,'Elevação de quadril no banco','Glúteos','','https://youtu.be/bqSGZYFfg4w'),(69,'Hip thrust','Glúteos','','https://youtu.be/ytGaGIn3SjE'),(70,'Deadlift romeno','Glúteos','','https://youtu.be/KFOmkmQ8T2E'),(71,'Avanço curvado','Glúteos','','https://youtu.be/1b_r-gfYP6U'),(72,'Kickback em quatro apoios','Glúteos','','https://youtu.be/bMt2qt_V_Rc'),(73,'Peso morto búlgaro','Glúteos','','https://youtu.be/UBhb-pjIZzw'),(74,'Abdução com mini-band','Glúteos','','https://youtu.be/9ENiv081hws'),(75,'Step-up usando banco alto','Glúteos','','https://youtu.be/1iMtxFerLcg'),(76,'Glute bridge com uma perna','Glúteos','','https://youtu.be/8Zw07n0uTC8'),(77,'Avanço reverso','Glúteos','','https://youtu.be/1g5-CsWt6lY'),(78,'Agachamento com mini-band','Glúteos','','https://youtu.be/PS7d3Y5xxck'),(79,'Ponte com bola suíça','Glúteos','','https://youtu.be/JGxU53xSpAQ'),(80,'Desenvolvimento militar','Ombros','','https://youtu.be/H6LEjy3kEYk'),(81,'Desenvolvimento Arnold','Ombros','','https://youtu.be/v7AYKMP6rOE'),(82,'Elevação lateral','Ombros','','https://youtu.be/w3q8Od5qYkk'),(83,'Elevação frontal','Ombros','','https://youtu.be/-t7fuZ0KhDA'),(84,'Remada alta','Ombros','','https://youtu.be/d_KZxkY_0cM'),(85,'Face pull','Ombros','','https://youtu.be/rep-qVOkqgk'),(86,'Elevação posterior no peck-deck','Ombros','','https://youtu.be/YpZiFZ-FBUo'),(87,'Desenvolvimento na máquina','Ombros','','https://youtu.be/QvVx12bNmwM'),(88,'Pike push-up','Ombros','','https://youtu.be/8tUPXhgF0eY'),(89,'Press militar unilateral','Ombros','','https://youtu.be/4mRyKJvG1m0'),(90,'Elevação lateral inclinada','Ombros','','https://youtu.be/4bpLEFUXPME'),(91,'Push press','Ombros','','https://youtu.be/xJxFHL1zK5I'),(92,'Desenvolvimento com halteres sentado','Ombros','','https://youtu.be/GJHnKsp1Y5A'),(93,'Elevação frontal com barra','Ombros','','https://youtu.be/UoFnnZKIQ4I'),(94,'Arnold press sentado','Ombros','','https://youtu.be/vDW1hnqVdno'),(95,'Elevação Y','Ombros','','https://youtu.be/XS1LU2e7Zr8'),(96,'Elevação W','Ombros','','https://youtu.be/PK2VfP-zc9k'),(97,'Elevação lateral com cabo','Ombros','','https://youtu.be/qKj0e2g0Yt4'),(98,'Remada alta com cabo','Ombros','','https://youtu.be/7inLDEk5GSM'),(99,'Desenvolvimento no TRX','Ombros','','https://youtu.be/Ui6CFOoTCZs'),(100,'Prancha Isométrica','Core','Fortalece transverso abdominal','https://youtu.be/Zs63N7N3GBA'),(101,'Prancha Lateral','Core','Ativa oblíquos','https://youtu.be/Tbrbf2zBU3g'),(102,'Abdominal Supra Solo','Core','Clássico para reto abdominal','https://youtu.be/xSdWjUdyUmI'),(103,'Abdominal Infra com Elevação de Pernas','Core','Foco em infra','https://youtu.be/ZZQu7EF5ZuE'),(104,'Abdominal Bicicleta','Core','Ativa toda a parede abdominal','https://youtu.be/PCJxFMyIYpM'),(105,'Prancha com Toque de Ombros','Core','Melhora estabilidade','https://youtu.be/_kLIlrU0RJU'),(106,'Escalador','Core','Trabalha transverso e cardio','https://youtu.be/5BaxKFPB9Og'),(107,'Prancha com Elevação Alternada','Core','Melhora equilíbrio','https://youtu.be/UPHFFHDQWeI'),(108,'Abdominal Remador','Core','Integra oblíquos e reto','https://youtu.be/Cml5v-FtQ0s'),(109,'Prancha Reversa','Core','Foco no reto abdominal inferior','https://youtu.be/BcsqXYLCdGo'),(110,'Lombar Solo','Core','Fortalece paravertebrais','https://youtu.be/SejLntpGHtQ'),(111,'Superman','Core','Ativa lombar e glúteos','https://youtu.be/6RQp_R7s3Xc'),(112,'Abdominal Canivete','Core','Alta exigência do core','https://youtu.be/qSbQbTw_HQI'),(113,'Prancha Dinâmica','Core','Estímulo avançado','https://youtu.be/D5p4J0q-eUM'),(114,'Abdominal Oblíquo Solo','Core','Trabalha oblíquos com rotação','https://youtu.be/_2VRiHhxBL8'),(115,'Abdominal em Pé com Corda','Core','Pode ser feito com polia','https://youtu.be/OCZRYoL6Ppo'),(116,'Elevação de Pernas na Barra','Core','Foco em abdominal inferior','https://youtu.be/mKZpZsCvcoA'),(117,'Prancha com Cotovelos','Core','Fundamental para iniciantes','https://youtu.be/ZvYAQn9prOQ'),(118,'Prancha com Rotação de Quadril','Core','Trabalha estabilizadores','https://youtu.be/_YttHd9Bv7Q'),(119,'Escalador Cruzado','Core','Trabalha oblíquos com cardio','https://youtu.be/GWgSLKDWQ4I'),(120,'Encolhimento com Halteres','Trapézio','Isola o trapézio superior','https://youtu.be/ThwnYmdkGz0'),(121,'Encolhimento com Barra','Trapézio','Ativação bilateral intensa','https://youtu.be/vEoRG_4iGLk'),(122,'Remada Alta','Trapézio','Ativa trapézio e deltoide','https://youtu.be/U3OqMZBtcrU'),(123,'Encolhimento na Máquina Smith','Trapézio','Execução controlada','https://youtu.be/UBW-LT7kCG4'),(124,'Encolhimento na Polia','Trapézio','Tensão constante','https://youtu.be/DkQhQnTE7Jk'),(125,'Remada Curvada Pegada Aberta','Trapézio','Ativa fibras médias','https://youtu.be/xT8Zn4I9nvA'),(126,'Face Pull','Trapézio','Excelente para trapézio médio e postura','https://youtu.be/MR4HF80upZs'),(127,'Puxada Alta no Cabo','Trapézio','Trabalha parte superior e ombros','https://youtu.be/NbCNZ_2zUgY'),(128,'Trapézio com Kettlebell','Trapézio','Versátil e funcional','https://youtu.be/B_hU9P5xywU'),(129,'Encolhimento com Barra por Trás','Trapézio','Foco posterior','https://youtu.be/KeEZUQ1sH0A'),(130,'Encolhimento com Halter Unilateral','Trapézio','Equilíbrio muscular','https://youtu.be/MK1ZyLuuvsM'),(131,'Encolhimento com Corda','Trapézio','Variação no cabo','https://youtu.be/Hr2v59M8a3o'),(132,'Trapézio no TRX','Trapézio','Trabalho com peso corporal','https://youtu.be/07scvTIuWVc'),(133,'Remada Invertida','Trapézio','Trabalha médio e inferior','https://youtu.be/McXGJURsLhI'),(134,'Y-Raise com Halteres','Trapézio','Ativa fibras inferiores','https://youtu.be/wymBYsgQnzI'),(135,'Face Pull com Corda Alta','Trapézio','Correção postural','https://youtu.be/mA0_fELpyVU'),(136,'Remada Alta Unilateral','Trapézio','Foco em controle e simetria','https://youtu.be/OFVYyHimTQQ'),(137,'Shrug Isométrico na Barra Fixa','Trapézio','Fortalece na isometria','https://youtu.be/m1akgIoNxyM'),(138,'Levantamento Terra com Pegada Estreita','Trapézio','Ativa toda cadeia posterior','https://youtu.be/6Q2pkCMTt4M'),(139,'Barra Fixa Isométrica','Trapézio','Foco em contração sustentada','https://youtu.be/gVR4MeEv6Tg');
/*!40000 ALTER TABLE `exercicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs` (
  `id_log` int NOT NULL AUTO_INCREMENT,
  `tipo_log` enum('acao','envio') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `usuario_origem` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `acao` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `detalhes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `id_usuario` int DEFAULT NULL,
  `tipo_envio` enum('email','whatsapp') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `destino` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `conteudo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `status` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_envio` datetime DEFAULT NULL,
  `data` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_log`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `logs_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=173 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs`
--

LOCK TABLES `logs` WRITE;
/*!40000 ALTER TABLE `logs` DISABLE KEYS */;
INSERT INTO `logs` VALUES (1,'acao','sistema','login_falha','Tentativa com e-mail inexistente: joao.personal@teste.com',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-09 22:14:18'),(2,'acao','Joao Perosnal','registro_usuario','Registrou novo usuário tipo personal',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 00:23:38'),(3,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 00:24:40'),(4,'acao','Administrador do Sistema','login_falha','Senha incorreta',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 14:49:30'),(5,'acao','Administrador do Sistema','login_falha','Senha incorreta',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 14:49:56'),(6,'acao','Administrador do Sistema','login_falha','Senha incorreta',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 14:57:56'),(7,'acao','Administrador do Sistema','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 14:58:12'),(8,'acao','sistema','login_falha','Tentativa com e-mail inexistente: joao.personal@teste',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 15:03:18'),(9,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 15:04:43'),(10,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 15:52:50'),(11,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 16:10:15'),(12,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 16:28:07'),(13,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 16:59:44'),(14,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 17:13:03'),(15,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 17:24:01'),(16,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 20:28:30'),(17,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 20:43:58'),(18,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 21:44:40'),(19,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 22:56:26'),(20,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 23:31:50'),(21,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-12 23:47:56'),(22,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-13 00:03:54'),(23,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-13 00:21:28'),(24,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-13 00:37:04'),(25,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-13 00:57:30'),(26,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-13 01:15:17'),(27,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-13 16:27:52'),(28,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-13 16:48:27'),(29,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-13 17:29:32'),(30,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-13 17:45:24'),(31,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-13 18:35:13'),(32,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-13 22:17:02'),(33,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-13 22:32:23'),(34,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-13 22:51:25'),(35,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-13 23:38:24'),(36,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-15 23:39:41'),(37,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-15 23:57:40'),(38,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-16 00:10:24'),(39,'acao','sistema','login_falha','Tentativa com e-mail inexistente: joao.filho@solinftec.com',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-16 16:41:43'),(40,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-16 16:41:50'),(41,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-16 16:53:13'),(42,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-16 17:09:57'),(43,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-16 17:24:08'),(44,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-16 17:41:11'),(45,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-31 23:32:40'),(46,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-07-31 23:47:19'),(47,'acao','Joao Perosnal','login_falha','Senha incorreta',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-01 00:07:35'),(48,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-01 00:07:39'),(49,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-23 16:11:57'),(50,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-25 16:49:25'),(51,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-25 17:09:53'),(52,'acao','João Aluno','registro_usuario','Registrou novo usuário tipo aluno',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-25 17:26:12'),(53,'acao','Joâo Nutri','registro_usuario','Registrou novo usuário tipo nutricionista',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-25 17:26:40'),(54,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-25 17:26:53'),(55,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-25 17:27:52'),(56,'envio',NULL,NULL,NULL,13,'whatsapp','+5567998734770','Erro no envio WhatsApp: Olá João Aluno, segue o link para sua avaliação física personalizada:\n\nhttp://localhost:5000/avaliacoes/1/pdf\n\nEquipe Alpphas GYM','falha: 404 Client Error: Not Found for url: https://api.ultramsg.com/instance122117/messages/chat','2025-08-25 14:31:52','2025-08-25 17:31:52'),(57,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-25 17:33:17'),(58,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-25 17:39:50'),(59,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-25 17:40:15'),(60,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-08-25 17:57:07'),(61,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-01 00:07:33'),(62,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-01 00:25:28'),(63,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-01 00:39:25'),(64,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-01 00:43:18'),(65,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-01 00:43:42'),(66,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-01 00:49:08'),(67,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-01 21:46:06'),(68,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-01 22:07:54'),(69,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-01 22:09:30'),(70,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-01 22:25:52'),(71,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-01 22:37:57'),(72,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-01 22:38:31'),(73,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-01 22:41:31'),(74,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-02 23:46:16'),(75,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-03 00:01:42'),(76,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-03 00:10:48'),(77,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-03 00:38:22'),(78,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-03 00:39:17'),(79,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-03 00:41:39'),(80,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-03 00:48:04'),(81,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-03 00:48:53'),(82,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-03 00:51:39'),(83,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-03 01:14:02'),(84,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 01:11:08'),(85,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 01:11:56'),(86,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 01:25:40'),(87,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 01:42:15'),(88,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 01:57:39'),(89,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 02:07:22'),(90,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 02:17:33'),(91,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 02:20:17'),(92,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 02:21:17'),(93,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 02:31:51'),(94,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 02:34:31'),(95,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 02:35:32'),(96,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 02:38:29'),(97,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 02:41:41'),(98,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 02:59:22'),(99,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 03:00:06'),(100,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 11:50:45'),(101,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 11:54:09'),(102,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 12:12:48'),(103,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 12:23:57'),(104,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 12:24:23'),(105,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 12:31:32'),(106,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 12:56:35'),(107,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 12:58:45'),(108,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 13:27:48'),(109,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 13:28:30'),(110,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 13:42:40'),(111,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 22:19:58'),(112,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 22:57:48'),(113,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 22:59:07'),(114,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 23:03:29'),(115,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 23:14:44'),(116,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 23:40:58'),(117,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 23:41:30'),(118,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 23:42:06'),(119,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-04 23:58:14'),(120,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 00:06:59'),(121,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 00:07:45'),(122,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 00:23:03'),(123,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 00:31:56'),(124,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 00:36:09'),(125,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 00:42:26'),(126,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 00:48:29'),(127,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 12:17:14'),(128,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 12:22:44'),(129,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 12:23:24'),(130,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 12:30:47'),(131,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 12:31:24'),(132,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 12:47:43'),(133,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 12:48:25'),(134,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 13:11:48'),(135,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 13:28:29'),(136,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 13:46:52'),(137,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 14:02:32'),(138,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 14:27:45'),(139,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 14:42:51'),(140,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 14:58:13'),(141,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 15:13:35'),(142,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 15:32:50'),(143,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 17:39:03'),(144,'acao','Joâo Nutri','login_falha','Senha incorreta',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 17:54:37'),(145,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 17:54:43'),(146,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 18:11:21'),(147,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 18:11:37'),(148,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 18:28:03'),(149,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 18:46:35'),(150,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 18:49:48'),(151,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 19:17:39'),(152,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 19:56:03'),(153,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 20:05:27'),(154,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 20:05:55'),(155,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 20:26:36'),(156,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 20:44:18'),(157,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 20:59:28'),(158,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 21:04:24'),(159,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 21:06:13'),(160,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 21:16:08'),(161,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 21:34:49'),(162,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 21:42:18'),(163,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 21:44:29'),(164,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 21:48:21'),(165,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 21:53:58'),(166,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 21:58:31'),(167,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 22:01:37'),(168,'acao','sistema','login_falha','Tentativa com e-mail inexistente: joao.personal@teste',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 22:03:29'),(169,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 22:03:33'),(170,'acao','Joao Perosnal','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 22:16:15'),(171,'acao','João Aluno','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 22:21:45'),(172,'acao','Joâo Nutri','login_sucesso','Login realizado com sucesso',NULL,NULL,NULL,NULL,NULL,NULL,'2025-09-05 22:22:56');
/*!40000 ALTER TABLE `logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planos_treino`
--

DROP TABLE IF EXISTS `planos_treino`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planos_treino` (
  `id_plano` int NOT NULL AUTO_INCREMENT,
  `id_aluno` int NOT NULL,
  `nome_plano` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_plano`),
  KEY `id_aluno` (`id_aluno`),
  CONSTRAINT `planos_treino_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planos_treino`
--

LOCK TABLES `planos_treino` WRITE;
/*!40000 ALTER TABLE `planos_treino` DISABLE KEYS */;
INSERT INTO `planos_treino` VALUES (11,13,'Outubro','2025-09-03 22:29:47'),(13,13,'Novembro','2025-09-05 17:50:56'),(14,13,'teste','2025-09-05 17:55:25'),(16,13,'teste','2025-09-05 18:55:23');
/*!40000 ALTER TABLE `planos_treino` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `planosalimentares`
--

DROP TABLE IF EXISTS `planosalimentares`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `planosalimentares` (
  `id_plano` int NOT NULL AUTO_INCREMENT,
  `id_aluno` int NOT NULL,
  `id_nutricionista` int NOT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `criado_em` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `titulo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT '',
  `descricao_geral` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `data_criacao` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_plano`),
  KEY `id_aluno` (`id_aluno`),
  KEY `id_nutricionista` (`id_nutricionista`),
  CONSTRAINT `planosalimentares_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `planosalimentares_ibfk_2` FOREIGN KEY (`id_nutricionista`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `planosalimentares`
--

LOCK TABLES `planosalimentares` WRITE;
/*!40000 ALTER TABLE `planosalimentares` DISABLE KEYS */;
INSERT INTO `planosalimentares` VALUES (5,11,14,0,'2025-09-05 13:47:21','',NULL,'2025-09-05 10:47:21'),(6,13,14,0,'2025-09-05 14:32:38','',NULL,'2025-09-05 11:32:38'),(7,13,14,0,'2025-09-05 14:32:44','',NULL,'2025-09-05 11:32:44'),(8,13,14,0,'2025-09-05 14:36:23','',NULL,'2025-09-05 11:36:23'),(9,13,14,0,'2025-09-05 14:41:18','',NULL,'2025-09-05 11:41:18'),(10,13,14,0,'2025-09-05 14:42:34','',NULL,'2025-09-05 11:42:34'),(11,13,14,1,'2025-09-05 18:47:12','',NULL,'2025-09-05 15:47:12'),(12,13,14,0,'2025-09-05 21:05:48','',NULL,'2025-09-05 18:05:48'),(13,13,14,0,'2025-09-05 21:50:36','',NULL,'2025-09-05 18:50:36');
/*!40000 ALTER TABLE `planosalimentares` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `refeicoes`
--

DROP TABLE IF EXISTS `refeicoes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `refeicoes` (
  `id_refeicao` int NOT NULL AUTO_INCREMENT,
  `id_plano` int NOT NULL,
  `titulo` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `calorias_estimadas` decimal(10,2) DEFAULT NULL,
  PRIMARY KEY (`id_refeicao`),
  KEY `fk_plano_refeicao` (`id_plano`),
  CONSTRAINT `fk_plano_refeicao` FOREIGN KEY (`id_plano`) REFERENCES `planosalimentares` (`id_plano`) ON DELETE CASCADE,
  CONSTRAINT `refeicoes_ibfk_1` FOREIGN KEY (`id_plano`) REFERENCES `planosalimentares` (`id_plano`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `refeicoes`
--

LOCK TABLES `refeicoes` WRITE;
/*!40000 ALTER TABLE `refeicoes` DISABLE KEYS */;
INSERT INTO `refeicoes` VALUES (6,6,'almoço',345656.00),(7,7,'almoço',345656.00),(8,5,'Teste',1234.00),(9,8,'cafe',1234.00),(11,9,'asdasd',23453.00),(13,10,'teste',1234.00),(14,10,'jantar',3900.00),(16,11,'Café',3200.00),(17,11,'Almoço',200.00),(18,12,'tes',12.00),(19,13,'test',0.00);
/*!40000 ALTER TABLE `refeicoes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrostreino`
--

DROP TABLE IF EXISTS `registrostreino`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrostreino` (
  `id_registro` int NOT NULL AUTO_INCREMENT,
  `id_aluno` int NOT NULL,
  `id_treino` int NOT NULL,
  `data_execucao` datetime DEFAULT CURRENT_TIMESTAMP,
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `ativo` tinyint(1) DEFAULT '1',
  `id_plano` int DEFAULT NULL,
  PRIMARY KEY (`id_registro`),
  KEY `id_aluno` (`id_aluno`),
  KEY `id_treino` (`id_treino`),
  KEY `fk_registro_plano` (`id_plano`),
  CONSTRAINT `fk_registro_plano` FOREIGN KEY (`id_plano`) REFERENCES `planos_treino` (`id_plano`),
  CONSTRAINT `registrostreino_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `registrostreino_ibfk_2` FOREIGN KEY (`id_treino`) REFERENCES `treinos` (`id_treino`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrostreino`
--

LOCK TABLES `registrostreino` WRITE;
/*!40000 ALTER TABLE `registrostreino` DISABLE KEYS */;
INSERT INTO `registrostreino` VALUES (1,13,26,'2025-09-03 22:56:31','',0,NULL),(2,13,26,'2025-09-03 22:56:54','',0,NULL),(3,13,27,'2025-09-03 23:08:35','',0,NULL),(4,13,26,'2025-09-03 23:17:18','',0,NULL),(5,13,27,'2025-09-04 08:51:02','',0,11),(6,13,26,'2025-09-04 10:28:09','',1,11),(7,13,27,'2025-09-04 19:59:45','',0,11),(8,13,27,'2025-09-04 20:13:44','',0,11),(9,13,26,'2025-09-04 21:07:17','',0,11),(10,13,27,'2025-09-04 21:35:47','',0,11),(11,13,26,'2025-09-05 09:23:08','',0,11),(12,13,26,'2025-09-05 17:30:26','',0,11),(13,13,27,'2025-09-05 17:35:05','',0,11),(14,13,26,'2025-09-05 18:03:58','teste',0,11);
/*!40000 ALTER TABLE `registrostreino` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `registrostreino_exercicios`
--

DROP TABLE IF EXISTS `registrostreino_exercicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `registrostreino_exercicios` (
  `id_registro` int NOT NULL,
  `id_exercicio` int NOT NULL,
  `carga` decimal(5,2) DEFAULT NULL,
  PRIMARY KEY (`id_registro`,`id_exercicio`),
  KEY `id_exercicio` (`id_exercicio`),
  CONSTRAINT `registrostreino_exercicios_ibfk_1` FOREIGN KEY (`id_registro`) REFERENCES `registrostreino` (`id_registro`) ON DELETE CASCADE,
  CONSTRAINT `registrostreino_exercicios_ibfk_2` FOREIGN KEY (`id_exercicio`) REFERENCES `exercicios` (`id_exercicio`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `registrostreino_exercicios`
--

LOCK TABLES `registrostreino_exercicios` WRITE;
/*!40000 ALTER TABLE `registrostreino_exercicios` DISABLE KEYS */;
INSERT INTO `registrostreino_exercicios` VALUES (1,3,10.00),(1,4,10.00),(1,15,10.00),(2,3,12.00),(2,4,12.00),(2,15,12.00),(3,23,30.00),(3,25,30.00),(4,3,23.00),(4,4,23.00),(4,15,23.00),(5,23,23.00),(5,25,23.00),(6,3,21.00),(6,4,21.00),(6,15,21.00),(7,23,21.00),(7,25,21.00),(8,23,12.00),(8,25,12.00),(9,3,12.00),(9,4,12.00),(9,15,12.00),(10,23,32.00),(10,25,32.00),(11,3,34.00),(11,4,34.00),(11,15,34.00),(12,3,22.00),(12,4,22.00),(12,6,22.00),(12,15,21.90),(13,1,45.00),(13,23,45.00),(13,25,45.00),(14,3,23.00),(14,4,23.00),(14,6,23.00),(14,15,23.00);
/*!40000 ALTER TABLE `registrostreino_exercicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tokensrevogados`
--

DROP TABLE IF EXISTS `tokensrevogados`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tokensrevogados` (
  `id_token` int NOT NULL AUTO_INCREMENT,
  `jti` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `data_revogacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_token`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tokensrevogados`
--

LOCK TABLES `tokensrevogados` WRITE;
/*!40000 ALTER TABLE `tokensrevogados` DISABLE KEYS */;
/*!40000 ALTER TABLE `tokensrevogados` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `treinoexercicios`
--

DROP TABLE IF EXISTS `treinoexercicios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `treinoexercicios` (
  `id` int NOT NULL AUTO_INCREMENT,
  `id_treino` int NOT NULL,
  `id_exercicio` int NOT NULL,
  `series` int DEFAULT NULL,
  `repeticoes` text COLLATE utf8mb4_unicode_ci,
  `carga` decimal(5,2) DEFAULT NULL,
  `observacoes` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  PRIMARY KEY (`id`),
  KEY `id_treino` (`id_treino`),
  KEY `id_exercicio` (`id_exercicio`),
  CONSTRAINT `treinoexercicios_ibfk_1` FOREIGN KEY (`id_treino`) REFERENCES `treinos` (`id_treino`),
  CONSTRAINT `treinoexercicios_ibfk_2` FOREIGN KEY (`id_exercicio`) REFERENCES `exercicios` (`id_exercicio`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `treinoexercicios`
--

LOCK TABLES `treinoexercicios` WRITE;
/*!40000 ALTER TABLE `treinoexercicios` DISABLE KEYS */;
INSERT INTO `treinoexercicios` VALUES (40,27,23,4,'8 a 12',NULL,''),(41,27,25,4,'8 a 12',NULL,''),(42,27,1,4,'8 a 12',NULL,''),(43,26,4,6,'8 a 12',NULL,'2 série de aquecimento, e 4 séries com progressão de carga'),(44,26,3,4,'8 a 12',NULL,''),(45,26,15,4,'8 a 12',NULL,''),(46,26,6,4,'12',NULL,'teste'),(49,29,23,4,'12',NULL,''),(50,30,23,4,'12',NULL,'sdfsdf'),(52,32,23,3,'3',NULL,'4');
/*!40000 ALTER TABLE `treinoexercicios` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `treinos`
--

DROP TABLE IF EXISTS `treinos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `treinos` (
  `id_treino` int NOT NULL AUTO_INCREMENT,
  `id_aluno` int NOT NULL,
  `id_profissional` int NOT NULL,
  `nome_treino` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `objetivo` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `ativo` tinyint(1) DEFAULT '1',
  `id_plano` int DEFAULT NULL,
  PRIMARY KEY (`id_treino`),
  KEY `id_aluno` (`id_aluno`),
  KEY `id_profissional` (`id_profissional`),
  KEY `id_plano` (`id_plano`),
  CONSTRAINT `treinos_ibfk_1` FOREIGN KEY (`id_aluno`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `treinos_ibfk_2` FOREIGN KEY (`id_profissional`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `treinos_ibfk_3` FOREIGN KEY (`id_plano`) REFERENCES `planos_treino` (`id_plano`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `treinos`
--

LOCK TABLES `treinos` WRITE;
/*!40000 ALTER TABLE `treinos` DISABLE KEYS */;
INSERT INTO `treinos` VALUES (26,13,12,'Peito','','2025-09-04 01:29:47',1,11),(27,13,12,'costas','','2025-09-04 01:29:47',1,11),(29,13,12,'Costas','','2025-09-05 20:50:56',0,13),(30,13,12,'costa','','2025-09-05 20:55:25',0,14),(32,13,12,'teste','','2025-09-05 21:55:23',0,16);
/*!40000 ALTER TABLE `treinos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuarios` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `senha_hash` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `tipo_usuario` enum('aluno','personal','nutricionista','admin') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `telefone` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `data_nascimento` date DEFAULT NULL,
  `genero` enum('masculino','feminino','outro') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ativo` tinyint(1) DEFAULT '1',
  `data_criacao` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `cref` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `crn` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `cpf` varchar(14) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `endereco` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci,
  `whatsapp` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `foto_perfil` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `perfil_completo` tinyint(1) DEFAULT '0',
  `criado_em` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email_UNIQUE` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (9,'Administrador do Sistema','administrador@alpphasgym.com','scrypt:32768:8:1$m6Av3UrWyaYkm6cR$1551e5b0699c56a1a797bddbe15b1546a198634d81c2c9fa9bc3e3ea83e3d133354b051ce367ff5951a80271a6bd72bd9f2b89ec1d1d2f051e7cf2901d9ed080','admin',NULL,NULL,NULL,1,'2025-06-21 21:27:35',NULL,NULL,NULL,NULL,NULL,NULL,1,'2025-06-21 19:59:21'),(11,'Aluno Teste','aluno@teste.com','$2b$12$r7pS1aTFRpUpJ7Dtr/Zed.LnrO/U4oTUNhsIeMbkGPcE2oI3fgCQW','aluno',NULL,NULL,NULL,1,'2025-06-21 22:22:51',NULL,NULL,NULL,NULL,NULL,NULL,0,'2025-06-21 19:59:21'),(12,'Joao Perosnal','joao.personal@teste.com','scrypt:32768:8:1$g7xyODP0kHTBB854$6b1b538b1a82d4c3a8be3ebda8520c8b281f58851f1d6fd3983ba9e1affdd6b30da6e40c091ac80c112c2757e55dd8d961c1c15465d1db61e6ade797ec38e0e6','personal',NULL,'1990-01-01',NULL,1,'2025-07-12 00:23:37','123456SSP',NULL,'3253645657','tste','+551812345678','12_treinos.png',1,'2025-07-11 21:23:37'),(13,'João Aluno','joao.aluno@teste.com','scrypt:32768:8:1$cm3OUXllhC9yFWNS$bc553fdc36ce9413200626ba7330e893edd9120b9ec796885bdaa9b7d2040cc45f2ad5c07644c5850f52af0a0fade8b367012cebc0f4bc3d6edaebb8551ba6d8','aluno',NULL,'1993-12-03',NULL,1,'2025-08-25 17:26:12',NULL,NULL,'1234567890934','rua testes','+5567998734770','13_533408374_1955326898535851_1656927599905098997_n.jpg',1,'2025-08-25 14:26:12'),(14,'Joâo Nutri','joao.nutri@teste.com','scrypt:32768:8:1$ZW3ULKhQFsNBN4zW$58f6db03311e469597cdab13d1f037af6391242d60844da3797293f5c784de3996311361ce5ddf6809ceeb3a4ed420d9cd68f46177e0a095f5824313209ef9ba','nutricionista',NULL,'1993-12-03',NULL,1,'2025-08-25 17:26:40',NULL,'1234545','429.214.098-79','tste','+5567998734770',NULL,1,'2025-08-25 14:26:40');
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-05 19:47:17
