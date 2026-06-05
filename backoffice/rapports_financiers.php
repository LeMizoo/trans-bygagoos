<?php
require_once 'config.php';
verifierConnexion();

$current_page = basename($_SERVER['PHP_SELF']);
$mois_selectionne = $_GET['mois'] ?? date('Y-m');
$date_debut = $mois_selectionne . '-01';
$date_fin = date('Y-m-t', strtotime($date_debut));

// Statistiques globales
$total_ca = $bdd->query("SELECT COALESCE(SUM(prix), 0) FROM courses WHERE DATE(date_course) BETWEEN '$date_debut' AND '$date_fin'")->fetchColumn();
$total_depenses = $bdd->query("SELECT COALESCE(SUM(montant), 0) FROM depenses WHERE date_depense BETWEEN '$date_debut' AND '$date_fin'")->fetchColumn();
$benefice = $total_ca - $total_depenses;

// Dépenses par moto
$depenses_par_moto = $bdd->prepare("
    SELECT m.immatriculation, COALESCE(SUM(d.montant), 0) as total
    FROM motos m
    LEFT JOIN depenses d ON d.moto_id = m.id AND d.date_depense BETWEEN ? AND ?
    GROUP BY m.id
    ORDER BY total DESC
");
$depenses_par_moto->execute([$date_debut, $date_fin]);
$depenses_moto = $depenses_par_moto->fetchAll();

// Évolution mensuelle (12 derniers mois)
$evolution = $bdd->query("
    SELECT 
        DATE_FORMAT(date_course, '%Y-%m') as mois,
        COALESCE(SUM(prix), 0) as ca,
        (SELECT COALESCE(SUM(montant), 0) FROM depenses WHERE DATE_FORMAT(date_depense, '%Y-%m') = mois) as depenses
    FROM courses
    WHERE date_course >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY mois
    ORDER BY mois DESC
")->fetchAll();

// Top dépenses
$top_depenses = $bdd->prepare("
    SELECT d.*, c.nom as categorie_nom, c.icon, m.immatriculation
    FROM depenses d
    JOIN categories_depenses c ON d.categorie_id = c.id
    LEFT JOIN motos m ON d.moto_id = m.id
    WHERE d.date_depense BETWEEN ? AND ?
    ORDER BY d.montant DESC
    LIMIT 10
");
$top_depenses->execute([$date_debut, $date_fin]);
$top_depenses_list = $top_depenses->fetchAll();

// Liste des mois pour le sélecteur
$mois_disponibles = $bdd->query("
    SELECT DISTINCT DATE_FORMAT(date_course, '%Y-%m') as mois 
    FROM courses 
    UNION 
    SELECT DISTINCT DATE_FORMAT(date_depense, '%Y-%m') as mois 
    FROM depenses 
    ORDER BY mois DESC
")->fetchAll();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trans ByGagoos - Rapports financiers</title>
    <link rel="icon" type="image/png" href="b-trans.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid var(--gold); }
        .stat-card h4 { color: var(--gold); margin-bottom: 10px; font-size: 14px; }
        .stat-card .number { font-size: 28px; font-weight: bold; color: white; }
        .benefice-positif { color: #27ae60; }
        .benefice-negatif { color: #e74c3c; }
        .month-selector { display: flex; justify-content: center; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
        .month-btn { background: #333; color: white; padding: 10px 20px; border-radius: 8px; text-decoration: none; }
        .month-btn.active { background: var(--gold); color: #000; }
        .month-btn:hover { background: var(--gold); color: #000; }
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
            <a href="#" class="active-parent"><i class="fas fa-chart-pie"></i> ANALYSE <i class="fas fa-chevron-down" style="font-size: 10px;"></i></a>
            <div class="dropdown-content">
                <a href="rapports_financiers.php" class="active"><i class="fas fa-chart-line"></i> Finances</a>
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
        <!-- Sélecteur de mois -->
        <div class="month-selector">
            <a href="?mois=<?= date('Y-m') ?>" class="month-btn <?= $mois_selectionne == date('Y-m') ? 'active' : '' ?>"><i class="fas fa-calendar-alt"></i> Ce mois</a>
            <a href="?mois=<?= date('Y-m', strtotime('-1 month')) ?>" class="month-btn"><i class="fas fa-calendar-week"></i> Mois dernier</a>
            <a href="?mois=<?= date('Y-m', strtotime('-2 month')) ?>" class="month-btn"><?= date('F Y', strtotime('-2 month')) ?></a>
            <select onchange="window.location.href='?mois='+this.value" style="padding: 8px 15px; border-radius: 8px;">
                <option value="">Autre mois...</option>
                <?php foreach ($mois_disponibles as $m): ?>
                    <option value="<?= $m['mois'] ?>" <?= $mois_selectionne == $m['mois'] ? 'selected' : '' ?>>
                        <?= date('F Y', strtotime($m['mois'] . '-01')) ?>
                    </option>
                <?php endforeach; ?>
            </select>
        </div>
        
        <!-- Statistiques -->
        <div class="stats-grid">
            <div class="stat-card">
                <h4><i class="fas fa-chart-line"></i> Chiffre d'affaires</h4>
                <div class="number"><?= number_format($total_ca) ?> Ar</div>
            </div>
            <div class="stat-card">
                <h4><i class="fas fa-coins"></i> Dépenses totales</h4>
                <div class="number"><?= number_format($total_depenses) ?> Ar</div>
            </div>
            <div class="stat-card">
                <h4><i class="fas fa-chart-simple"></i> Bénéfice net</h4>
                <div class="number <?= $benefice >= 0 ? 'benefice-positif' : 'benefice-negatif' ?>"><?= number_format($benefice) ?> Ar</div>
                <div class="sub"><?= $total_ca > 0 ? round(($benefice / $total_ca) * 100, 1) : 0 ?>% de marge</div>
            </div>
        </div>
        
        <!-- Graphique évolution -->
        <?php if (!empty($evolution)): ?>
        <div class="card">
            <h3><i class="fas fa-chart-line"></i> Évolution CA / Dépenses (12 mois)</h3>
            <canvas id="evolutionChart" height="100"></canvas>
        </div>
        <?php endif; ?>
        
        <div class="stats-grid">
            <!-- Dépenses par moto -->
            <div class="card">
                <h3><i class="fas fa-motorcycle"></i> Dépenses par moto</h3>
                <?php if (empty($depenses_moto)): ?>
                    <p>Aucune dépense par moto.</p>
                <?php else: ?>
                    <table style="width:100%">
                        <thead><tr><th>Moto</th><th>Dépenses</th></tr></thead>
                        <tbody>
                            <?php foreach ($depenses_moto as $dm): ?>
                                <tr>
                                    <td><i class="fas fa-motorcycle"></i> <?= htmlspecialchars($dm['immatriculation']) ?></td>
                                    <td style="color:#e74c3c;">- <?= number_format($dm['total']) ?> Ar</i></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>
            
            <!-- Top dépenses -->
            <div class="card">
                <h3><i class="fas fa-fire"></i> Top 10 dépenses</h3>
                <?php if (empty($top_depenses_list)): ?>
                    <p>Aucune dépense enregistrée.</p>
                <?php else: ?>
                    <table style="width:100%">
                        <thead><tr><th>Date</th><th>Catégorie</th><th>Montant</th></tr></thead>
                        <tbody>
                            <?php foreach ($top_depenses_list as $td): ?>
                                <tr>
                                    <td><?= date('d/m/Y', strtotime($td['date_depense'])) ?></td>
                                    <td><i class="<?= $td['icon'] ?>"></i> <?= htmlspecialchars($td['categorie_nom']) ?></td>
                                    <td style="color:#e74c3c;">- <?= number_format($td['montant']) ?> Ar</i></td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                <?php endif; ?>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p><i class="fas fa-heart" style="color: var(--gold);"></i> © <?= date('Y') ?> Trans ByGagoos - Ensemble pour la famille Gagoos <i class="fas fa-heart" style="color: var(--gold);"></i></p>
    </div>
</div>

<?php if (!empty($evolution)): ?>
<script>
const ctx = document.getElementById('evolutionChart').getContext('2d');
const evolution = <?= json_encode(array_reverse($evolution)) ?>;

new Chart(ctx, {
    type: 'line',
    data: {
        labels: evolution.map(e => {
            const date = new Date(e.mois + '-01');
            return date.toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' });
        }),
        datasets: [
            {
                label: 'Chiffre d\'affaires (Ar)',
                data: evolution.map(e => e.ca),
                borderColor: '#27ae60',
                backgroundColor: 'rgba(39,174,96,0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            },
            {
                label: 'Dépenses (Ar)',
                data: evolution.map(e => e.depenses),
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231,76,60,0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.3
            }
        ]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            tooltip: {
                callbacks: {
                    label: function(context) {
                        return context.dataset.label + ': ' + context.raw.toLocaleString() + ' Ar';
                    }
                }
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: { callback: function(v) { return v.toLocaleString() + ' Ar'; } }
            }
        }
    }
});
</script>
<?php endif; ?>
</body>
</html>