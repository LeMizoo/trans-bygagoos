#!/bin/bash
echo "=== AUDIT TRANS-BY-GAGOOS ==="
echo "Date: $(date)"
echo ""

echo "📁 Structure du projet:"
find . -type f -not -path "*/venv/*" -not -path "*/node_modules/*" -not -path "*/.git/*" | sort

echo ""
echo "📄 Fichiers de configuration:"
cat config/settings.py 2>/dev/null || echo "Pas de fichier config"

echo ""
echo "🐍 Dépendances Python:"
cat requirements.txt 2>/dev/null || echo "Pas de requirements.txt"

echo ""
echo "📦 Dépendances Node.js:"
cat package.json 2>/dev/null || echo "Pas de package.json"

echo ""
echo "🔍 Analyse du code backend:"
for file in $(find backend -name "*.py" -not -path "*/venv/*"); do
    echo "--- $file ---"
    wc -l "$file"
    grep "^def \|^class " "$file"
done

echo ""
echo "📈 Statistiques du projet:"
echo "Fichiers Python: $(find . -name "*.py" -not -path "*/venv/*" | wc -l)"
echo "Fichiers JS: $(find . -name "*.js" -not -path "*/node_modules/*" | wc -l)"
echo "Lignes de code: $(find . -name "*.py" -not -path "*/venv/*" -exec cat {} \; | wc -l)"
