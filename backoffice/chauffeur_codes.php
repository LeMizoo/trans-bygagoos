<?php
require_once 'config.php';
verifierConnexion();

$current_page = basename($_SERVER['PHP_SELF']);
$message = '';

// Générer un nouveau code
if (isset($_GET['generer'])) {
    $id = $_GET['generer'];
    $nouveau_code = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
    $stmt = $bdd->prepare("UPDATE chauffeurs SET code_acces = ? WHERE id = ?");
    $stmt->execute([$nouveau_code, $id]);
    $message = "<div class='alert-success'>Nouveau code généré !</div>";
}

// Réinitialiser tous les tokens
if (isset($_GET['reset_all'])) {
    $bdd->exec("UPDATE chauffeurs SET api_token = NULL");
    $message = "<div class='alert-success'>Tous les tokens ont été réinitialisés !</div>";
}

$chauffeurs = $bdd->query("SELECT id, nom, telephone, code_acces FROM chauffeurs ORDER BY id")->fetchAll();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trans ByGagoos - Codes Chauffeurs</title>
    <link rel="icon" type="image/png" href="b-trans.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <style>
        .code-display {
            font-family: monospace;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 4px;
            background: #2a2a2a;
            padding: 8px 15px;
            border-radius: 8px;
            display: inline-block;
        }
        .btn-small {
            padding: 5px 10px;
            font-size: 12px;
        }
        .url-display {
            background: #2a2a2a;
            padding: 10px;
            border-radius: 8px;
            margin-top: 20px;
            word-break: break-all;
        }
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
                <a href="categories_depenses.php"><i class="fas fa-tags"></i> Catégories</a>
                <a href="utilisateurs.php"><i class="fas fa-user-plus"></i> Utilisateurs</a>
                <a href="chauffeur_codes.php" class="active"><i class="fas fa-qrcode"></i> Codes</a>
            </div>
        </div>
    </div>
    
    <div class="content">
        <?= $message ?>
        
        <div class="card">
            <h3>📱 Accès application chauffeur</h3>
            <p>Les chauffeurs peuvent se connecter à l'application mobile avec leur code à 4 chiffres.</p>
            <div class="url-display">
                <strong>🌐 URL d'accès :</strong><br>
                <code>http://<?= $_SERVER['HTTP_HOST'] ?>/ByGagoos-Trans/backoffice/mobile/</code>
            </div>
            <div style="margin-top: 15px;">
                <a href="?reset_all=1" class="btn btn-small" onclick="return confirm('Réinitialiser tous les tokens ?')">🔄 Réinitialiser tous les tokens</a>
            </div>
        </div>
        
        <h3>👨‍✈️ Liste des chauffeurs et leurs codes</h3>
        <div style="overflow-x: auto;">
            <table style="width:100%">
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Téléphone</th>
                        <th>Code d'accès</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($chauffeurs as $c): ?>
                    <tr>
                        <td><?= $c['id'] ?></td>
                        <td><?= htmlspecialchars($c['nom']) ?></td>
                        <td><?= $c['telephone'] ?></td>
                        <td><span class="code-display"><?= $c['code_acces'] ?? 'Non défini' ?></span></td>
                        <td>
                            <a href="?generer=<?= $c['id'] ?>" class="btn-small" style="background:var(--gold);color:#000;">🔄 Générer nouveau</a>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        
        <div class="card">
            <h3>📖 Instructions pour les chauffeurs</h3>
            <ol style="margin-left: 20px; line-height: 1.8;">
                <li>Sur le téléphone du chauffeur, ouvrir <strong>Google Chrome</strong> ou <strong>Firefox</strong></li>
                <li>Aller à l'URL indiquée ci-dessus</li>
                <li>Entrer son <strong>code à 4 chiffres</strong></li>
                <li>L'application s'ouvre, le chauffeur peut enregistrer ses courses</li>
                <li>📱 <strong>Installer l'application :</strong> Menu Chrome → "Installer l'application" ou "Ajouter à l'écran d'accueil"</li>
            </ol>
        </div>
    </div>
    
    <div class="footer">
        <p><i class="fas fa-heart" style="color: var(--gold);"></i> © <?= date('Y') ?> Trans ByGagoos - Ensemble pour la famille Gagoos <i class="fas fa-heart" style="color: var(--gold);"></i></p>
    </div>
</div>
</body>
</html>