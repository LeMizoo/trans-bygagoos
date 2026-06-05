<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

require_once '../config.php';

// Vérifier le token
$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

if (empty($token)) {
    echo json_encode(['success' => false, 'message' => 'Token requis']);
    exit;
}

$stmt = $bdd->prepare("SELECT id, nom, telephone FROM chauffeurs WHERE api_token = ? AND actif = 1");
$stmt->execute([$token]);
$chauffeur = $stmt->fetch();

if (!$chauffeur) {
    echo json_encode(['success' => false, 'message' => 'Session invalide']);
    exit;
}

// GET - Récupérer les courses du chauffeur
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $stmt = $bdd->prepare("
        SELECT c.*, m.immatriculation 
        FROM courses c
        JOIN motos m ON c.moto_id = m.id
        WHERE c.chauffeur_id = ?
        ORDER BY c.date_course DESC
        LIMIT 50
    ");
    $stmt->execute([$chauffeur['id']]);
    $courses = $stmt->fetchAll();
    
    // Stats du jour
    $stmt = $bdd->prepare("
        SELECT COUNT(*) as nb, COALESCE(SUM(prix), 0) as total 
        FROM courses 
        WHERE chauffeur_id = ? AND DATE(date_course) = CURDATE()
    ");
    $stmt->execute([$chauffeur['id']]);
    $stats = $stmt->fetch();
    
    echo json_encode([
        'success' => true,
        'chauffeur' => ['nom' => $chauffeur['nom']],
        'stats' => ['nb' => $stats['nb'], 'total' => $stats['total']],
        'courses' => $courses
    ]);
    exit;
}

// POST - Ajouter une course
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $data = json_decode(file_get_contents('php://input'), true);
    
    $distance = $data['distance'] ?? 0;
    $moto_id = $data['moto_id'] ?? null;
    $date_course = $data['date_course'] ?? date('Y-m-d H:i:s');
    
    // Récupérer la moto assignée au chauffeur
    if (!$moto_id) {
        $stmt = $bdd->prepare("SELECT moto_id FROM chauffeurs WHERE id = ?");
        $stmt->execute([$chauffeur['id']]);
        $moto_id = $stmt->fetchColumn();
    }
    
    if (!$moto_id) {
        echo json_encode(['success' => false, 'message' => 'Aucune moto assignée']);
        exit;
    }
    
    // Calculer le prix
    $prix_base = $bdd->query("SELECT valeur FROM parametres WHERE nom = 'prix_base'")->fetchColumn();
    $prix_km = $bdd->query("SELECT valeur FROM parametres WHERE nom = 'prix_km'")->fetchColumn();
    $prix = $prix_base + ($distance * $prix_km);
    
    // Insérer la course
    $stmt = $bdd->prepare("
        INSERT INTO courses (chauffeur_id, moto_id, distance_km, prix, date_course) 
        VALUES (?, ?, ?, ?, ?)
    ");
    $stmt->execute([$chauffeur['id'], $moto_id, $distance, $prix, $date_course]);
    
    // Mettre à jour le kilométrage de la moto
    $bdd->prepare("UPDATE motos SET km_actuel = km_actuel + ? WHERE id = ?")->execute([$distance, $moto_id]);
    
    echo json_encode([
        'success' => true,
        'course' => ['id' => $bdd->lastInsertId(), 'distance' => $distance, 'prix' => $prix],
        'message' => 'Course enregistrée avec succès'
    ]);
    exit;
}
?>