<?php
/**
 * Autoloader personnalisé pour dompdf et PHPSpreadsheet
 */

// Chemin vers dompdf (structure directe)
$dompdfAutoload = __DIR__ . '/vendor/dompdf/autoload.inc.php';

if (file_exists($dompdfAutoload)) {
    require_once $dompdfAutoload;
} else {
    die("dompdf non trouvé : " . $dompdfAutoload);
}

// PHPSpreadsheet - chargement manuel
$spreadsheetPath = __DIR__ . '/vendor/phpoffice/phpspreadsheet/src/PhpSpreadsheet/Spreadsheet.php';
if (file_exists($spreadsheetPath)) {
    require_once $spreadsheetPath;
    
    // Charger l'autoloader de PHPSpreadsheet
    $loader = __DIR__ . '/vendor/phpoffice/phpspreadsheet/src/PhpSpreadsheet/Autoloader.php';
    if (file_exists($loader)) {
        require_once $loader;
    }
}

// Vérification
if (!class_exists('Dompdf\Dompdf')) {
    die("La classe Dompdf n'a pas pu être chargée");
}
?>