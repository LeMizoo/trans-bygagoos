# init-project.ps1
Write-Host "🚀 Initialisation de Trans ByGagoos..." -ForegroundColor Green

# Vérifier les prérequis
Write-Host "`n📋 Vérification des prérequis..." -ForegroundColor Yellow

# Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js non trouvé. Installez Node.js 20+" -ForegroundColor Red
    exit 1
}

# npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm non trouvé" -ForegroundColor Red
    exit 1
}

# Git
try {
    $gitVersion = git --version
    Write-Host "✅ Git installé" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Git non trouvé (optionnel)" -ForegroundColor Yellow
}

# Créer la structure des dossiers
Write-Host "`n📁 Création de la structure..." -ForegroundColor Yellow

$directories = @(
    "apps\admin-web\src",
    "apps\mobile-pwa\src", 
    "apps\api\src",
    "packages\types\src",
    "packages\ui\src",
    "packages\utils\src",
    "packages\api-client\src",
    "scripts",
    ".vscode"
)

foreach ($dir in $directories) {
    New-Item -ItemType Directory -Force -Path $dir | Out-Null
    Write-Host "✅ $dir" -ForegroundColor Gray
}

# Initialiser le package.json racine
Write-Host "`n📦 Initialisation du package.json..." -ForegroundColor Yellow

$packageJson = @{
    name = "trans-bygagoos"
    version = "1.0.0"
    private = $true
    scripts = @{
        dev = "turbo run dev"
        build = "turbo run build"
        lint = "turbo run lint"
        "dev:api" = "turbo run dev --filter=api"
        "dev:admin" = "turbo run dev --filter=admin-web"
        "dev:mobile" = "turbo run dev --filter=mobile-pwa"
        "db:migrate" = "cd apps/api && npx prisma migrate dev"
        "db:seed" = "cd apps/api && npx prisma db seed"
        "db:studio" = "cd apps/api && npx prisma studio"
    }
    devDependencies = @{
        turbo = "^2.0.0"
        typescript = "^5.5.0"
        "@types/node" = "^20.0.0"
    }
    packageManager = "npm@10.0.0"
    workspaces = @(
        "apps/*",
        "packages/*"
    )
}

$packageJson | ConvertTo-Json -Depth 10 | Set-Content -Path "package.json"
Write-Host "✅ package.json créé" -ForegroundColor Green

# Créer turbo.json
Write-Host "`n⚡ Configuration de Turborepo..." -ForegroundColor Yellow

$turboJson = @{
    "$schema" = "https://turbo.build/schema.json"
    globalDependencies = @(".env")
    pipeline = @{
        build = @{
            dependsOn = @("^build")
            outputs = @(".next/**", "dist/**")
        }
        dev = @{
            cache = $false
            persistent = $true
        }
        lint = @{}
        test = @{}
    }
}

$turboJson | ConvertTo-Json -Depth 10 | Set-Content -Path "turbo.json"
Write-Host "✅ turbo.json créé" -ForegroundColor Green

# Créer .env
Write-Host "`n🔐 Création du fichier .env..." -ForegroundColor Yellow

$envContent = @"
# Base de données
DATABASE_URL="postgresql://bygagoos:bygagoos2024@localhost:5432/trans_bygagoos"

# JWT
JWT_SECRET="dev_secret_change_in_production_kgs8472jf"
JWT_EXPIRATION="24h"

# API
API_PORT=3000
CORS_ORIGINS="http://localhost:5173,http://localhost:5174,http://localhost:3000"

# Redis (optionnel pour le dev)
REDIS_URL="redis://localhost:6379"

# Upload
UPLOADS_PATH="D:/Trans-ByGagoos/uploads"
MAX_FILE_SIZE=5242880

# Firebase (optionnel pour le dev)
FIREBASE_PROJECT_ID="trans-bygagoos-dev"
"@

$envContent | Set-Content -Path ".env"
Write-Host "✅ .env créé" -ForegroundColor Green

# Créer .gitignore
Write-Host "`n📝 Création du .gitignore..." -ForegroundColor Yellow

$gitignore = @"
node_modules/
dist/
.turbo/
.env
.env.local
*.log
uploads/*
!uploads/.gitkeep
coverage/
.nyc_output/
"@

$gitignore | Set-Content -Path ".gitignore"
Write-Host "✅ .gitignore créé" -ForegroundColor Green

Write-Host "`n✨ Initialisation terminée !" -ForegroundColor Green
Write-Host "`n📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "1. npm install" -ForegroundColor White
Write-Host "2. npm run db:migrate" -ForegroundColor White
Write-Host "3. npm run dev" -ForegroundColor White
Write-Host "`n💡 Utilisez Ctrl+Shift+P -> 'Tasks: Run Task' dans VS Code pour plus d'options" -ForegroundColor Gray