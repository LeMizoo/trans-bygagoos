<?php
require_once 'config.php';

// Rediriger si déjà connecté
if (estConnecte()) {
    header('Location: dashboard.php');
    exit();
}

$erreur = '';

if ($_POST) {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    
    $stmt = $bdd->prepare("SELECT * FROM utilisateurs WHERE username = ?");
    $stmt->execute([$username]);
    $user = $stmt->fetch();
    
    if ($user && password_verify($password, $user['password'])) {
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['nom_complet'] = $user['nom_complet'];
        header('Location: dashboard.php');
        exit();
    } else {
        $erreur = "Nom d'utilisateur ou mot de passe incorrect";
    }
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Trans ByGagoos - Connexion</title>
    <link rel="icon" type="image/png" href="b-trans.png">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #000000 0%, #1a1a1a 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .login-container {
            max-width: 450px;
            width: 100%;
            margin: 0 auto;
        }

        .login-card {
            background: #ffffff;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.4);
            text-align: center;
        }

        .login-logo {
            width: 100px;
            margin-bottom: 20px;
        }

        .login-title {
            color: #DAA520;
            font-size: 28px;
            margin-bottom: 10px;
            font-weight: bold;
        }

        .login-subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }

        .input-group {
            margin-bottom: 20px;
            text-align: left;
        }

        .input-group label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 600;
        }

        .input-group input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #ddd;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s;
        }

        .input-group input:focus {
            border-color: #DAA520;
            outline: none;
            box-shadow: 0 0 0 3px rgba(218,165,32,0.1);
        }

        .login-btn {
            width: 100%;
            padding: 14px;
            background: #DAA520;
            color: #000;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s;
        }

        .login-btn:hover {
            background: #FFD700;
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(218,165,32,0.3);
        }

        .error-msg {
            background: #f8d7da;
            color: #721c24;
            padding: 12px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-size: 14px;
        }

        .footer-login {
            text-align: center;
            margin-top: 30px;
            color: #aaa;
            font-size: 12px;
        }

        .hope-message {
            margin-top: 25px;
            font-size: 13px;
            color: #DAA520;
            text-align: center;
            font-style: italic;
            padding: 10px;
            border-top: 1px solid #eee;
        }
    </style>
</head>
<body>
    <div class="login-container">
        <div class="login-card">
            <img src="b-trans.png" alt="Trans ByGagoos" class="login-logo">
            <h1 class="login-title">Trans ByGagoos</h1>
            <p class="login-subtitle">Gestion de flotte taxi-moto</p>
            
            <?php if ($erreur): ?>
                <div class="error-msg">❌ <?= $erreur ?></div>
            <?php endif; ?>
            
            <form method="post">
                <div class="input-group">
                    <label>👤 Nom d'utilisateur</label>
                    <input type="text" name="username" required placeholder="admin">
                </div>
                <div class="input-group">
                    <label>🔒 Mot de passe</label>
                    <input type="password" name="password" required placeholder="••••••">
                </div>
                <button type="submit" class="login-btn">Se connecter</button>
            </form>
            
            <div class="hope-message">
                🌟 Ensemble, roulons vers un avenir meilleur pour toute la famille Gagoos. 🌟
            </div>
        </div>
        <div class="footer-login">
            <p>© <?= date('Y') ?> Trans ByGagoos - Tous droits réservés</p>
        </div>
    </div>
</body>
</html>