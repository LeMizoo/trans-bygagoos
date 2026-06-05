<?php
// Configuration de la base de données
$host = 'localhost';
$dbname = 'bygagoos';
$user = 'root';
$pass = '';

try {
    $bdd = new PDO("mysql:host=$host;dbname=$dbname;charset=utf8", $user, $pass);
    $bdd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    die("Erreur de connexion : " . $e->getMessage());
}

// Démarrer la session
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Vérifier si l'utilisateur est connecté
function estConnecte() {
    return isset($_SESSION['user_id']);
}

// Rediriger vers login si non connecté
function verifierConnexion() {
    if (!estConnecte()) {
        header('Location: index.php');
        exit();
    }
}

// Créer les tables si elles n'existent pas
function initialiserTables() {
    global $bdd;
    
    // Table des motos
    $bdd->exec("CREATE TABLE IF NOT EXISTS motos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        immatriculation VARCHAR(20) NOT NULL UNIQUE,
        km_actuel INT DEFAULT 0,
        km_prochaine_vidange INT DEFAULT 5000,
        date_ajout TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Table des chauffeurs
    $bdd->exec("CREATE TABLE IF NOT EXISTS chauffeurs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(100) NOT NULL,
        telephone VARCHAR(20) NOT NULL,
        moto_id INT,
        date_embauche DATE,
        actif BOOLEAN DEFAULT 1,
        FOREIGN KEY (moto_id) REFERENCES motos(id)
    )");
    
    // Table des courses
    $bdd->exec("CREATE TABLE IF NOT EXISTS courses (
        id INT AUTO_INCREMENT PRIMARY KEY,
        chauffeur_id INT NOT NULL,
        moto_id INT NOT NULL,
        distance_km INT NOT NULL,
        prix INT NOT NULL,
        date_course DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (chauffeur_id) REFERENCES chauffeurs(id),
        FOREIGN KEY (moto_id) REFERENCES motos(id)
    )");
    
    // Table des paramètres
    $bdd->exec("CREATE TABLE IF NOT EXISTS parametres (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nom VARCHAR(50) NOT NULL UNIQUE,
        valeur INT NOT NULL,
        description VARCHAR(200)
    )");
    
    // Table des utilisateurs
    $bdd->exec("CREATE TABLE IF NOT EXISTS utilisateurs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        nom_complet VARCHAR(100),
        role VARCHAR(20) DEFAULT 'admin',
        date_creation TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    
    // Paramètres par défaut
    $bdd->exec("INSERT IGNORE INTO parametres (nom, valeur, description) VALUES 
        ('prix_base', 2000, 'Prix de base en Ariary'),
        ('prix_km', 500, 'Prix par kilomètre en Ariary')");
    
    // Admin par défaut si table vide
    $admin = $bdd->query("SELECT COUNT(*) FROM utilisateurs")->fetchColumn();
    if ($admin == 0) {
        $hash = password_hash('admin123', PASSWORD_DEFAULT);
        $bdd->prepare("INSERT INTO utilisateurs (username, password, nom_complet) VALUES ('admin', ?, 'Administrateur')")->execute([$hash]);
    }
}

// Récupérer les paramètres
function getParametres() {
    global $bdd;
    $prix_base = $bdd->query("SELECT valeur FROM parametres WHERE nom = 'prix_base'")->fetchColumn();
    $prix_km = $bdd->query("SELECT valeur FROM parametres WHERE nom = 'prix_km'")->fetchColumn();
    return ['prix_base' => $prix_base, 'prix_km' => $prix_km];
}

// Calculer le prix
function calculerPrix($distance, $prix_base, $prix_km) {
    return $prix_base + ($distance * $prix_km);
}

// Initialiser les tables
initialiserTables();

// Activer les erreurs en développement
error_reporting(E_ALL);
ini_set('display_errors', 1);
?>