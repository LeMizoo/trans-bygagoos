<?php
require_once 'config.php';
verifierConnexion();

$current_page = basename($_SERVER['PHP_SELF']);
$message = '';

// Ajouter une catégorie
if (isset($_POST['ajouter'])) {
    $stmt = $bdd->prepare("INSERT INTO categories_depenses (nom, icon, couleur) VALUES (?, ?, ?)");
    $stmt->execute([$_POST['nom'], $_POST['icon'], $_POST['couleur']]);
    $message = "<div class='alert-success'><i class='fas fa-check-circle'></i> Catégorie ajoutée !</div>";
}

// Supprimer une catégorie
if (isset($_GET['supprimer'])) {
    $stmt = $bdd->prepare("DELETE FROM categories_depenses WHERE id = ?");
    $stmt->execute([$_GET['supprimer']]);
    $message = "<div class='alert-success'><i class='fas fa-check-circle'></i> Catégorie supprimée !</div>";
}

$categories = $bdd->query("SELECT * FROM categories_depenses ORDER BY nom")->fetchAll();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trans ByGagoos - Catégories de dépenses</title>
    <link rel="icon" type="image/png" href="b-trans.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <style>
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
                <a href="parametres.php"><i class="fas fa-sliders-h"></i> Paramètres</a>
                <a href="categories_depenses.php" class="active"><i class="fas fa-tags"></i> Catégories</a>
                <a href="utilisateurs.php"><i class="fas fa-user-plus"></i> Utilisateurs</a>
                <a href="chauffeur_codes.php"><i class="fas fa-qrcode"></i> Codes</a>
            </div>
        </div>
    </div>
    
    <div class="content">
        <?= $message ?>
        
        <div class="card">
            <h3><i class="fas fa-plus-circle"></i> Ajouter une catégorie</h3>
            <form method="post" class="form-row">
                <div class="form-group"><label><i class="fas fa-tag"></i> Nom :</label><input type="text" name="nom" required></div>
                <div class="form-group"><label><i class="fas fa-icons"></i> Icône (Font Awesome) :</label><input type="text" name="icon" value="fas fa-tag" required></div>
                <div class="form-group"><label><i class="fas fa-palette"></i> Couleur :</label><input type="color" name="couleur" value="#DAA520"></div>
                <div class="form-group"><button type="submit" name="ajouter"><i class="fas fa-plus"></i> Ajouter</button></div>
            </form>
        </div>
        
        <h3><i class="fas fa-list"></i> Catégories existantes</h3>
        <div style="overflow-x: auto;">
            <table style="width:100%">
                <thead>
                    <tr><th>Icône</th><th>Nom</th><th>Couleur</th><th>Actions</th></tr>
                </thead>
                <tbody>
                    <?php foreach ($categories as $cat): ?>
                    <tr>
                        <td><i class="<?= $cat['icon'] ?>" style="font-size:20px; color:<?= $cat['couleur'] ?>"></i></td>
                        <td><?= htmlspecialchars($cat['nom']) ?></td>
                        <td><div style="width:30px; height:30px; background:<?= $cat['couleur'] ?>; border-radius:5px;"></div></td>
                        <td><a href="?supprimer=<?= $cat['id'] ?>" onclick="return confirm('Supprimer cette catégorie ?')" style="color:#e74c3c;"><i class="fas fa-trash-alt"></i> Supprimer</a></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
    <div class="footer"><p><i class="fas fa-heart" style="color: var(--gold);"></i> © <?= date('Y') ?> Trans ByGagoos - Ensemble pour la famille Gagoos <i class="fas fa-heart" style="color: var(--gold);"></i></p></div>
</div>
</body>
</html>