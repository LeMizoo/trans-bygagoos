#!/bin/bash

echo "🧪 Test de connexion mobile"
echo "============================"

# Test chauffeur
echo ""
echo "🚗 Test connexion chauffeur :"
curl -X POST http://localhost:3000/auth/chauffeur/login \
  -H "Content-Type: application/json" \
  -d '{
    "codeAcces": "BYG-CH001",
    "pin": "1234"
  }' | json_pp

echo ""
echo "📦 Test connexion livreur :"
curl -X POST http://localhost:3000/auth/livreur/login \
  -H "Content-Type: application/json" \
  -d '{
    "codeAcces": "BYG-LV001",
    "pin": "4321"
  }' | json_pp

echo ""
echo "❌ Test avec mauvais PIN :"
curl -X POST http://localhost:3000/auth/chauffeur/login \
  -H "Content-Type: application/json" \
  -d '{
    "codeAcces": "BYG-CH001",
    "pin": "9999"
  }' | json_pp

echo ""
echo "✅ Tests terminés !"
