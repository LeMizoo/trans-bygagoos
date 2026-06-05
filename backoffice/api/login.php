<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require_once '../config.php';

$data = json_decode(file_get_contents('php://input'), true);

$code_acces = $data['code'] ?? '';

if (empty($code_acces)) {
    echo json_encode(['success' => false, 'message' => 'Code d\'accès requis']);
    exit;
}

$stmt = $bdd->prepare("SELECT id, nom, telephone, code_acces FROM chauffeurs WHERE code_acces = ? AND actif = 1");
$stmt->execute([$code_acces]);
$chauffeur = $stmt->fetch();

if ($chauffeur) {
    // Générer un token API
    $token = bin2hex(random_bytes(32));
    $stmt = $bdd->prepare("UPDATE chauffeurs SET api_token = ? WHERE id = ?");
    $stmt->execute([$token, $chauffeur['id']]);
    
    echo json_encode([
        'success' => true,
        'chauffeur' => [
            'id' => $chauffeur['id'],
            'nom' => $chauffeur['nom'],
            'telephone' => $chauffeur['telephone']
        ],
        'token' => $token
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Code d\'accès invalide']);
}
?>