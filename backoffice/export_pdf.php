<?php
require_once 'config.php';
verifierConnexion();

// Chargement de dompdf
require_once __DIR__ . '/vendor/dompdf/autoload.inc.php';

use Dompdf\Dompdf;
use Dompdf\Options;

$periode = $_GET['periode'] ?? 'mois';

switch($periode) {
    case 'aujourdhui':
        $date_debut = date('Y-m-d');
        $date_fin = date('Y-m-d');
        $titre_periode = date('d/m/Y');
        break;
    case 'semaine':
        $date_debut = date('Y-m-d', strtotime('monday this week'));
        $date_fin = date('Y-m-d');
        $titre_periode = 'Semaine du ' . date('d/m', strtotime('monday this week')) . ' au ' . date('d/m/Y');
        break;
    case 'mois':
        $date_debut = date('Y-m-01');
        $date_fin = date('Y-m-t');
        $titre_periode = 'Mois de ' . date('F Y');
        break;
    default:
        $date_debut = $_GET['date_debut'] ?? date('Y-m-01');
        $date_fin = $_GET['date_fin'] ?? date('Y-m-t');
        $titre_periode = 'du ' . date('d/m/Y', strtotime($date_debut)) . ' au ' . date('d/m/Y', strtotime($date_fin));
}

// Récupérer les données
$stmt = $bdd->prepare("
    SELECT c.*, ch.nom as chauffeur_nom, ch.telephone, m.immatriculation 
    FROM courses c
    JOIN chauffeurs ch ON c.chauffeur_id = ch.id
    JOIN motos m ON c.moto_id = m.id
    WHERE DATE(c.date_course) BETWEEN ? AND ?
    ORDER BY c.date_course DESC
");
$stmt->execute([$date_debut, $date_fin]);
$courses_list = $stmt->fetchAll();

$total_ca = array_sum(array_column($courses_list, 'prix'));
$total_distance = array_sum(array_column($courses_list, 'distance_km'));
$nb_courses = count($courses_list);

// Top chauffeur
$top = $bdd->prepare("
    SELECT ch.nom, COUNT(c.id) as nb, SUM(c.prix) as total
    FROM courses c
    JOIN chauffeurs ch ON c.chauffeur_id = ch.id
    WHERE DATE(c.date_course) BETWEEN ? AND ?
    GROUP BY c.chauffeur_id
    ORDER BY total DESC
    LIMIT 1
");
$top->execute([$date_debut, $date_fin]);
$top_chauffeur = $top->fetch();

// Générer le HTML pour le PDF
$html = '
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ByGagoos-Trans - Rapport</title>
    <style>
        @page { margin: 1.5cm; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #DAA520; padding-bottom: 20px; }
        .header h1 { color: #DAA520; margin: 0; font-size: 24px; }
        .header p { color: #666; margin: 5px 0; }
        .stats { display: flex; justify-content: space-between; margin-bottom: 30px; flex-wrap: wrap; }
        .stat-card { background: #1a1a1a; padding: 15px; border-radius: 10px; text-align: center; width: 23%; color: white; }
        .stat-card h3 { color: #DAA520; margin: 0 0 10px 0; font-size: 14px; }
        .stat-card .number { font-size: 22px; font-weight: bold; }
        .stat-card small { color: #aaa; font-size: 10px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #DAA520; color: #000; padding: 10px; text-align: left; font-size: 11px; }
        td { padding: 8px; border-bottom: 1px solid #ddd; font-size: 10px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 10px; color: #666; }
        .gold-text { color: #DAA520; font-weight: bold; }
    </style>
</head>
<body>
    <div class="header">
        <h1>ByGagoos-Trans</h1>
        <p>Rapport d\'activite - ' . $titre_periode . '</p>
        <p>Genere le ' . date('d/m/Y H:i') . '</p>
    </div>
    
    <div class="stats">
        <div class="stat-card">
            <h3>Nombre de courses</h3>
            <div class="number">' . $nb_courses . '</div>
        </div>
        <div class="stat-card">
            <h3>Chiffre d\'affaires</h3>
            <div class="number">' . number_format($total_ca) . ' Ar</div>
        </div>
        <div class="stat-card">
            <h3>Distance totale</h3>
            <div class="number">' . number_format($total_distance) . ' km</div>
        </div>
        <div class="stat-card">
            <h3>Top chauffeur</h3>
            <div class="number">' . ($top_chauffeur ? htmlspecialchars($top_chauffeur['nom']) : '-') . '</div>
            <small>' . ($top_chauffeur ? number_format($top_chauffeur['total']) . ' Ar' : '') . '</small>
        </div>
    </div>
    
    <h3>Detail des courses</h3>
    <table>
        <thead>
            <tr>
                <th>Date</th>
                <th>Chauffeur</th>
                <th>Moto</th>
                <th>Distance</th>
                <th>Prix</th>
            </tr>
        </thead>
        <tbody>';

foreach ($courses_list as $course) {
    $html .= '
            <tr>
                <td>' . date('d/m/Y H:i', strtotime($course['date_course'])) . '</i>
                <td>' . htmlspecialchars($course['chauffeur_nom']) . '</i>
                <td>' . $course['immatriculation'] . '</i>
                <td>' . number_format($course['distance_km'], 1) . ' km</i>
                <td class="gold-text">' . number_format($course['prix']) . ' Ar</i>
            </tr>';
}

$html .= '
        </tbody>
    </table>
    
    <div class="footer">
        <p>ByGagoos-Trans - Application de gestion de flotte taxi-moto</p>
        <p>(c) ' . date('Y') . ' - Ensemble pour la famille Gagoos</p>
    </div>
</body>
</html>';

// Générer le PDF
try {
    $options = new Options();
    $options->set('defaultFont', 'DejaVu Sans');
    $options->set('isHtml5ParserEnabled', true);
    $options->set('isRemoteEnabled', false);
    $options->set('chroot', __DIR__);
    
    $dompdf = new Dompdf($options);
    $dompdf->loadHtml($html, 'UTF-8');
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();
    $dompdf->stream("rapport_" . date('Y-m-d') . ".pdf", ["Attachment" => true]);
} catch (Exception $e) {
    echo "Erreur lors de la generation du PDF : " . $e->getMessage();
}
exit;
?>