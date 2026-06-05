<?php
require_once 'config.php';
verifierConnexion();

$current_page = basename($_SERVER['PHP_SELF']);
$message = '';
$erreur = '';

if (!empty($_POST['immat'])) {
    try {
        $stmt = $bdd->prepare("INSERT INTO motos (immatriculation, km_actuel, km_prochaine_vidange) VALUES (?, ?, ?)");
        $stmt->execute([$_POST['immat'], $_POST['km_actuel'], $_POST['km_vidange']]);
        $message = "<div class='alert-success'><i class='fas fa-check-circle'></i> Moto ajoutée avec succès !</div>";
    } catch (PDOException $e) {
        $erreur = "<div class='alert-error'><i class='fas fa-exclamation-circle'></i> Cette immatriculation existe déjà !</div>";
    }
}

if (isset($_GET['supprimer'])) {
    $stmt = $bdd->prepare("DELETE FROM motos WHERE id = ?");
    $stmt->execute([$_GET['supprimer']]);
    $message = "<div class='alert-success'><i class='fas fa-check-circle'></i> Moto supprimée !</div>";
}

if (isset($_POST['modifier_id'])) {
    $stmt = $bdd->prepare("UPDATE motos SET immatriculation = ?, km_actuel = ?, km_prochaine_vidange = ? WHERE id = ?");
    $stmt->execute([$_POST['immat'], $_POST['km_actuel'], $_POST['km_vidange'], $_POST['modifier_id']]);
    $message = "<div class='alert-success'><i class='fas fa-check-circle'></i> Moto modifiée !</div>";
}

$motos = $bdd->query("SELECT * FROM motos ORDER BY id DESC")->fetchAll();
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trans ByGagoos - Motos</title>
    <link rel="icon" type="image/png" href="b-trans.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <style>
        .badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .badge-success { background: #27ae60; color: white; }
        .badge-warning { background: #f39c12; color: #1a1a1a; }
        .badge-danger { background: #e74c3c; color: white; }
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
            <a href="#" class="active-parent"><i class="fas fa-motorcycle"></i> FLOTTE <i class="fas fa-chevron-down" style="font-size: 10px;"></i></a>
            <div class="dropdown-content">
                <a href="motos.php" class="active"><i class="fas fa-motorcycle"></i> Motos</a>
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
        <?= $message . $erreur ?>
        
        <div class="card">
            <h3><i class="fas fa-plus-circle"></i> Ajouter une nouvelle moto</h3>
            <form method="post">
                <div class="form-group"><label><i class="fas fa-id-card"></i> Immatriculation :</label><input type="text" name="immat" placeholder="Ex: TX-001" required></div>
                <div class="form-row">
                    <div class="form-group"><label><i class="fas fa-road"></i> Kilométrage actuel (km) :</label><input type="number" name="km_actuel" value="0"></div>
                    <div class="form-group"><label><i class="fas fa-oil-can"></i> Prochaine vidange (km) :</label><input type="number" name="km_vidange" value="5000"></div>
                </div>
                <button type="submit"><i class="fas fa-plus"></i> Ajouter la moto</button>
            </form>
        </div>
        
        <h3><i class="fas fa-list"></i> Liste de vos motos</h3>
        <div style="overflow-x: auto;">
            <table style="width:100%">
                <thead><tr><th>ID</th><th><i class="fas fa-id-card"></i> Immatriculation</th><th><i class="fas fa-road"></i> KM actuel</th><th><i class="fas fa-oil-can"></i> Prochaine vidange</th><th><i class="fas fa-chart-line"></i> KM restant</th><th><i class="fas fa-info-circle"></i> Statut</th><th><i class="fas fa-cogs"></i> Actions</th></tr></thead>
                <tbody>
                    <?php foreach ($motos as $moto): 
                        $km_restant = $moto['km_prochaine_vidange'] - $moto['km_actuel'];
                        $statut = $km_restant <= 0 ? 'URGENT' : ($km_restant <= 500 ? 'Attention' : 'OK');
                        $statut_class = $km_restant <= 0 ? 'badge-danger' : ($km_restant <= 500 ? 'badge-warning' : 'badge-success');
                        $statut_icon = $km_restant <= 0 ? '<i class="fas fa-circle" style="color:#e74c3c; font-size:10px;"></i>' : ($km_restant <= 500 ? '<i class="fas fa-circle" style="color:#f39c12; font-size:10px;"></i>' : '<i class="fas fa-circle" style="color:#27ae60; font-size:10px;"></i>');
                    ?>
                    <tr>
                        <td><?= $moto['id'] ?></td>
                        <td><strong><i class="fas fa-motorcycle"></i> <?= htmlspecialchars($moto['immatriculation']) ?></strong></td>
                        <td><?= number_format($moto['km_actuel']) ?> km</i></td>
                        <td><?= number_format($moto['km_prochaine_vidange']) ?> km</i></td>
                        <td><?= number_format(abs($km_restant)) ?> km</i></td>
                        <td><span class="badge <?= $statut_class ?>"><?= $statut_icon ?> <?= $statut ?></span></td>
                        <td><button onclick="ouvrirModale(<?= $moto['id'] ?>, '<?= htmlspecialchars($moto['immatriculation']) ?>', <?= $moto['km_actuel'] ?>, <?= $moto['km_prochaine_vidange'] ?>)" style="padding:5px 10px;font-size:12px;"><i class="fas fa-edit"></i> Modifier</button> <a href="?supprimer=<?= $moto['id'] ?>" onclick="return confirm('Supprimer cette moto ?')" style="background:#e74c3c;color:white;padding:5px 10px;text-decoration:none;border-radius:5px;font-size:12px;"><i class="fas fa-trash-alt"></i> Supprimer</a></i></td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
    </div>
    <div class="footer"><p><i class="fas fa-heart" style="color: var(--gold);"></i> © <?= date('Y') ?> Trans ByGagoos - Ensemble pour la famille Gagoos <i class="fas fa-heart" style="color: var(--gold);"></i></p></div>
</div>

<div id="modale" style="display:none; position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); justify-content:center; align-items:center; z-index:1000;">
    <div style="background:white; padding:30px; border-radius:15px; max-width:500px; width:90%;">
        <h3 style="color:var(--gold);"><i class="fas fa-edit"></i> Modifier la moto</h3>
        <form method="post" id="formModifier">
            <input type="hidden" name="modifier_id" id="modifier_id">
            <div class="form-group"><label><i class="fas fa-id-card"></i> Immatriculation :</label><input type="text" name="immat" id="modif_immat" required></div>
            <div class="form-group"><label><i class="fas fa-road"></i> Kilométrage actuel :</label><input type="number" name="km_actuel" id="modif_km"></div>
            <div class="form-group"><label><i class="fas fa-oil-can"></i> Prochaine vidange :</label><input type="number" name="km_vidange" id="modif_vidange"></div>
            <div style="display:flex; gap:10px;"><button type="submit"><i class="fas fa-save"></i> Enregistrer</button><button type="button" onclick="fermerModale()" style="background:#555;"><i class="fas fa-times"></i> Annuler</button></div>
        </form>
    </div>
</div>
<script>
function ouvrirModale(id, immat, km, vidange) {
    document.getElementById('modifier_id').value = id;
    document.getElementById('modif_immat').value = immat;
    document.getElementById('modif_km').value = km;
    document.getElementById('modif_vidange').value = vidange;
    document.getElementById('modale').style.display = 'flex';
}
function fermerModale() { document.getElementById('modale').style.display = 'none'; }
</script>
</body>
</html>