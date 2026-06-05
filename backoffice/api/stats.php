<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers: Authorization');

require_once '../config.php';

$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

$stmt = $bdd->prepare("SELECT id FROM chauffeurs WHERE api_token = ? AND actif = 1");
$stmt->execute([$token]);
$chauffeur = $stmt->fetch();

if (!$chauffeur) {
    echo json_encode(['success' => false, 'message' => 'Session invalide']);
    exit;
}

// Statistiques
$today = $bdd->prepare("
    SELECT COUNT(*) as nb, COALESCE(SUM(prix), 0) as total 
    FROM courses WHERE chauffeur_id = ? AND DATE(date_course) = CURDATE()
");
$today->execute([$chauffeur['id']]);
$today_stats = $today->fetch();

$week = $bdd->prepare("
    SELECT COUNT(*) as nb, COALESCE(SUM(prix), 0) as total 
    FROM courses WHERE chauffeur_id = ? AND YEARWEEK(date_course) = YEARWEEK(CURDATE())
");
$week->execute([$chauffeur['id']]);
$week_stats = $week->fetch();

$month = $bdd->prepare("
    SELECT COUNT(*) as nb, COALESCE(SUM(prix), 0) as total 
    FROM courses WHERE chauffeur_id = ? AND MONTH(date_course) = MONTH(CURDATE())
");
$month->execute([$chauffeur['id']]);
$month_stats = $month->fetch();

echo json_encode([
    'success' => true,
    'today' => ['nb' => $today_stats['nb'], 'total' => $today_stats['total']],
    'week' => ['nb' => $week_stats['nb'], 'total' => $week_stats['total']],
    'month' => ['nb' => $month_stats['nb'], 'total' => $month_stats['total']]
]);
?>