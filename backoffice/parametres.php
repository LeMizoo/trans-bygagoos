<?php
require_once 'config.php';
verifierConnexion();

$current_page = basename($_SERVER['PHP_SELF']);
$parametres = getParametres();
$prix_base = $parametres['prix_base'];
$prix_km = $parametres['prix_km'];
$message = '';

if ($_POST) {
    $bdd->prepare("UPDATE parametres SET valeur = ? WHERE nom = 'prix_base'")->execute([$_POST['prix_base']]);
    $bdd->prepare("UPDATE parametres SET valeur = ? WHERE nom = 'prix_km'")->execute([$_POST['prix_km']]);
    $prix_base = $_POST['prix_base'];
    $prix_km = $_POST['prix_km'];
    $message = "<div class='alert-success'><i class='fas fa-check-circle'></i> Tarifs mis à jour !</div>";
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trans ByGagoos - Paramètres</title>
    <link rel="icon" type="image/png" href="b-trans.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <style>
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid var(--gold); }
        .stat-card h4 { color: var(--gold); margin-bottom: 10px; font-size: 14px; }
        .stat-card .number { font-size: 28px; font-weight: bold; color: white; }
        .nav { display: flex; flex-wrap: wrap; background: #1a1a1a; }
        .nav-item { position: relative; display: inline-block; }
        .nav-item > a { display: inline-block; padding: 15px 20px; color: white; text-decoration: none; transition: all 0.3s; }
        .nav-item > a:hover, .nav-item > a.active { background: var(--gold); color: #000; }
        .dropdown { position: relative; display: inline-block; }
        .dropdown > a { display: inline-block; padding: 15px 20px; color: white; text-decoration: none; }
        .dropdown > a:hover, .dropdown > a.active-parent { background: var(--gold); color: #000; }
        .dropdown-content { display: none; position: absolute; background: #1a1a1a; min-width: 200px; box-shadow: 0 8px 16px rgba(0,0,0,0.2); z-index: 100; border-radius: 0 0 8px 8px; border-top: 2px solid var(--gold); }
        .dropdown-content a { color: white; padding: 12px 20px; text-decoration: none; display: block; transition: all 0.3s; border-bottom: 1px solid #333; }
        .dropdown-content a:hover, .dropdown-content a.active { background: var(--gold); color: #000; padding-left: 25px; }
        .dropdown:hover .dropdown-content { display: block; }
        @media (max-width: 768px) { .dropdown { display: block; width: 100%; } .dropdown-content { position: static; display: none; width: 100%; padding-left: 20px; } .dropdown:hover .dropdown-content { display: block; } .dropdown > a { width: 100%; } .nav { flex-direction: column; } }
    </style>
</head>
<body>
<div class="container">
    <div class="header">
        <div style="display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 15px;">
            <div style="display: flex; align-items: center; gap: 20px;">
                <img src="b-trans.png" alt="Trans ByGagoos" style="height: 60px; width: auto;">
                <div><h1 style="margin: 0;">Trans ByGagoos</h1><p style="margin: 5px 0 0 0;"><i class="fas fa-user-check"></i> Bonjour, <?= htmlspecialchars($_SESSION['nom_complet']) ?></p></div>
            </div>
            <div style="text-align: right;"><div style="color: var(--gold); font-size: 18px;"><i class="fas fa-calendar-alt"></i> <?= date('d/m/Y') ?></div><a href="logout.php" style="color: var(--gold); font-size: 12px;"><i class="fas fa-sign-out-alt"></i> Déconnexion</a></div>
        </div>
    </div>
    
    <div class="nav">
        <div class="nav-item"><a href="dashboard.php"><i class="fas fa-chart-line"></i> Dashboard</a></div>
        <div class="dropdown">
            <a href="#"><i class="fas fa-motorcycle"></i> FLOTTE <i class="fas fa-chevron-down" style="font-size: 10px;"></i></a>
            <div class="dropdown-content">
                <a href="motos.php"><i class="fas fa-motorcycle"></i> Motos</a>
                <a href="chauffeurs.php"><i class="fas fa-users"></i> Chauffeurs</a>
            </div>
        </div>
        <div class="dropdown">
            <a href="#"><i class="fas fa-clipboard-list"></i> ACTIVITÉ <i class="fas fa-chevron-down" style="font-size: 10px;"></i></a>
            <div class="dropdown-content">
                <a href="courses.php"><i class="fas fa-receipt"></i> Courses</a>
                <a href="depenses.php"><i class="fas fa-coins"></i> Dépenses</a>
            </div>
        </div>
        <div class="dropdown">
            <a href="#"><i class="fas fa-chart-pie"></i> ANALYSE <i class="fas fa-chevron-down" style="font-size: 10px;"></i></a>
            <div class="dropdown-content">
                <a href="rapports_financiers.php"><i class="fas fa-chart-line"></i> Finances</a>
                <a href="rapports.php"><i class="fas fa-file-alt"></i> Exports</a>
            </div>
        </div>
        <div class="dropdown">
            <a href="#" class="active-parent"><i class="fas fa-cogs"></i> ADMINISTRATION <i class="fas fa-chevron-down" style="font-size: 10px;"></i></a>
            <div class="dropdown-content">
                <a href="parametres.php" class="active"><i class="fas fa-sliders-h"></i> Paramètres</a>
                <a href="categories_depenses.php"><i class="fas fa-tags"></i> Catégories</a>
                <a href="utilisateurs.php"><i class="fas fa-user-plus"></i> Utilisateurs</a>
                <a href="chauffeur_codes.php"><i class="fas fa-qrcode"></i> Codes</a>
            </div>
        </div>
    </div>
    
    <div class="content">
        <?= $message ?>
        
        <div class="stats-grid">
            <div class="stat-card"><h4><i class="fas fa-money-bill-wave"></i> Prix de base</h4><div class="number"><?= number_format($prix_base) ?> Ar</div><small>Au démarrage</small></div>
            <div class="stat-card"><h4><i class="fas fa-road"></i> Prix au km</h4><div class="number"><?= number_format($prix_km) ?> Ar</div><small>Par kilomètre</small></div>
            <div class="stat-card"><h4><i class="fas fa-chart-line"></i> Course 5 km</h4><div class="number"><?= number_format(calculerPrix(5, $prix_base, $prix_km)) ?> Ar</div><small>Exemple standard</small></div>
        </div>
        
        <div class="card">
            <h3><i class="fas fa-sliders-h"></i> Configuration des tarifs</h3>
            <div style="background:#1a1a1a;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid var(--gold);">
                <h4 style="color:var(--gold);"><i class="fas fa-chart-simple"></i> Tarifs actuels</h4>
                <p><i class="fas fa-money-bill-wave"></i> Prix de base : <strong style="background:var(--gold);color:#000;padding:5px 12px;border-radius:20px;"><?= number_format($prix_base) ?> Ar</strong></p>
                <p><i class="fas fa-road"></i> Prix au km : <strong style="background:var(--gold);color:#000;padding:5px 12px;border-radius:20px;"><?= number_format($prix_km) ?> Ar/km</strong></p>
                <p><i class="fas fa-calculator"></i> Course 3 km : <strong style="color:var(--gold);"><?= number_format(calculerPrix(3, $prix_base, $prix_km)) ?> Ar</strong> | 5 km : <strong style="color:var(--gold);"><?= number_format(calculerPrix(5, $prix_base, $prix_km)) ?> Ar</strong> | 10 km : <strong style="color:var(--gold);"><?= number_format(calculerPrix(10, $prix_base, $prix_km)) ?> Ar</strong></p>
            </div>
            <form method="post">
                <div class="form-group"><label><i class="fas fa-money-bill-wave"></i> Prix de base (Ar) :</label><input type="number" name="prix_base" value="<?= $prix_base ?>" min="0" step="100" required><small>Montant au démarrage</small></div>
                <div class="form-group"><label><i class="fas fa-road"></i> Prix au kilomètre (Ar/km) :</label><input type="number" name="prix_km" value="<?= $prix_km ?>" min="0" step="50" required><small>Montant par km</small></div>
                <button type="submit"><i class="fas fa-save"></i> Enregistrer</button>
            </form>
        </div>
        
        <div class="card">
            <h3><i class="fas fa-table"></i> Tableau des prix</h3>
            <p><i class="fas fa-calculator"></i> Formule : <strong style="color:var(--gold);">Prix = Base + (Distance × Prix au km)</strong></p>
            <div style="overflow-x:auto;">
                <table style="width:100%">
                    <thead>
                        <tr>
                            <th><i class="fas fa-road"></i> Distance</th>
                            <th><i class="fas fa-calculator"></i> Calcul</th>
                            <th><i class="fas fa-money-bill-wave"></i> Prix</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>1 km</i></td>
                            <td><?= number_format($prix_base) ?> + (1 × <?= number_format($prix_km) ?>)</i></td>
                            <td style="color:var(--gold);font-weight:bold;"><?= number_format(calculerPrix(1, $prix_base, $prix_km)) ?> Ar</i></td>
                        </tr>
                        <tr>
                            <td>3 km</i></td>
                            <td><?= number_format($prix_base) ?> + (3 × <?= number_format($prix_km) ?>)</i></td>
                            <td style="color:var(--gold);font-weight:bold;"><?= number_format(calculerPrix(3, $prix_base, $prix_km)) ?> Ar</i></td>
                        </tr>
                        <tr>
                            <td>5 km</i></td>
                            <td><?= number_format($prix_base) ?> + (5 × <?= number_format($prix_km) ?>)</i></td>
                            <td style="color:var(--gold);font-weight:bold;"><?= number_format(calculerPrix(5, $prix_base, $prix_km)) ?> Ar</i></td>
                        </tr>
                        <tr>
                            <td>10 km</i></td>
                            <td><?= number_format($prix_base) ?> + (10 × <?= number_format($prix_km) ?>)</i></td>
                            <td style="color:var(--gold);font-weight:bold;"><?= number_format(calculerPrix(10, $prix_base, $prix_km)) ?> Ar</i></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <div class="footer">
        <p><i class="fas fa-heart" style="color: var(--gold);"></i> © <?= date('Y') ?> Trans ByGagoos - Ensemble pour la famille Gagoos <i class="fas fa-heart" style="color: var(--gold);"></i></p>
    </div>
</div>
</body>
</html>