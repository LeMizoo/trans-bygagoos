// API URL
const API_URL = '/ByGagoos-Trans/backoffice/api/';

// État de l'application
let currentToken = null;
let currentChauffeur = null;
let currentPage = 'accueil';

// Page au chargement
document.addEventListener('DOMContentLoaded', () => {
    // Vérifier si déjà connecté
    const savedToken = localStorage.getItem('chauffeur_token');
    const savedChauffeur = localStorage.getItem('chauffeur_data');
    
    if (savedToken && savedChauffeur) {
        currentToken = savedToken;
        currentChauffeur = JSON.parse(savedChauffeur);
        chargerPage('accueil');
    } else {
        chargerPage('login');
    }
});

// Navigation entre pages
function chargerPage(page) {
    currentPage = page;
    const container = document.getElementById('app');
    
    switch(page) {
        case 'login':
            afficherLogin(container);
            break;
        case 'accueil':
            afficherAccueil(container);
            break;
        case 'courses':
            afficherCourses(container);
            break;
        case 'stats':
            afficherStats(container);
            break;
    }
    
    // Mettre à jour la navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.page === page) {
            btn.classList.add('active');
        }
    });
}

// Page de connexion
function afficherLogin(container) {
    container.innerHTML = `
        <div class="login-card">
            <div class="header">
                <img src="../b-trans.png" alt="ByGagoos-Trans" class="logo">
                <h1>ByGagoos-Trans</h1>
                <p>Application Chauffeur</p>
            </div>
            <div class="card">
                <h3>Connexion</h3>
                <input type="text" id="code" class="code-input" placeholder="CODE" maxlength="4">
                <button class="btn" onclick="connexion()">Se connecter</button>
            </div>
        </div>
    `;
}

// Connexion API
async function connexion() {
    const code = document.getElementById('code').value;
    
    if (!code || code.length < 4) {
        afficherMessage('Veuillez entrer votre code à 4 chiffres', 'error');
        return;
    }
    
    try {
        const response = await fetch(API_URL + 'login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code: code })
        });
        
        const data = await response.json();
        
        if (data.success) {
            currentToken = data.token;
            currentChauffeur = data.chauffeur;
            localStorage.setItem('chauffeur_token', currentToken);
            localStorage.setItem('chauffeur_data', JSON.stringify(currentChauffeur));
            chargerPage('accueil');
        } else {
            afficherMessage(data.message, 'error');
        }
    } catch (error) {
        afficherMessage('Erreur de connexion', 'error');
    }
}

// Page d'accueil
async function afficherAccueil(container) {
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    try {
        const response = await fetch(API_URL + 'stats.php', {
            headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        const data = await response.json();
        
        if (!data.success) {
            deconnexion();
            return;
        }
        
        container.innerHTML = `
            <div class="header">
                <img src="../b-trans.png" alt="ByGagoos-Trans" class="logo">
                <h1>Bonjour, ${currentChauffeur.nom}</h1>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="value">${data.today.nb}</div>
                    <div class="label">Courses Aujourd'hui</div>
                </div>
                <div class="stat-card">
                    <div class="value">${data.today.total.toLocaleString()} Ar</div>
                    <div class="label">Gains Aujourd'hui</div>
                </div>
                <div class="stat-card">
                    <div class="value">${data.week.total.toLocaleString()} Ar</div>
                    <div class="label">Gains Semaine</div>
                </div>
            </div>
            
            <div class="card">
                <h3>📝 Enregistrer une course</h3>
                <div class="form-group">
                    <label>Distance (km)</label>
                    <input type="number" id="distance" step="0.1" placeholder="Ex: 5.5">
                </div>
                <button class="btn" onclick="enregistrerCourse()">💰 Enregistrer</button>
            </div>
            
            <button class="logout-btn" onclick="deconnexion()">🔓 Déconnexion</button>
        `;
    } catch (error) {
        afficherMessage('Erreur de chargement', 'error');
    }
}

// Enregistrer une course
async function enregistrerCourse() {
    const distance = document.getElementById('distance').value;
    
    if (!distance || distance <= 0) {
        afficherMessage('Entrez une distance valide', 'error');
        return;
    }
    
    try {
        const response = await fetch(API_URL + 'courses.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + currentToken
            },
            body: JSON.stringify({ distance: parseFloat(distance) })
        });
        
        const data = await response.json();
        
        if (data.success) {
            afficherMessage(`Course enregistrée - ${data.course.prix.toLocaleString()} Ar`, 'success');
            document.getElementById('distance').value = '';
            // Recharger les stats
            setTimeout(() => chargerPage('accueil'), 1000);
        } else {
            afficherMessage(data.message, 'error');
        }
    } catch (error) {
        afficherMessage('Erreur d\'enregistrement', 'error');
    }
}

// Page des courses
async function afficherCourses(container) {
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    try {
        const response = await fetch(API_URL + 'courses.php', {
            headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        const data = await response.json();
        
        if (!data.success) {
            deconnexion();
            return;
        }
        
        let coursesHtml = '<div class="header"><h1>📋 Mes courses</h1></div>';
        
        if (data.courses.length === 0) {
            coursesHtml += '<div class="card"><p>Aucune course enregistrée</p></div>';
        } else {
            coursesHtml += '<div class="card">';
            data.courses.forEach(course => {
                coursesHtml += `
                    <div class="course-item">
                        <div>
                            <div class="course-date">${new Date(course.date_course).toLocaleString()}</div>
                            <div class="course-distance">${course.distance_km} km - ${course.immatriculation}</div>
                        </div>
                        <div class="course-price">${course.prix.toLocaleString()} Ar</div>
                    </div>
                `;
            });
            coursesHtml += '</div>';
        }
        
        container.innerHTML = coursesHtml;
    } catch (error) {
        afficherMessage('Erreur de chargement', 'error');
    }
}

// Page des statistiques
async function afficherStats(container) {
    container.innerHTML = '<div class="loading">Chargement...</div>';
    
    try {
        const response = await fetch(API_URL + 'stats.php', {
            headers: { 'Authorization': 'Bearer ' + currentToken }
        });
        const data = await response.json();
        
        if (!data.success) {
            deconnexion();
            return;
        }
        
        container.innerHTML = `
            <div class="header">
                <h1>📊 Mes Statistiques</h1>
            </div>
            
            <div class="card">
                <h3>Aujourd'hui</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="value">${data.today.nb}</div>
                        <div class="label">Courses</div>
                    </div>
                    <div class="stat-card">
                        <div class="value">${data.today.total.toLocaleString()} Ar</div>
                        <div class="label">Gains</div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3>Cette semaine</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="value">${data.week.nb}</div>
                        <div class="label">Courses</div>
                    </div>
                    <div class="stat-card">
                        <div class="value">${data.week.total.toLocaleString()} Ar</div>
                        <div class="label">Gains</div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3>Ce mois</h3>
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="value">${data.month.nb}</div>
                        <div class="label">Courses</div>
                    </div>
                    <div class="stat-card">
                        <div class="value">${data.month.total.toLocaleString()} Ar</div>
                        <div class="label">Gains</div>
                    </div>
                </div>
            </div>
        `;
    } catch (error) {
        afficherMessage('Erreur de chargement', 'error');
    }
}

// Déconnexion
function deconnexion() {
    localStorage.removeItem('chauffeur_token');
    localStorage.removeItem('chauffeur_data');
    currentToken = null;
    currentChauffeur = null;
    chargerPage('login');
}

// Afficher un message temporaire
function afficherMessage(msg, type) {
    const container = document.getElementById('app');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${type}`;
    msgDiv.innerHTML = msg;
    container.insertBefore(msgDiv, container.firstChild);
    
    setTimeout(() => msgDiv.remove(), 3000);
}