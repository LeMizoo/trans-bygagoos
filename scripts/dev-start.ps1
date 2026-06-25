# dev-start.ps1
Clear-Host
Write-Host @"

╔═══════════════════════════════════════════╗
║     🏍️  TRANS BYGAGOOS - DEV MODE      ║
║        D:\Trans-ByGagoos                ║
╚═══════════════════════════════════════════╝

"@ -ForegroundColor Cyan

# Vérifier si PostgreSQL est en cours d'exécution
Write-Host "🗄️  Vérification PostgreSQL..." -ForegroundColor Yellow
$pgStatus = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($pgStatus.Status -eq "Running") {
    Write-Host "✅ PostgreSQL est en cours d'exécution" -ForegroundColor Green
} else {
    Write-Host "⚠️  PostgreSQL n'est pas démarré. Démarrage..." -ForegroundColor Yellow
    Start-Service -Name "postgresql*"
    Write-Host "✅ PostgreSQL démarré" -ForegroundColor Green
}

# Vérifier node_modules
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
}

Write-Host "`n🚀 Démarrage des services..." -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

# Démarrer les services dans des terminaux séparés
$apiPath = "D:\Trans-ByGagoos\apps\api"
$adminPath = "D:\Trans-ByGagoos\apps\admin-web"
$mobilePath = "D:\Trans-ByGagoos\apps\mobile-pwa"

# API
Start-Process powershell -ArgumentList @"
-NoExit -Command Write-Host '🔧 API NestJS - http://localhost:3000' -ForegroundColor Blue; cd '$apiPath'; npm run start:dev
"@

Start-Sleep -Seconds 2

# Admin Web
Start-Process powershell -ArgumentList @"
-NoExit -Command Write-Host '🌐 Admin Web - http://localhost:5173' -ForegroundColor Magenta; cd '$adminPath'; npm run dev
"@

# Mobile PWA
Start-Process powershell -ArgumentList @"
-NoExit -Command Write-Host '📱 Mobile PWA - http://localhost:5174' -ForegroundColor Yellow; cd '$mobilePath'; npm run dev
"@

Write-Host "`n✅ Tous les services sont démarrés !" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "📊 URLs :" -ForegroundColor White
Write-Host "   🔧 API:        http://localhost:3000/api/v1" -ForegroundColor Blue
Write-Host "   📚 Swagger:    http://localhost:3000/api" -ForegroundColor Blue
Write-Host "   🌐 Admin Web:  http://localhost:5173" -ForegroundColor Magenta
Write-Host "   📱 Mobile PWA: http://localhost:5174" -ForegroundColor Yellow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host "🔴 Pour arrêter : Fermez les fenêtres PowerShell" -ForegroundColor Red