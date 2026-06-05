<?php
$bdd = new PDO('mysql:host=localhost;dbname=bygagoos', 'root', '');
$bdd->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// 1️⃣ Supprimer l'ancien admin si existant
$bdd->exec("DELETE FROM utilisateurs WHERE username = 'admin'");

// 2️⃣ Créer un hash VALIDE pour "admin123"
$bonHash = password_hash('admin123', PASSWORD_DEFAULT);

// 3️⃣ Insérer
$stmt = $bdd->prepare("INSERT INTO utilisateurs (username, password, nom_complet) VALUES ('admin', ?, 'Administrateur')");
$stmt->execute([$bonHash]);

echo "✅ Admin recréé avec succès<br>";
echo "🔐 Identifiants : <strong>admin / admin123</strong><br>";
echo "<hr>";
echo "<a href='index.php'>🔓 Aller à la page de connexion</a>";
?>