<?php
require_once 'config.php';
verifierConnexion();

$current_page = basename($_SERVER['PHP_SELF']);
$parametres = getParametres();
$prix_base = $parametres['prix_base'];
$prix_km = $parametres['prix_km'];

$ca_jour = $bdd->query("SELECT COALESCE(SUM(prix), 0) as total FROM courses WHERE DATE(date_course) = CURDATE()")->fetchColumn();
$nb_courses_jour = $bdd->query("SELECT COUNT(*) FROM courses WHERE DATE(date_course) = CURDATE()")->fetchColumn();
$ca_semaine = $bdd->query("SELECT COALESCE(SUM(prix), 0) as total FROM courses WHERE WEEK(date_course) = WEEK(CURDATE()) AND YEAR(date_course) = YEAR(CURDATE())")->fetchColumn();
$nb_courses_semaine = $bdd->query("SELECT COUNT(*) FROM courses WHERE WEEK(date_course) = WEEK(CURDATE()) AND YEAR(date_course) = YEAR(CURDATE())")->fetchColumn();
$ca_mois = $bdd->query("SELECT COALESCE(SUM(prix), 0) as total FROM courses WHERE MONTH(date_course) = MONTH(CURDATE()) AND YEAR(date_course) = YEAR(CURDATE())")->fetchColumn();
$nb_courses_mois = $bdd->query("SELECT COUNT(*) FROM courses WHERE MONTH(date_course) = MONTH(CURDATE()) AND YEAR(date_course) = YEAR(CURDATE())")->fetchColumn();
$nb_motos = $bdd->query("SELECT COUNT(*) FROM motos")->fetchColumn();
$nb_chauffeurs = $bdd->query("SELECT COUNT(*) FROM chauffeurs WHERE actif = 1")->fetchColumn();

$alertes_vidange = $bdd->query("SELECT *, (km_prochaine_vidange - km_actuel) as km_restant FROM motos WHERE km_actuel >= km_prochaine_vidange - 500 ORDER BY km_restant ASC")->fetchAll();
$urgences_vidange = $bdd->query("SELECT *, (km_prochaine_vidange - km_actuel) as km_restant FROM motos WHERE km_actuel >= km_prochaine_vidange ORDER BY km_restant ASC")->fetchAll();

$top_chauffeurs = $bdd->query("SELECT ch.nom, ch.telephone, COUNT(c.id) as nb_courses, SUM(c.prix) as total FROM courses c JOIN chauffeurs ch ON c.chauffeur_id = ch.id WHERE MONTH(c.date_course) = MONTH(CURDATE()) AND YEAR(c.date_course) = YEAR(CURDATE()) GROUP BY c.chauffeur_id ORDER BY total DESC LIMIT 5")->fetchAll();
$top_motos = $bdd->query("SELECT m.immatriculation, COUNT(c.id) as nb_courses, SUM(c.distance_km) as total_km FROM courses c JOIN motos m ON c.moto_id = m.id WHERE MONTH(c.date_course) = MONTH(CURDATE()) AND YEAR(c.date_course) = YEAR(CURDATE()) GROUP BY c.moto_id ORDER BY nb_courses DESC LIMIT 5")->fetchAll();
$dernieres_courses = $bdd->query("SELECT c.*, ch.nom as chauffeur_nom, m.immatriculation FROM courses c JOIN chauffeurs ch ON c.chauffeur_id = ch.id JOIN motos m ON c.moto_id = m.id ORDER BY c.date_course DESC LIMIT 10")->fetchAll();

$evolution = $bdd->query("SELECT DATE(date_course) as jour, COALESCE(SUM(prix), 0) as total FROM courses WHERE date_course >= DATE_SUB(CURDATE(), INTERVAL 7 DAY) GROUP BY DATE(date_course) ORDER BY jour ASC")->fetchAll();
$jours_manquants = [];
for ($i = 6; $i >= 0; $i--) {
    $date = date('Y-m-d', strtotime("-$i days"));
    $found = false;
    foreach ($evolution as $e) { if ($e['jour'] == $date) { $jours_manquants[] = $e; $found = true; break; } }
    if (!$found) $jours_manquants[] = ['jour' => $date, 'total' => 0];
}
$evolution = $jours_manquants;

$course_max = $bdd->query("SELECT c.*, ch.nom as chauffeur_nom, m.immatriculation FROM courses c JOIN chauffeurs ch ON c.chauffeur_id = ch.id JOIN motos m ON c.moto_id = m.id WHERE MONTH(c.date_course) = MONTH(CURDATE()) ORDER BY c.prix DESC LIMIT 1")->fetch();
$courses_par_heure = $bdd->query("SELECT HOUR(date_course) as heure, COUNT(*) as nb FROM courses WHERE DATE(date_course) = CURDATE() GROUP BY HOUR(date_course) ORDER BY heure ASC")->fetchAll();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trans ByGagoos - Tableau de bord</title>
    <link rel="icon" type="image/png" href="b-trans.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .stat-card { cursor: pointer; transition: all 0.3s; background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid var(--gold); }
        .stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 25px rgba(0,0,0,0.2); }
        .stat-card h4 { color: var(--gold); margin-bottom: 10px; font-size: 14px; }
        .stat-card .number { font-size: 28px; font-weight: bold; color: white; }
        .urgent { background: #e74c3c; color: white; padding: 8px 12px; border-radius: 8px; margin: 5px 0; }
        .warning { background: #f39c12; color: #1a1a1a; padding: 8px 12px; border-radius: 8px; margin: 5px 0; }
        .gold-text { color: var(--gold); font-weight: bold; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        
        /* Menu déroulant */
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
                <div>
                    <h1 style="margin: 0;">Trans ByGagoos</h1>
                    <p style="margin: 5px 0 0 0;"><i class="fas fa-user-check"></i> Bonjour, <?= htmlspecialchars($_SESSION['nom_complet']) ?></p>
                </div>
            </div>
            <div style="text-align: right;">
                <div style="color: var(--gold); font-size: 18px; font-weight: bold;"><i class="fas fa-calendar-alt"></i> <?= date('d/m/Y') ?></div>
                <div style="color: var(--white); font-size: 12px;"><i class="fas fa-clock"></i> <?= date('H:i') ?></div>
                <a href="logout.php" style="color: var(--gold); font-size: 12px;"><i class="fas fa-sign-out-alt"></i> Déconnexion</a>
            </div>
        </div>
    </div>
    
    <div class="nav">
        <div class="nav-item">
            <a href="dashboard.php" class="<?= $current_page == 'dashboard.php' ? 'active' : '' ?>"><i class="fas fa-chart-line"></i> Dashboard</a>
        </div>
        
        <div class="dropdown">
            <a href="#" class="<?= ($current_page == 'motos.php' || $current_page == 'chauffeurs.php') ? 'active-parent' : '' ?>"><i class="fas fa-motorcycle"></i> FLOTTE <i class="fas fa-chevron-down" style="font-size: 10px;"></i></a>
            <div class="dropdown-content">
                <a href="motos.php" class="<?= $current_page == 'motos.php' ? 'active' : '' ?>"><i class="fas fa-motorcycle"></i> Motos</a>
                <a href="chauffeurs.php" class="<?= $current_page == 'chauffeurs.php' ? 'active' : '' ?>"><i class="fas fa-users"></i> Chauffeurs</a>
            </div>
        </div>
        
        <div class="dropdown">
            <a href="#" class="<?= ($current_page == 'courses.php' || $current_page == 'depenses.php') ? 'active-parent' : '' ?>"><i class="fas fa-clipboard-list"></i> ACTIVITÉ <i class="fas fa-chevron-down" style="font-size: 10px;"></i></a>
            <div class="dropdown-content">
                <a href="courses.php" class="<?= $current_page == 'courses.php' ? 'active' : '' ?>"><i class="fas fa-receipt"></i> Courses</a>
                <a href="depenses.php" class="<?= $current_page == 'depenses.php' ? 'active' : '' ?>"><i class="fas fa-coins"></i> Dépenses</a>
            </div>
        </div>
        
        <div class="dropdown">
            <a href="#" class="<?= ($current_page == 'rapports_financiers.php' || $current_page == 'rapports.php') ? 'active-parent' : '' ?>"><i class="fas fa-chart-pie"></i> ANALYSE <i class="fas fa-chevron-down" style="font-size: 10px;"></i></a>
            <div class="dropdown-content">
                <a href="rapports_financiers.php" class="<?= $current_page == 'rapports_financiers.php' ? 'active' : '' ?>"><i class="fas fa-chart-line"></i> Finances</a>
                <a href="rapports.php" class="<?= $current_page == 'rapports.php' ? 'active' : '' ?>"><i class="fas fa-file-alt"></i> Exports</a>
            </div>
        </div>
        
        <div class="dropdown">
            <a href="#" class="<?= ($current_page == 'parametres.php' || $current_page == 'categories_depenses.php' || $current_page == 'utilisateurs.php' || $current_page == 'chauffeur_codes.php') ? 'active-parent' : '' ?>"><i class="fas fa-cogs"></i> ADMINISTRATION <i class="fas fa-chevron-down" style="font-size: 10px;"></i></a>
            <div class="dropdown-content">
                <a href="parametres.php" class="<?= $current_page == 'parametres.php' ? 'active' : '' ?>"><i class="fas fa-sliders-h"></i> Paramètres</a>
                <a href="categories_depenses.php" class="<?= $current_page == 'categories_depenses.php' ? 'active' : '' ?>"><i class="fas fa-tags"></i> Catégories</a>
                <a href="utilisateurs.php" class="<?= $current_page == 'utilisateurs.php' ? 'active' : '' ?>"><i class="fas fa-user-plus"></i> Utilisateurs</a>
                <a href="chauffeur_codes.php" class="<?= $current_page == 'chauffeur_codes.php' ? 'active' : '' ?>"><i class="fas fa-qrcode"></i> Codes</a>
            </div>
        </div>
    </div>
    
    <div class="content">
        <div class="stats-grid">
            <div class="stat-card" onclick="window.location.href='courses.php'">
                <h4><i class="fas fa-money-bill-wave"></i> CA aujourd'hui</h4>
                <div class="number"><?= number_format($ca_jour) ?> Ar</div>
                <small><?= $nb_courses_jour ?> courses | Moy: <?= $nb_courses_jour > 0 ? number_format($ca_jour / $nb_courses_jour) : 0 ?> Ar</small>
            </div>
            <div class="stat-card" onclick="window.location.href='courses.php'">
                <h4><i class="fas fa-calendar-week"></i> CA cette semaine</h4>
                <div class="number"><?= number_format($ca_semaine) ?> Ar</div>
                <small><?= $nb_courses_semaine ?> courses</small>
            </div>
            <div class="stat-card" onclick="window.location.href='courses.php'">
                <h4><i class="fas fa-calendar-alt"></i> CA ce mois</h4>
                <div class="number"><?= number_format($ca_mois) ?> Ar</div>
                <small><?= $nb_courses_mois ?> courses</small>
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat-card" onclick="window.location.href='motos.php'">
                <h4><i class="fas fa-motorcycle"></i> Flotte</h4>
                <div class="number"><?= $nb_motos ?> motos</div>
                <small><?= $nb_chauffeurs ?> chauffeurs actifs</small>
            </div>
            <div class="stat-card" onclick="window.location.href='courses.php'">
                <h4><i class="fas fa-chart-line"></i> Course moyenne</h4>
                <div class="number"><?= $nb_courses_mois > 0 ? number_format($ca_mois / $nb_courses_mois) : 0 ?> Ar</div>
                <small>sur le mois</small>
            </div>
            
            <div class="stat-card" onclick="window.location.href='chauffeur_codes.php'">
                <h4><i class="fas fa-qrcode"></i> Codes chauffeurs</h4>
                <div class="number"><i class="fas fa-phone-alt"></i> Accès mobile</div>
                <small>Gérer les codes d'accès des chauffeurs</small>
            </div>
            
            <?php if ($course_max): ?>
            <div class="stat-card">
                <h4><i class="fas fa-trophy"></i> Record du mois</h4>
                <div class="number"><?= number_format($course_max['prix']) ?> Ar</div>
                <small><?= htmlspecialchars($course_max['chauffeur_nom']) ?> - <?= $course_max['immatriculation'] ?></small>
            </div>
            <?php endif; ?>
        </div>

        <div class="card">
            <h3><i class="fas fa-chart-line"></i> Évolution du chiffre d'affaires (7 derniers jours)</h3>
            <canvas id="caChart" height="100"></canvas>
        </div>

        <?php if (!empty($urgences_vidange) || !empty($alertes_vidange)): ?>
        <div class="card" style="border-left-color: #e74c3c;">
            <h3><i class="fas fa-exclamation-triangle"></i> Alertes entretien</h3>
            <?php if (!empty($urgences_vidange)): ?>
                <h4 style="color: #e74c3c;"><i class="fas fa-circle" style="color:#e74c3c; font-size: 12px;"></i> URGENT - Vidange dépassée</h4>
                <?php foreach ($urgences_vidange as $alerte): ?>
                    <div class="urgent"><i class="fas fa-motorcycle"></i> <strong><?= htmlspecialchars($alerte['immatriculation']) ?></strong> - DÉPASSÉ de <?= number_format(abs($alerte['km_restant'])) ?> km !</div>
                <?php endforeach; ?>
            <?php endif; ?>
            <?php if (!empty($alertes_vidange)): ?>
                <h4 style="color: #f39c12; margin-top: 10px;"><i class="fas fa-circle" style="color:#f39c12; font-size: 12px;"></i> À venir - moins de 500 km restants</h4>
                <?php foreach ($alertes_vidange as $alerte): if ($alerte['km_restant'] > 0): ?>
                    <div class="warning"><i class="fas fa-motorcycle"></i> <strong><?= htmlspecialchars($alerte['immatriculation']) ?></strong> - Plus que <?= number_format($alerte['km_restant']) ?> km</div>
                <?php endif; endforeach; ?>
            <?php endif; ?>
        </div>
        <?php endif; ?>

        <div class="stats-grid">
            <?php if (!empty($top_chauffeurs)): ?>
            <div class="card">
                <h3><i class="fas fa-trophy"></i> Top 5 chauffeurs (ce mois)</h3>
                <table style="width:100%"><thead><tr><th><i class="fas fa-user"></i> Chauffeur</th><th><i class="fas fa-receipt"></i> Courses</th><th><i class="fas fa-money-bill-wave"></i> CA</th></tr></thead>
                <tbody><?php foreach ($top_chauffeurs as $top): ?>
                <tr><td><i class="fas fa-user-circle"></i> <?= htmlspecialchars($top['nom']) ?></td><td><?= $top['nb_courses'] ?></td><td class="gold-text"><?= number_format($top['total']) ?> Ar</i></td>
                <?php endforeach; ?></tbody></table>
            </div>
            <?php endif; ?>

            <?php if (!empty($top_motos)): ?>
            <div class="card">
                <h3><i class="fas fa-motorcycle"></i> Top 5 motos (ce mois)</h3>
                <table style="width:100%"><thead><tr><th>Moto</th><th><i class="fas fa-receipt"></i> Courses</th><th><i class="fas fa-road"></i> KM</th></tr></thead>
                <tbody><?php foreach ($top_motos as $top): ?>
                <tr><td><i class="fas fa-motorcycle"></i> <?= htmlspecialchars($top['immatriculation']) ?></td><td><?= $top['nb_courses'] ?></td><td><?= number_format($top['total_km']) ?> km</i></td>
                <?php endforeach; ?></tbody></table>
            </div>
            <?php endif; ?>
        </div>

        <?php if (!empty($courses_par_heure)): ?>
        <div class="card">
            <h3><i class="fas fa-clock"></i> Répartition des courses par heure (aujourd'hui)</h3>
            <canvas id="heureChart" height="80"></canvas>
        </div>
        <?php endif; ?>

        <div class="card">
            <h3><i class="fas fa-history"></i> 10 dernières courses</h3>
            <?php if (empty($dernieres_courses)): ?>
                <p><i class="fas fa-info-circle"></i> Aucune course enregistrée.</p>
            <?php else: ?>
            <div style="overflow-x:auto;"><table style="width:100%">
                <thead><tr><th><i class="fas fa-calendar"></i> Date</th><th><i class="fas fa-user"></i> Chauffeur</th><th><i class="fas fa-motorcycle"></i> Moto</th><th><i class="fas fa-road"></i> Distance</th><th><i class="fas fa-money-bill-wave"></i> Prix</th></tr></thead>
                <tbody><?php foreach ($dernieres_courses as $course): ?>
                <tr>
                    <td><i class="fas fa-clock"></i> <?= date('d/m/Y H:i', strtotime($course['date_course'])) ?></td>
                    <td><i class="fas fa-user-circle"></i> <?= htmlspecialchars($course['chauffeur_nom']) ?></td>
                    <td><i class="fas fa-motorcycle"></i> <?= $course['immatriculation'] ?></td>
                    <td><i class="fas fa-road"></i> <?= number_format($course['distance_km']) ?> km</i></td>
                    <td class="gold-text"><i class="fas fa-money-bill-wave"></i> <strong><?= number_format($course['prix']) ?> Ar</strong></i></td>
                </tr><?php endforeach; ?></tbody>
            </table></div>
            <?php endif; ?>
        </div>
    </div>
    
    <div class="footer">
        <p><i class="fas fa-heart" style="color: var(--gold);"></i> © <?= date('Y') ?> Trans ByGagoos - Ensemble pour la famille Gagoos <i class="fas fa-heart" style="color: var(--gold);"></i></p>
    </div>
</div>

<script>
const ctx = document.getElementById('caChart').getContext('2d');
const evolution = <?= json_encode($evolution) ?>;
new Chart(ctx, {
    type: 'line',
    data: {
        labels: evolution.map(e => new Date(e.jour).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric' })),
        datasets: [{ label: 'CA (Ar)', data: evolution.map(e => e.total), borderColor: '#FFD700', backgroundColor: 'rgba(255,215,0,0.1)', borderWidth: 3, fill: true }]
    },
    options: { responsive: true, scales: { y: { beginAtZero: true, ticks: { callback: v => v.toLocaleString() + ' Ar' } } } }
});
<?php if (!empty($courses_par_heure)): ?>
const hCtx = document.getElementById('heureChart').getContext('2d');
const heures = <?= json_encode($courses_par_heure) ?>;
new Chart(hCtx, { type: 'bar', data: { labels: heures.map(h => h.heure + 'h'), datasets: [{ label: 'Courses', data: heures.map(h => h.nb), backgroundColor: '#FFD700' }] }, options: { responsive: true } });
<?php endif; ?>
</script>
</body>
</html>