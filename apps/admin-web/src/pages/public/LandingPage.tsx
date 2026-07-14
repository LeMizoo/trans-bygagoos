import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bike, Users, BarChart3, Shield, ArrowRight, Menu, X,
  ChevronLeft, ChevronRight, Car, CheckCircle, Package, Truck,
  Globe, Smartphone, Building2
} from 'lucide-react';

const slides = [
  { image: '/assets/photos/flotte-01.png', title: '🏍️ Ny asa tsy mba vintana, fa fitsirihana', subtitle: 'Le succès dépend de votre persévérance. Créez votre flotte dès maintenant.' },
  { image: '/assets/photos/flotte-02.png', title: '🛺 Aleo very tsiky toy izay very hiky', subtitle: 'Protégez votre activité avec Trans ByGagoos. Gratuit au démarrage.' },
  { image: '/assets/photos/flotte-03.png', title: '🚗 Votre flotte, votre fierté', subtitle: 'Rejoignez les 50+ flottes qui nous font confiance.' },
  { image: '/assets/photos/flotte-motos.jpg', title: '🏍️ Mieux vaut être seul que mal accompagné', subtitle: 'Gérez motos, voitures et bus en un seul endroit.' },
  { image: '/assets/photos/yamaha-cygnus.jpg', title: 'Yamaha Cygnus C1 ByGagoos', subtitle: 'La moto idéale pour vos chauffeurs' },
  { image: '/assets/photos/taxi-motos.jpg', title: '🚕 Ny fianarana no lova tsara indrindra', subtitle: 'Le savoir est le meilleur héritage. Gérez avec intelligence.' },
];

const apps = [
  { icon: Globe, title: 'Trans ByGagoos', desc: 'Supervisez toutes les flottes et coopératives', url: 'https://trans-bygagoos.netlify.app', color: 'bg-indigo-500' },
  { icon: Bike, title: 'Ma Flotte ByGagoos', desc: 'Gérez votre flotte de taxi-motos et chauffeurs', url: 'https://trans-bygagoos-flotte.netlify.app', color: 'bg-orange-500' },
  { icon: Package, title: 'Coop Express ByGagoos', desc: 'Livraison de nourriture, colis, électroménager', url: 'https://trans-bygagoos-coop.netlify.app', color: 'bg-green-500' },
  { icon: Smartphone, title: 'Livreur ByGagoos', desc: 'Application mobile pour les livreurs', url: 'https://trans-bygagoos-pwa.netlify.app', color: 'bg-purple-500' },
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        .hover-scale { transition: transform 0.3s ease; }
        .hover-scale:hover { transform: translateY(-4px); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 25px 50px rgba(0,0,0,0.15); }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <a href="/" className="flex items-center gap-3">
              <img src="/assets/logo/b-trans.png" alt="Trans ByGagoos" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-white drop-shadow-lg">Trans ByGagoos</span>
            </a>
            <div className="hidden md:flex items-center gap-6">
              <a href="#apps" className="text-white/80 hover:text-white transition-colors">Applications</a>
              <a href="#features" className="text-white/80 hover:text-white transition-colors">Fonctionnalités</a>
              <button onClick={() => navigate('/login')} className="text-white/80 hover:text-white font-medium transition-colors">Connexion</button>
              <button onClick={() => navigate('/register')} className="bg-white text-indigo-600 px-5 py-2 rounded-xl font-medium hover:bg-white/90 transition-all shadow-lg hover-scale">Inscription</button>
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
            <button onClick={() => navigate('/login')} className="block w-full text-left text-white py-2">Connexion</button>
            <button onClick={() => navigate('/register')} className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl font-medium">Inscription</button>
          </div>
        )}
      </nav>

      {/* Hero Slider */}
      <section className="relative h-screen">
        <div className="absolute inset-0">
          {slides.map((slide, index) => (
            <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
              <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            </div>
          ))}
        </div>
        <div className="relative z-10 h-full flex items-center">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 animate-fade-in-up delay-100">
                {slides[currentSlide].title}
              </h1>
              <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-xl animate-fade-in-up delay-200">
                {slides[currentSlide].subtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300">
                <button onClick={() => navigate('/register')} className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 hover-scale">
                  Commencer gratuitement <ArrowRight size={20} />
                </button>
                <a href="#apps" className="border-2 border-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm text-center">
                  Nos applications
                </a>
              </div>
            </div>
          </div>
        </div>
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"><ChevronLeft size={24} /></button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"><ChevronRight size={24} /></button>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)} className={`h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-indigo-500 w-10' : 'bg-white/30 hover:bg-white/50 w-2.5'}`} />
          ))}
        </div>
      </section>

      {/* Applications Section */}
      <section id="apps" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-gray-900">Nos Applications</h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Trans ByGagoos propose 4 applications adaptées à chaque besoin
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {apps.map((app, i) => (
              <a key={i} href={app.url} target="_blank" rel="noopener noreferrer" className="card-hover bg-white rounded-2xl border border-gray-200 p-6 text-center hover:shadow-xl group">
                <div className={`w-14 h-14 ${app.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <app.icon size={28} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{app.title}</h3>
                <p className="text-gray-500 text-sm mb-4">{app.desc}</p>
                <span className="inline-flex items-center gap-1 text-indigo-600 font-medium text-sm group-hover:gap-2 transition-all">
                  Commencer gratuitement <ArrowRight size={14} />
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-fade-in-up">
            <h2 className="text-3xl font-bold text-gray-900">Pourquoi Trans ByGagoos ?</h2>
            <p className="mt-4 text-xl text-gray-600">La solution complète pour gérer votre flotte à Madagascar</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: Bike, title: 'Tous véhicules', desc: 'Motos, voitures, camionnettes : gérez tout type de transport.' },
              { icon: Users, title: 'Chauffeurs & Livreurs', desc: 'Créez des comptes, suivez les performances et les pointages.' },
              { icon: BarChart3, title: 'Dashboard complet', desc: 'Revenus, dépenses, statistiques en temps réel.' },
              { icon: Package, title: 'Livraisons', desc: 'Commandes, assignation automatique, suivi en direct.' },
              { icon: Shield, title: 'Sécurisé', desc: 'Données protégées, accès sécurisé par rôle.' },
              { icon: Smartphone, title: 'Mobile First', desc: 'App PWA pour les livreurs, utilisable partout.' },
            ].map((f, i) => (
              <div key={i} className="card-hover bg-gray-50 p-6 rounded-2xl border border-gray-100 text-center">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <f.icon size={24} className="text-indigo-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-indigo-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white">Prêt à lancer votre flotte ?</h2>
          <p className="mt-4 text-xl text-indigo-100">Rejoignez Trans ByGagoos et commencez gratuitement.</p>
          <button onClick={() => navigate('/register')} className="mt-8 inline-flex items-center px-8 py-4 text-lg font-medium text-indigo-600 bg-white rounded-xl hover:bg-gray-100 transition-all shadow-xl hover:shadow-2xl">
            Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img src="/assets/logo/b-trans.png" alt="Trans ByGagoos" className="w-8 h-8 object-contain" />
              <span className="text-white font-bold">Trans ByGagoos</span>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#apps" className="hover:text-white transition-colors">Applications</a>
              <a href="#features" className="hover:text-white transition-colors">Fonctionnalités</a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 text-center text-sm">
            © 2026 Trans ByGagoos - Ensemble pour la famille Gagoos ❤️
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
