<?php
require_once 'config.php';
verifierConnexion();

$current_page = basename($_SERVER['PHP_SELF']);
$message = '';
$erreur = '';

// Ajouter un utilisateur
if (isset($_POST['ajouter'])) {
    $username = trim($_POST['username']);
    $nom_complet = trim($_POST['nom_complet']);
    $password = $_POST['password'];
    $role = $_POST['role'];
    
    $check = $bdd->prepare("SELECT COUNT(*) FROM utilisateurs WHERE username = ?");
    $check->execute([$username]);
    
    if ($check->fetchColumn() > 0) {
        $erreur = "<div class='alert-error'><i class='fas fa-exclamation-circle'></i> Ce nom d'utilisateur existe déjà !</div>";
    } elseif (strlen($password) < 4) {
        $erreur = "<div class='alert-error'><i class='fas fa-exclamation-circle'></i> Le mot de passe doit contenir au moins 4 caractères !</div>";
    } else {
        $hash = password_hash($password, PASSWORD_DEFAULT);
        $stmt = $bdd->prepare("INSERT INTO utilisateurs (username, password, nom_complet, role) VALUES (?, ?, ?, ?)");
        $stmt->execute([$username, $hash, $nom_complet, $role]);
        $message = "<div class='alert-success'><i class='fas fa-check-circle'></i> Utilisateur '$username' ajouté avec succès !</div>";
    }
}

// Changer son propre mot de passe
if (isset($_POST['changer_mdp'])) {
    $ancien = $_POST['ancien_mdp'];
    $nouveau = $_POST['nouveau_mdp'];
    $confirmation = $_POST['confirmation_mdp'];
    
    $stmt = $bdd->prepare("SELECT password FROM utilisateurs WHERE id = ?");
    $stmt->execute([$_SESSION['user_id']]);
    $user = $stmt->fetch();
    
    if (!password_verify($ancien, $user['password'])) {
        $erreur = "<div class='alert-error'><i class='fas fa-exclamation-circle'></i> Ancien mot de passe incorrect !</div>";
    } elseif (strlen($nouveau) < 4) {
        $erreur = "<div class='alert-error'><i class='fas fa-exclamation-circle'></i> Le nouveau mot de passe doit contenir au moins 4 caractères !</div>";
    } elseif ($nouveau !== $confirmation) {
        $erreur = "<div class='alert-error'><i class='fas fa-exclamation-circle'></i> Les nouveaux mots de passe ne correspondent pas !</div>";
    } else {
        $hash = password_hash($nouveau, PASSWORD_DEFAULT);
        $stmt = $bdd->prepare("UPDATE utilisateurs SET password = ? WHERE id = ?");
        $stmt->execute([$hash, $_SESSION['user_id']]);
        $message = "<div class='alert-success'><i class='fas fa-check-circle'></i> Votre mot de passe a été changé avec succès !</div>";
    }
}

// Modifier un utilisateur
if (isset($_POST['modifier_utilisateur']) && $_SESSION['role'] === 'admin') {
    $id = $_POST['user_id'];
    $nom_complet = trim($_POST['nom_complet']);
    $role = $_POST['role'];
    
    $stmt = $bdd->prepare("UPDATE utilisateurs SET nom_complet = ?, role = ? WHERE id = ?");
    $stmt->execute([$nom_complet, $role, $id]);
    $message = "<div class='alert-success'><i class='fas fa-check-circle'></i> Utilisateur modifié !</div>";
}

// Supprimer un utilisateur
if (isset($_GET['supprimer']) && $_SESSION['role'] === 'admin') {
    $id = $_GET['supprimer'];
    if ($id != $_SESSION['user_id']) {
        $stmt = $bdd->prepare("DELETE FROM utilisateurs WHERE id = ?");
        $stmt->execute([$id]);
        $message = "<div class='alert-success'><i class='fas fa-check-circle'></i> Utilisateur supprimé !</div>";
    } else {
        $erreur = "<div class='alert-error'><i class='fas fa-exclamation-circle'></i> Vous ne pouvez pas vous supprimer vous-même !</div>";
    }
}

$utilisateurs = $bdd->query("SELECT * FROM utilisateurs ORDER BY id ASC")->fetchAll();
$stmt = $bdd->prepare("SELECT * FROM utilisateurs WHERE id = ?");
$stmt->execute([$_SESSION['user_id']]);
$current_user = $stmt->fetch();
$_SESSION['role'] = $current_user['role'];
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trans ByGagoos - Utilisateurs</title>
    <link rel="icon" type="image/png" href="b-trans.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <style>
        .two-columns { display: grid; grid-template-columns: 1fr 1fr; gap: 25px; }
        .role-badge { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: bold; }
        .role-admin { background: #DAA520; color: #000; }
        .role-user { background: #333; color: #fff; }
        .current-user { background: rgba(218,165,32,0.1); border-left: 3px solid #DAA520; }
        @media (max-width: 768px) { .two-columns { grid-template-columns: 1fr; } }
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
                <a href="utilisateurs.php" class="active"><i class="fas fa-user-plus"></i> Utilisateurs</a>
                <a href="chauffeur_codes.php"><i class="fas fa-qrcode"></i> Codes</a>
            </div>
        </div>
    </div>
    
    <div class="content">
        <?= $message ?>
        <?= $erreur ?>
        
        <div class="two-columns">
            <div class="card">
                <h3><i class="fas fa-key"></i> Changer mon mot de passe</h3>
                <form method="post">
                    <div class="form-group"><label><i class="fas fa-lock"></i> Ancien mot de passe :</label><input type="password" name="ancien_mdp" required></div>
                    <div class="form-group"><label><i class="fas fa-lock"></i> Nouveau mot de passe :</label><input type="password" name="nouveau_mdp" required></div>
                    <div class="form-group"><label><i class="fas fa-lock"></i> Confirmation :</label><input type="password" name="confirmation_mdp" required></div>
                    <button type="submit" name="changer_mdp"><i class="fas fa-save"></i> Changer mon mot de passe</button>
                </form>
            </div>
            
            <?php if ($_SESSION['role'] === 'admin'): ?>
            <div class="card">
                <h3><i class="fas fa-user-plus"></i> Ajouter un membre de la famille</h3>
                <form method="post">
                    <div class="form-group"><label><i class="fas fa-user"></i> Nom d'utilisateur :</label><input type="text" name="username" placeholder="ex: marie" required></div>
                    <div class="form-group"><label><i class="fas fa-id-card"></i> Nom complet :</label><input type="text" name="nom_complet" placeholder="Marie Gagoos" required></div>
                    <div class="form-group"><label><i class="fas fa-key"></i> Mot de passe :</label><input type="password" name="password" placeholder="minimum 4 caractères" required></div>
                    <div class="form-group"><label><i class="fas fa-user-tag"></i> Rôle :</label><select name="role"><option value="user"><i class="fas fa-user"></i> Utilisateur (accès limité)</option><option value="admin"><i class="fas fa-crown"></i> Administrateur (accès total)</option></select></div>
                    <button type="submit" name="ajouter"><i class="fas fa-plus"></i> Ajouter le membre</button>
                </form>
            </div>
            <?php endif; ?>
        </div>
        
        <div class="card">
            <h3><i class="fas fa-users"></i> Membres de la famille Gagoos</h3>
            <?php if (empty($utilisateurs)): ?>
                <p>Aucun utilisateur enregistré.</p>
            <?php else: ?>
                <div style="overflow-x: auto;">
                    <table style="width:100%">
                        <thead>
                            <tr><th>ID</th><th><i class="fas fa-user"></i> Utilisateur</th><th><i class="fas fa-id-card"></i> Nom complet</th><th><i class="fas fa-user-tag"></i> Rôle</th><th><i class="fas fa-calendar"></i> Date création</th><?php if ($_SESSION['role'] === 'admin'): ?><th><i class="fas fa-cogs"></i> Actions</th><?php endif; ?></tr>
                        </thead>
                        <tbody>
                            <?php foreach ($utilisateurs as $user): $is_current = ($user['id'] == $_SESSION['user_id']); ?>
                            <tr class="<?= $is_current ? 'current-user' : '' ?>">
                                <td><?= $user['id'] ?></td>
                                <td><strong><i class="fas fa-user-circle"></i> <?= htmlspecialchars($user['username']) ?></strong> <?= $is_current ? '<i class="fas fa-star" style="color:#DAA520;"></i> (vous)' : '' ?></td>
                                <td><i class="fas fa-id-card"></i> <?= htmlspecialchars($user['nom_complet']) ?></td>
                                <td><span class="role-badge <?= $user['role'] === 'admin' ? 'role-admin' : 'role-user' ?>"><i class="fas <?= $user['role'] === 'admin' ? 'fa-crown' : 'fa-user' ?>"></i> <?= $user['role'] === 'admin' ? 'Admin' : 'Utilisateur' ?></span></td>
                                <td><i class="fas fa-calendar-alt"></i> <?= date('d/m/Y', strtotime($user['date_creation'])) ?></td>
                                <?php if ($_SESSION['role'] === 'admin' && $user['id'] != $_SESSION['user_id']): ?>
                                <td><a href="?supprimer=<?= $user['id'] ?>" onclick="return confirm('Supprimer cet utilisateur ?')" style="color:#e74c3c;"><i class="fas fa-trash-alt"></i> Supprimer</a></td>
                                <?php elseif ($_SESSION['role'] === 'admin'): ?>
                                <td><span style="color:#777;"><i class="fas fa-user-check"></i> Vous</span></td>
                                <?php endif; ?>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
                <p style="margin-top:15px; text-align:center; color:var(--gold);"><i class="fas fa-heart"></i> Toute la famille Gagoos unie pour la réussite ! <i class="fas fa-heart"></i></p>
            <?php endif; ?>
        </div>
    </div>
    <div class="footer"><p><i class="fas fa-heart" style="color: var(--gold);"></i> © <?= date('Y') ?> Trans ByGagoos - Ensemble pour la famille Gagoos <i class="fas fa-heart" style="color: var(--gold);"></i></p></div>
</div>
</body>
</html>