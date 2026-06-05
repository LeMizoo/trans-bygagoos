<?php
require_once 'config.php';
verifierConnexion();

$current_page = basename($_SERVER['PHP_SELF']);
$parametres = getParametres();
$prix_base = $parametres['prix_base'];
$prix_km = $parametres['prix_km'];
$message = '';

if (!empty($_POST['chauffeur_id'])) {
    $distance = $_POST['distance'];
    $prix = calculerPrix($distance, $prix_base, $prix_km);
    $stmt = $bdd->prepare("INSERT INTO courses (chauffeur_id, moto_id, distance_km, prix) VALUES (?, ?, ?, ?)");
    $stmt->execute([$_POST['chauffeur_id'], $_POST['moto_id'], $distance, $prix]);
    $bdd->prepare("UPDATE motos SET km_actuel = km_actuel + ? WHERE id = ?")->execute([$distance, $_POST['moto_id']]);
    $message = "<div class='alert-success'><i class='fas fa-check-circle'></i> Course ajoutée - Prix: " . number_format($prix) . " Ar</div>";
}

$chauffeurs = $bdd->query("SELECT * FROM chauffeurs WHERE actif = 1")->fetchAll();
$motos = $bdd->query("SELECT * FROM motos ORDER BY immatriculation ASC")->fetchAll();
$total_jour = $bdd->query("SELECT COALESCE(SUM(prix), 0) FROM courses WHERE DATE(date_course) = CURDATE()")->fetchColumn();
$nb_courses_jour = $bdd->query("SELECT COUNT(*) FROM courses WHERE DATE(date_course) = CURDATE()")->fetchColumn();
$courses = $bdd->query("SELECT c.*, ch.nom as chauffeur_nom, m.immatriculation FROM courses c JOIN chauffeurs ch ON c.chauffeur_id = ch.id JOIN motos m ON c.moto_id = m.id ORDER BY c.date_course DESC LIMIT 20")->fetchAll();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trans ByGagoos - Courses</title>
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
            <a href="#" class="active-parent"><i class="fas fa-clipboard-list"></i> ACTIVITÉ <i class="fas fa-chevron-down" style="font-size: 10px;"></i></a>
            <div class="dropdown-content">
                <a href="courses.php" class="active"><i class="fas fa-receipt"></i> Courses</a>
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
            <a href="#"><i class="fas fa-cogs"></i> ADMINISTRATION <i class="fas fa-chevron-down" style="font-size: 10px;"></i></a>
            <div class="dropdown-content">
                <a href="parametres.php"><i class="fas fa-sliders-h"></i> Paramètres</a>
                <a href="categories_depenses.php"><i class="fas fa-tags"></i> Catégories</a>
                <a href="utilisateurs.php"><i class="fas fa-user-plus"></i> Utilisateurs</a>
                <a href="chauffeur_codes.php"><i class="fas fa-qrcode"></i> Codes</a>
            </div>
        </div>
    </div>
    
    <div class="content">
        <?= $message ?>
        
        <div class="stats-grid">
            <div class="stat-card"><h4><i class="fas fa-money-bill-wave"></i> CA aujourd'hui</h4><div class="number"><?= number_format($total_jour) ?> Ar</div><small><?= $nb_courses_jour ?> courses</small></div>
            <div class="stat-card"><h4><i class="fas fa-motorcycle"></i> Tarif actuel</h4><div class="number"><?= number_format($prix_base) ?> Ar</div><small>+ <?= number_format($prix_km) ?> Ar/km</small></div>
            <div class="stat-card"><h4><i class="fas fa-chart-line"></i> Course moyenne</h4><div class="number"><?= $nb_courses_jour > 0 ? number_format($total_jour / $nb_courses_jour) : 0 ?> Ar</div><small>par course</small></div>
        </div>
        
        <div class="card">
            <h3><i class="fas fa-pen-alt"></i> Enregistrer une nouvelle course</h3>
            <form method="post">
                <div class="form-group"><label><i class="fas fa-user"></i> Chauffeur :</label><select name="chauffeur_id" required><option value="">-- Sélectionner --</option><?php foreach ($chauffeurs as $c): ?><option value="<?= $c['id'] ?>"><i class="fas fa-user-circle"></i> <?= htmlspecialchars($c['nom']) ?> - <?= $c['telephone'] ?></option><?php endforeach; ?></select></div>
                <div class="form-group"><label><i class="fas fa-motorcycle"></i> Moto :</label><select name="moto_id" required><option value="">-- Sélectionner --</option><?php foreach ($motos as $moto): ?><option value="<?= $moto['id'] ?>"><i class="fas fa-motorcycle"></i> <?= htmlspecialchars($moto['immatriculation']) ?> (<?= number_format($moto['km_actuel']) ?> km)</option><?php endforeach; ?></select></div>
                <div class="form-group"><label><i class="fas fa-road"></i> Distance parcourue (km) :</label><input type="number" name="distance" step="0.1" required><small><i class="fas fa-calculator"></i> Prix: <?= number_format($prix_base) ?> Ar + (km × <?= number_format($prix_km) ?> Ar)</small></div>
                <button type="submit"><i class="fas fa-save"></i> Enregistrer la course</button>
            </form>
        </div>
        
        <h3><i class="fas fa-history"></i> Dernières courses</h3>
        <?php if (empty($courses)): ?><p><i class="fas fa-info-circle"></i> Aucune course enregistrée.</p><?php else: ?>
        <div style="overflow-x:auto;"><table style="width:100%"><thead><tr><th><i class="fas fa-calendar"></i> Date</th><th><i class="fas fa-user"></i> Chauffeur</th><th><i class="fas fa-motorcycle"></i> Moto</th><th><i class="fas fa-road"></i> Distance</th><th><i class="fas fa-money-bill-wave"></i> Prix</th></tr></thead>
        <tbody><?php foreach ($courses as $course): ?>
        <tr>
            <td><i class="fas fa-clock"></i> <?= date('d/m/Y H:i', strtotime($course['date_course'])) ?></td>
            <td><i class="fas fa-user-circle"></i> <?= htmlspecialchars($course['chauffeur_nom']) ?></td>
            <td><i class="fas fa-motorcycle"></i> <?= $course['immatriculation'] ?></td>
            <td><i class="fas fa-road"></i> <?= number_format($course['distance_km'],1) ?> km</i></td>
            <td style="color:var(--gold);font-weight:bold;"><i class="fas fa-money-bill-wave"></i> <?= number_format($course['prix']) ?> Ar</i></td>
        </tr><?php endforeach; ?></tbody></table></div><?php endif; ?>
    </div>
    <div class="footer"><p><i class="fas fa-heart" style="color: var(--gold);"></i> © <?= date('Y') ?> Trans ByGagoos - Ensemble pour la famille Gagoos <i class="fas fa-heart" style="color: var(--gold);"></i></p></div>
</div>
</body>
</html>