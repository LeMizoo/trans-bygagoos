<?php
require_once 'config.php';
verifierConnexion();

$current_page = basename($_SERVER['PHP_SELF']);
$message = '';
$erreur = '';

// Ajouter une dépense
if (isset($_POST['ajouter'])) {
    $moto_id = $_POST['moto_id'] ?: null;
    $categorie_id = $_POST['categorie_id'];
    $montant = $_POST['montant'];
    $description = trim($_POST['description']);
    $date_depense = $_POST['date_depense'];
    $kilometrage = $_POST['kilometrage'] ?: 0;
    $fournisseur = trim($_POST['fournisseur']);
    
    $stmt = $bdd->prepare("INSERT INTO depenses (moto_id, categorie_id, montant, description, date_depense, kilometrage, fournisseur) VALUES (?, ?, ?, ?, ?, ?, ?)");
    $stmt->execute([$moto_id, $categorie_id, $montant, $description, $date_depense, $kilometrage, $fournisseur]);
    $message = "<div class='alert-success'><i class='fas fa-check-circle'></i> Dépense ajoutée avec succès !</div>";
}

// Supprimer une dépense
if (isset($_GET['supprimer'])) {
    $stmt = $bdd->prepare("DELETE FROM depenses WHERE id = ?");
    $stmt->execute([$_GET['supprimer']]);
    $message = "<div class='alert-success'><i class='fas fa-check-circle'></i> Dépense supprimée !</div>";
}

// Récupérer les données
$motos = $bdd->query("SELECT * FROM motos ORDER BY immatriculation ASC")->fetchAll();
$categories = $bdd->query("SELECT * FROM categories_depenses WHERE actif = 1")->fetchAll();

// Statistiques du mois
$date_debut = date('Y-m-01');
$date_fin = date('Y-m-t');

$total_depenses_mois = $bdd->query("SELECT COALESCE(SUM(montant), 0) FROM depenses WHERE date_depense BETWEEN '$date_debut' AND '$date_fin'")->fetchColumn();
$total_ca_mois = $bdd->query("SELECT COALESCE(SUM(prix), 0) FROM courses WHERE DATE(date_course) BETWEEN '$date_debut' AND '$date_fin'")->fetchColumn();
$benefice_mois = $total_ca_mois - $total_depenses_mois;

$depenses_par_categorie = $bdd->query("
    SELECT c.nom as categorie, c.couleur, COALESCE(SUM(d.montant), 0) as total
    FROM categories_depenses c
    LEFT JOIN depenses d ON d.categorie_id = c.id AND d.date_depense BETWEEN '$date_debut' AND '$date_fin'
    GROUP BY c.id
    ORDER BY total DESC
")->fetchAll();

// Liste des dépenses
$depenses = $bdd->query("
    SELECT d.*, m.immatriculation, c.nom as categorie_nom, c.icon as categorie_icon, c.couleur as categorie_couleur
    FROM depenses d
    LEFT JOIN motos m ON d.moto_id = m.id
    JOIN categories_depenses c ON d.categorie_id = c.id
    ORDER BY d.date_depense DESC
    LIMIT 50
")->fetchAll();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trans ByGagoos - Dépenses</title>
    <link rel="icon" type="image/png" href="b-trans.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: linear-gradient(135deg, #1a1a1a 0%, #2c2c2c 100%); border-radius: 12px; padding: 20px; text-align: center; border: 1px solid var(--gold); transition: transform 0.3s; }
        .stat-card:hover { transform: translateY(-3px); }
        .stat-card h4 { color: var(--gold); margin-bottom: 10px; font-size: 14px; }
        .stat-card .number { font-size: 28px; font-weight: bold; color: white; }
        .stat-card .sub { color: #aaa; font-size: 12px; }
        .benefice-positif { color: #27ae60; }
        .benefice-negatif { color: #e74c3c; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
        @media (max-width: 768px) { .form-row { grid-template-columns: 1fr; } }
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
                <a href="courses.php"><i class="fas fa-receipt"></i> Courses</a>
                <a href="depenses.php" class="active"><i class="fas fa-coins"></i> Dépenses</a>
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
        <?= $erreur ?>
        
        <!-- Statistiques -->
        <div class="stats-grid">
            <div class="stat-card">
                <h4><i class="fas fa-chart-line"></i> CA du mois</h4>
                <div class="number"><?= number_format($total_ca_mois) ?> Ar</div>
                <div class="sub"><?= date('F Y') ?></div>
            </div>
            <div class="stat-card">
                <h4><i class="fas fa-coins"></i> Dépenses du mois</h4>
                <div class="number"><?= number_format($total_depenses_mois) ?> Ar</div>
                <div class="sub"><?= date('F Y') ?></div>
            </div>
            <div class="stat-card">
                <h4><i class="fas fa-chart-simple"></i> Bénéfice du mois</h4>
                <div class="number <?= $benefice_mois >= 0 ? 'benefice-positif' : 'benefice-negatif' ?>"><?= number_format($benefice_mois) ?> Ar</div>
                <div class="sub"><?= $total_ca_mois > 0 ? round(($benefice_mois / $total_ca_mois) * 100, 1) : 0 ?>% de marge</div>
            </div>
        </div>
        
        <!-- Formulaire d'ajout -->
        <div class="card">
            <h3><i class="fas fa-plus-circle"></i> Ajouter une dépense</h3>
            <form method="post">
                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-tag"></i> Catégorie :</label>
                        <select name="categorie_id" required>
                            <option value="">-- Sélectionner --</option>
                            <?php foreach ($categories as $cat): ?>
                                <option value="<?= $cat['id'] ?>"><i class="<?= $cat['icon'] ?>"></i> <?= htmlspecialchars($cat['nom']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-motorcycle"></i> Moto :</label>
                        <select name="moto_id">
                            <option value="">-- Toutes / Non assignée --</option>
                            <?php foreach ($motos as $moto): ?>
                                <option value="<?= $moto['id'] ?>"><i class="fas fa-motorcycle"></i> <?= htmlspecialchars($moto['immatriculation']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-money-bill-wave"></i> Montant (Ar) :</label>
                        <input type="number" name="montant" required placeholder="Ex: 25000">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-calendar"></i> Date :</label>
                        <input type="date" name="date_depense" value="<?= date('Y-m-d') ?>" required>
                    </div>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label><i class="fas fa-road"></i> Kilométrage :</label>
                        <input type="number" name="kilometrage" placeholder="Optionnel">
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-building"></i> Fournisseur :</label>
                        <input type="text" name="fournisseur" placeholder="Optionnel">
                    </div>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-align-left"></i> Description :</label>
                    <textarea name="description" rows="2" placeholder="Description de la dépense..."></textarea>
                </div>
                <button type="submit" name="ajouter"><i class="fas fa-save"></i> Enregistrer la dépense</button>
            </form>
        </div>
        
        <!-- Graphique des dépenses par catégorie -->
        <?php if (!empty($depenses_par_categorie)): ?>
        <div class="card">
            <h3><i class="fas fa-chart-pie"></i> Répartition des dépenses par catégorie</h3>
            <canvas id="depensesChart" height="80"></canvas>
        </div>
        <?php endif; ?>
        
        <!-- Liste des dépenses -->
        <h3><i class="fas fa-list"></i> Dernières dépenses</h3>
        <?php if (empty($depenses)): ?>
            <div class="card"><p><i class="fas fa-info-circle"></i> Aucune dépense enregistrée.</p></div>
        <?php else: ?>
        <div style="overflow-x: auto;">
            <table style="width:100%">
                <thead>
                    <tr>
                        <th><i class="fas fa-calendar"></i> Date</th>
                        <th><i class="fas fa-tag"></i> Catégorie</th>
                        <th><i class="fas fa-motorcycle"></i> Moto</th>
                        <th><i class="fas fa-align-left"></i> Description</th>
                        <th><i class="fas fa-money-bill-wave"></i> Montant</th>
                        <th><i class="fas fa-cogs"></i> Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($depenses as $d): ?>
                    <tr>
                        <td><?= date('d/m/Y', strtotime($d['date_depense'])) ?></td>
                        <td><i class="<?= $d['categorie_icon'] ?>" style="color:<?= $d['categorie_couleur'] ?>"></i> <?= htmlspecialchars($d['categorie_nom']) ?></td>
                        <td><?= $d['immatriculation'] ?? '<i class="fas fa-minus-circle"></i> Non assignée' ?></td>
                        <td><?= htmlspecialchars($d['description'] ?: '-') ?></td>
                        <td style="color: #e74c3c; font-weight: bold;">- <?= number_format($d['montant']) ?> Ar</i></td>
                        <td><a href="?supprimer=<?= $d['id'] ?>" onclick="return confirm('Supprimer cette dépense ?')" style="color:#e74c3c;"><i class="fas fa-trash-alt"></i> Supprimer</a></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php endif; ?>
    </div>
    
    <div class="footer">
        <p><i class="fas fa-heart" style="color: var(--gold);"></i> © <?= date('Y') ?> Trans ByGagoos - Ensemble pour la famille Gagoos <i class="fas fa-heart" style="color: var(--gold);"></i></p>
    </div>
</div>

<script>
<?php if (!empty($depenses_par_categorie)): ?>
const ctx = document.getElementById('depensesChart').getContext('2d');
const categories = <?= json_encode(array_column($depenses_par_categorie, 'categorie')) ?>;
const totals = <?= json_encode(array_column($depenses_par_categorie, 'total')) ?>;
const couleurs = <?= json_encode(array_column($depenses_par_categorie, 'couleur')) ?>;

new Chart(ctx, {
    type: 'doughnut',
    data: {
        labels: categories,
        datasets: [{
            data: totals,
            backgroundColor: couleurs.map(c => c || '#DAA520'),
            borderWidth: 0
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { position: 'bottom', labels: { color: '#fff' } },
            tooltip: { callbacks: { label: function(context) { return context.label + ': ' + context.raw.toLocaleString() + ' Ar'; } } }
        }
    }
});
<?php endif; ?>
</script>
</body>
</html>