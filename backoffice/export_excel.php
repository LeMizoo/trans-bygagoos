<?php
require_once 'config.php';
require_once 'autoload_custom.php';
verifierConnexion();

use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Fill;
use PhpOffice\PhpSpreadsheet\Style\Border;

// Récupérer la période
$periode = $_GET['periode'] ?? 'mois';
$type = $_GET['type'] ?? 'courses';

// Déterminer les dates
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

if ($type == 'courses') {
    // Récupérer les courses
    $stmt = $bdd->prepare("
        SELECT c.*, ch.nom as chauffeur_nom, ch.telephone, m.immatriculation 
        FROM courses c
        JOIN chauffeurs ch ON c.chauffeur_id = ch.id
        JOIN motos m ON c.moto_id = m.id
        WHERE DATE(c.date_course) BETWEEN ? AND ?
        ORDER BY c.date_course DESC
    ");
    $stmt->execute([$date_debut, $date_fin]);
    $courses = $stmt->fetchAll();
    
    $total_ca = array_sum(array_column($courses, 'prix'));
    $total_distance = array_sum(array_column($courses, 'distance_km'));
    $nb_courses = count($courses);
    
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    
    // En-tête du rapport
    $sheet->setCellValue('A1', 'ByGagoos-Trans');
    $sheet->setCellValue('A2', 'Rapport des courses - ' . $titre_periode);
    $sheet->setCellValue('A4', 'Date de génération : ' . date('d/m/Y H:i'));
    
    // Statistiques
    $sheet->setCellValue('A6', 'Statistiques');
    $sheet->setCellValue('A7', 'Nombre total de courses : ' . $nb_courses);
    $sheet->setCellValue('A8', 'Chiffre d\'affaires total : ' . number_format($total_ca) . ' Ar');
    $sheet->setCellValue('A9', 'Distance totale parcourue : ' . number_format($total_distance) . ' km');
    $sheet->setCellValue('A10', 'Prix moyen par course : ' . ($nb_courses > 0 ? number_format($total_ca / $nb_courses) : 0) . ' Ar');
    
    // Tableau des courses
    $sheet->setCellValue('A12', 'Détail des courses');
    
    // En-têtes des colonnes
    $headers = ['Date', 'Chauffeur', 'Téléphone', 'Moto', 'Distance (km)', 'Prix (Ar)'];
    $col = 'A';
    foreach ($headers as $header) {
        $sheet->setCellValue($col . '13', $header);
        $col++;
    }
    
    // Style des en-têtes
    $sheet->getStyle('A13:F13')->applyFromArray([
        'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'DAA520']],
        'alignment' => ['horizontal' => Alignment::HORIZONTAL_CENTER]
    ]);
    
    // Remplir les données
    $row = 14;
    foreach ($courses as $course) {
        $sheet->setCellValue('A' . $row, date('d/m/Y H:i', strtotime($course['date_course'])));
        $sheet->setCellValue('B' . $row, $course['chauffeur_nom']);
        $sheet->setCellValue('C' . $row, $course['telephone']);
        $sheet->setCellValue('D' . $row, $course['immatriculation']);
        $sheet->setCellValue('E' . $row, number_format($course['distance_km'], 1));
        $sheet->setCellValue('F' . $row, number_format($course['prix']) . ' Ar');
        $row++;
    }
    
    // Ajuster les colonnes
    foreach(range('A','F') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }
    
    // Envoyer le fichier
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="rapport_courses_' . date('Y-m-d') . '.xlsx"');
    header('Cache-Control: max-age=0');
    
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
    
} elseif ($type == 'chauffeurs') {
    // Récupérer les stats des chauffeurs
    $stmt = $bdd->prepare("
        SELECT ch.*, COUNT(c.id) as nb_courses, COALESCE(SUM(c.prix), 0) as total_ca, COALESCE(SUM(c.distance_km), 0) as total_km
        FROM chauffeurs ch
        LEFT JOIN courses c ON c.chauffeur_id = ch.id AND DATE(c.date_course) BETWEEN ? AND ?
        GROUP BY ch.id
        ORDER BY total_ca DESC
    ");
    $stmt->execute([$date_debut, $date_fin]);
    $chauffeurs_stats = $stmt->fetchAll();
    
    $spreadsheet = new Spreadsheet();
    $sheet = $spreadsheet->getActiveSheet();
    
    $sheet->setCellValue('A1', 'ByGagoos-Trans');
    $sheet->setCellValue('A2', 'Rapport des chauffeurs - ' . $titre_periode);
    $sheet->setCellValue('A3', 'Date de génération : ' . date('d/m/Y H:i'));
    
    $headers = ['ID', 'Nom', 'Téléphone', 'Moto assignée', 'Nombre de courses', 'Distance (km)', 'Chiffre d\'affaires (Ar)'];
    $col = 'A';
    $row = 5;
    foreach ($headers as $header) {
        $sheet->setCellValue($col . $row, $header);
        $col++;
    }
    
    $sheet->getStyle('A5:G5')->applyFromArray([
        'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
        'fill' => ['fillType' => Fill::FILL_SOLID, 'startColor' => ['rgb' => 'DAA520']]
    ]);
    
    $row = 6;
    foreach ($chauffeurs_stats as $ch) {
        // Récupérer la moto assignée
        $moto_nom = 'Non assignée';
        if ($ch['moto_id']) {
            $moto = $bdd->prepare("SELECT immatriculation FROM motos WHERE id = ?");
            $moto->execute([$ch['moto_id']]);
            $moto_nom = $moto->fetchColumn() ?: 'Non assignée';
        }
        
        $col = 'A';
        $sheet->setCellValue($col++ . $row, $ch['id']);
        $sheet->setCellValue($col++ . $row, $ch['nom']);
        $sheet->setCellValue($col++ . $row, $ch['telephone']);
        $sheet->setCellValue($col++ . $row, $moto_nom);
        $sheet->setCellValue($col++ . $row, $ch['nb_courses']);
        $sheet->setCellValue($col++ . $row, number_format($ch['total_km'], 1) . ' km');
        $sheet->setCellValue($col++ . $row, number_format($ch['total_ca']) . ' Ar');
        $row++;
    }
    
    foreach(range('A','G') as $col) {
        $sheet->getColumnDimension($col)->setAutoSize(true);
    }
    
    header('Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    header('Content-Disposition: attachment;filename="rapport_chauffeurs_' . date('Y-m-d') . '.xlsx"');
    header('Cache-Control: max-age=0');
    
    $writer = new Xlsx($spreadsheet);
    $writer->save('php://output');
    exit;
}
?>