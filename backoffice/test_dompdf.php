<?php
echo "<h2>Diagnostic dompdf</h2>";

// Test avec le bon chemin
$path = __DIR__ . '/vendor/dompdf/autoload.inc.php';
echo "Chemin: " . $path . "<br>";

if (file_exists($path)) {
    echo "✅ Fichier autoload.inc.php trouve<br>";
    require_once $path;
    
    if (class_exists('Dompdf\Dompdf')) {
        echo "✅ Classe Dompdf chargee avec succes<br>";
        
        // Test de generation
        try {
            $dompdf = new Dompdf\Dompdf();
            $dompdf->loadHtml('<h1 style="color:#DAA520">ByGagoos-Trans</h1><p>Test reussi!</p>');
            $dompdf->setPaper('A4', 'portrait');
            $dompdf->render();
            echo "✅ Generation PDF reussie!<br>";
            echo "<hr>";
            echo "<a href='export_pdf.php?periode=aujourdhui'>Cliquez ici pour exporter le rapport complet</a>";
        } catch (Exception $e) {
            echo "❌ Erreur generation: " . $e->getMessage();
        }
    } else {
        echo "❌ Classe Dompdf non trouvee";
    }
} else {
    echo "❌ Fichier non trouve<br>";
    
    // Lister le contenu de vendor
    $vendor = __DIR__ . '/vendor';
    if (is_dir($vendor)) {
        echo "<br>Contenu de vendor:<br>";
        $files = scandir($vendor);
        foreach ($files as $file) {
            if ($file != '.' && $file != '..') {
                echo "- $file<br>";
            }
        }
    }
}
?>