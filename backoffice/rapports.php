<?php
require_once 'config.php';
verifierConnexion();

$current_page = basename($_SERVER['PHP_SELF']);
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trans ByGagoos - Rapports</title>
    <link rel="icon" type="image/png" href="b-trans.png">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <link rel="stylesheet" href="style.css">
    <style>
        .export-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(350px, 1fr)); gap: 25px; margin-top: 20px; }
        .export-card { background: #1a1a1a; border-radius: 15px; padding: 25px; border: 1px solid var(--gold); transition: transform 0.3s; }
        .export-card:hover { transform: translateY(-5px); }
        .export-card h3 { color: var(--gold); margin-bottom: 15px; font-size: 20px; }
        .export-card .icon { font-size: 48px; color: var(--gold); margin-bottom: 15px; }
        .btn-export { display: inline-block; background: var(--gold); color: #000; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 5px; transition: all 0.3s; }
        .btn-export:hover { background: #FFD700; transform: translateY(-2px); }
        .btn-pdf { background: #e74c3c; color: white; }
        .btn-pdf:hover { background: #c0392b; }
        .btn-excel { background: #27ae60; color: white; }
        .btn-excel:hover { background: #219a52; }
        .periode-buttons { margin: 15px 0; }
        .periode-btn { background: #333; color: white; padding: 5px 12px; border-radius: 20px; text-decoration: none; font-size: 12px; margin: 3px; display: inline-block; }
        .periode-btn:hover { background: var(--gold); color: #000; }
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
                <a href="rapports_financiers.php"><i class="fas fa-chart-line"></i> Finances</a>
                <a href="rapports.php" class="active"><i class="fas fa-file-alt"></i> Exports</a>
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
        <h2><i class="fas fa-download"></i> Exporter vos rapports</h2>
        
        <div class="export-grid">
            <div class="export-card">
                <div class="icon"><i class="fas fa-file-pdf"></i></div>
                <h3>Rapport PDF des courses</h3>
                <p>Exportez un rapport détaillé des courses au format PDF, prêt à imprimer.</p>
                <div class="periode-buttons">
                    <a href="export_pdf.php?periode=aujourdhui" class="periode-btn"><i class="fas fa-calendar-day"></i> Aujourd'hui</a>
                    <a href="export_pdf.php?periode=semaine" class="periode-btn"><i class="fas fa-calendar-week"></i> Cette semaine</a>
                    <a href="export_pdf.php?periode=mois" class="periode-btn"><i class="fas fa-calendar-alt"></i> Ce mois</a>
                </div>
                <div><a href="export_pdf.php?periode=mois" class="btn-export btn-pdf"><i class="fas fa-file-pdf"></i> PDF Ce mois</a></div>
            </div>
            
            <div class="export-card">
                <div class="icon"><i class="fas fa-file-excel"></i></div>
                <h3>Export Excel des courses</h3>
                <p>Exportez les données des courses au format Excel pour analyse.</p>
                <div class="periode-buttons">
                    <a href="export_excel.php?type=courses&periode=aujourdhui" class="periode-btn"><i class="fas fa-calendar-day"></i> Aujourd'hui</a>
                    <a href="export_excel.php?type=courses&periode=semaine" class="periode-btn"><i class="fas fa-calendar-week"></i> Cette semaine</a>
                    <a href="export_excel.php?type=courses&periode=mois" class="periode-btn"><i class="fas fa-calendar-alt"></i> Ce mois</a>
                </div>
                <div><a href="export_excel.php?type=courses&periode=mois" class="btn-export btn-excel"><i class="fas fa-file-excel"></i> Excel Ce mois</a></div>
            </div>
            
            <div class="export-card">
                <div class="icon"><i class="fas fa-users"></i></div>
                <h3>Performance des chauffeurs</h3>
                <p>Analyse détaillée des performances par chauffeur.</p>
                <div class="periode-buttons">
                    <a href="export_excel.php?type=chauffeurs&periode=semaine" class="periode-btn"><i class="fas fa-calendar-week"></i> Cette semaine</a>
                    <a href="export_excel.php?type=chauffeurs&periode=mois" class="periode-btn"><i class="fas fa-calendar-alt"></i> Ce mois</a>
                </div>
                <div><a href="export_excel.php?type=chauffeurs&periode=mois" class="btn-export btn-excel"><i class="fas fa-file-excel"></i> Excel Chauffeurs</a></div>
            </div>
            
            <div class="export-card">
                <div class="icon"><i class="fas fa-chart-pie"></i></div>
                <h3>Statistiques globales</h3>
                <p>Vue d'ensemble de votre activité.</p>
                <?php
                $total_motos = $bdd->query("SELECT COUNT(*) FROM motos")->fetchColumn();
                $total_chauffeurs = $bdd->query("SELECT COUNT(*) FROM chauffeurs")->fetchColumn();
                $total_ca = $bdd->query("SELECT COALESCE(SUM(prix), 0) FROM courses")->fetchColumn();
                $total_courses = $bdd->query("SELECT COUNT(*) FROM courses")->fetchColumn();
                ?>
                <div style="margin: 15px 0;">
                    <p><i class="fas fa-motorcycle"></i> <?= $total_motos ?> motos</p>
                    <p><i class="fas fa-users"></i> <?= $total_chauffeurs ?> chauffeurs</p>
                    <p><i class="fas fa-receipt"></i> <?= number_format($total_courses) ?> courses</p>
                    <p><i class="fas fa-money-bill-wave"></i> <?= number_format($total_ca) ?> Ar</p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="footer">
        <p><i class="fas fa-heart" style="color: var(--gold);"></i> © <?= date('Y') ?> Trans ByGagoos - Ensemble pour la famille Gagoos <i class="fas fa-heart" style="color: var(--gold);"></i></p>
    </div>
</div>
</body>
</html>