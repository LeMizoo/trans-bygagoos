import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bike, Users, BarChart3, Shield, ArrowRight, Menu, X, ChevronLeft, ChevronRight, Package, Globe, Smartphone, ChevronDown } from 'lucide-react';

const slides = [
  { image: '/assets/photos/flotte-01.png', title: '🏍️ Ny asa tsy mba vintana, fa fitsirihana', subtitle: 'Le succès dépend de votre persévérance.' },
  { image: '/assets/photos/flotte-02.png', title: '🛺 Aleo very tsiky toy izay very hiky', subtitle: 'Protégez votre activité avec Trans ByGagoos.' },
  { image: '/assets/photos/flotte-03.png', title: '🚗 Votre flotte, votre fierté', subtitle: 'Rejoignez les 50+ flottes qui nous font confiance.' },
  { image: '/assets/photos/flotte-motos.jpg', title: '🏍️ Mieux vaut être seul que mal accompagné', subtitle: 'Gérez motos, voitures et bus en un seul endroit.' },
  { image: '/assets/photos/yamaha-cygnus.jpg', title: 'Yamaha Cygnus C1 ByGagoos', subtitle: 'La moto idéale pour vos chauffeurs.' },
  { image: '/assets/photos/taxi-motos.jpg', title: '🚕 Ny fianarana no lova tsara indrindra', subtitle: 'Le savoir est le meilleur héritage.' },
];

const apps = [
  { icon: Globe, title: 'Trans ByGagoos', desc: 'Supervisez toutes les flottes et coopératives', url: '/login', color: 'bg-indigo-500' },
  { icon: Bike, title: 'Ma Flotte ByGagoos', desc: 'Gérez votre flotte de taxi-motos et chauffeurs', url: 'https://trans-bygagoos-flotte.netlify.app/login', color: 'bg-orange-500' },
  { icon: Package, title: 'Coop Express ByGagoos', desc: 'Livraison de nourriture, colis, électroménager', url: 'https://trans-bygagoos-coop.netlify.app/login', color: 'bg-green-500' },
  { icon: Smartphone, title: 'Livreur ByGagoos', desc: 'Application mobile pour les livreurs', url: 'https://trans-bygagoos-pwa.netlify.app/login', color: 'bg-purple-500' },
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loginMenuOpen, setLoginMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .hover-scale:hover { transform: translateY(-4px); }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 25px 50px rgba(0,0,0,0.15); }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <a href="/" className="flex items-center gap-3">
              <img src="/assets/logo/b-trans.png" alt="Logo" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-white">Trans ByGagoos</span>
            </a>
            <div className="hidden md:flex items-center gap-6">
              <a href="#apps" className="text-white/80 hover:text-white transition-colors">Applications</a>
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Fonctionnalités</a>
              
              {/* Menu Connexion déroulant */}
              <div className="relative">
                <button 
                  onClick={() => setLoginMenuOpen(!loginMenuOpen)}
                  className="text-white/80 hover:text-white transition-colors flex items-center gap-1"
                >
                  Connexion <ChevronDown size={16} />
                </button>
                {loginMenuOpen && (
                  <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-xl py-2 min-w-[200px] z-50">
                    <a href="/login" className="block px-4 py-2 text-gray-700 hover:bg-indigo-50 text-sm">🔷 Admin / Super Admin</a>
                    <a href="https://trans-bygagoos-flotte.netlify.app/login" className="block px-4 py-2 text-gray-700 hover:bg-orange-50 text-sm">🏍️ Gérant Flotte</a>
                    <a href="https://trans-bygagoos-coop.netlify.app/login" className="block px-4 py-2 text-gray-700 hover:bg-green-50 text-sm">📦 Gérant Coop</a>
                    <a href="https://trans-bygagoos-pwa.netlify.app/login" className="block px-4 py-2 text-gray-700 hover:bg-purple-50 text-sm">📱 Livreur</a>
                  </div>
                )}
              </div>
              
              <button onClick={() => navigate('/register')} className="bg-white text-indigo-600 px-5 py-2 rounded-xl font-medium hover:bg-white/90 transition-all hover-scale">Inscription</button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-white">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/80 backdrop-blur-sm px-4 py-4 space-y-3">
            <a href="#apps" className="block text-white py-2">Applications</a>
            <a href="#features" className="block text-white py-2">Fonctionnalités</a>
            <a href="/login" className="block text-white py-2">🔷 Connexion Admin</a>
            <a href="https://trans-bygagoos-flotte.netlify.app/login" className="block text-white py-2">🏍️ Connexion Flotte</a>
            <a href="https://trans-bygagoos-coop.netlify.app/login" className="block text-white py-2">📦 Connexion Coop</a>
            <a href="https://trans-bygagoos-pwa.netlify.app/login" className="block text-white py-2">📱 Connexion Livreur</a>
            <button onClick={() => navigate('/register')} className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl font-medium">Inscription</button>
          </div>
        )}
      </nav>

      {/* Hero Slider */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <img src={slide.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            </div>
          ))}
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-6 animate-fade-in-up">{slides[currentSlide].title}</h1>
              <p className="text-lg text-white/80 mb-10 animate-fade-in-up">{slides[currentSlide].subtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up">
                <button onClick={() => navigate('/register')} className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 hover-scale flex items-center justify-center gap-2">
                  Commencer gratuitement <ArrowRight size={20} />
                </button>
                <a href="#apps" className="border-2 border-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 text-center">Nos applications</a>
              </div>
            </div>
          </div>
        </div>
        <button onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full"><ChevronLeft size={24} /></button>
        <button onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full"><ChevronRight size={24} /></button>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3">
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} className={`h-2.5 rounded-full transition-all ${i === currentSlide ? 'bg-indigo-500 w-10' : 'bg-white/30 w-2.5'}`} />
          ))}
        </div>
      </section>

      {/* Apps Section */}
      <section id="apps" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Applications</h2>
          <p className="text-xl text-gray-600 mb-16">Choisissez votre espace</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {apps.map((app, i) => (
              <a key={i} href={app.url} className="card-hover bg-white rounded-2xl border p-6 text-center hover:shadow-xl transition-all">
                <div className={`w-14 h-14 ${app.color} rounded-xl flex items-center justify-center mx-auto mb-4`}><app.icon size={28} className="text-white" /></div>
                <h3 className="text-lg font-bold mb-2">{app.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{app.desc}</p>
                <span className="text-indigo-600 font-medium text-sm">Se connecter →</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Pourquoi Trans ByGagoos ?</h2>
          <p className="text-xl text-gray-600 mb-16">La solution complète pour gérer votre flotte à Madagascar</p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Bike, title: 'Tous véhicules', desc: 'Motos, voitures, camionnettes.' },
              { icon: Users, title: 'Chauffeurs & Livreurs', desc: 'Créez des comptes, suivez les performances.' },
              { icon: BarChart3, title: 'Dashboard complet', desc: 'Revenus, dépenses, statistiques en temps réel.' },
              { icon: Package, title: 'Livraisons', desc: 'Commandes, assignation automatique, suivi en direct.' },
              { icon: Shield, title: 'Sécurisé', desc: 'Données protégées, accès sécurisé par rôle.' },
              { icon: Smartphone, title: 'Mobile First', desc: 'App PWA pour les livreurs, utilisable partout.' },
            ].map((f, i) => (
              <div key={i} className="card-hover bg-gray-50 p-6 rounded-2xl border transition-all">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4"><f.icon size={24} className="text-indigo-600" /></div>
                <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-600 text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Prêt à lancer votre flotte ?</h2>
        <p className="text-xl text-indigo-100 mb-8">Rejoignez Trans ByGagoos et commencez gratuitement.</p>
        <button onClick={() => navigate('/register')} className="inline-flex items-center px-8 py-4 text-lg font-medium text-indigo-600 bg-white rounded-xl hover:bg-gray-100">Commencer gratuitement <ArrowRight className="ml-2" /></button>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center">
        <p>© 2026 Trans ByGagoos - Ensemble pour la famille Gagoos ❤️</p>
      </footer>
    </div>
  );
};

export default LandingPage;
