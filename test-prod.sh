#!/bin/bash

echo "🌐 Test de connexion en production"
echo "===================================="

# Test chauffeur sur Render
echo ""
echo "🚗 Test connexion chauffeur (Production) :"
curl -X POST https://trans-bygagoos-api.onrender.com/auth/chauffeur/login \
  -H "Content-Type: application/json" \
  -d '{
    "codeAcces": "BYG-CH001",
    "pin": "1234"
  }' | json_pp

echo ""
echo "✅ Test production terminé !"
