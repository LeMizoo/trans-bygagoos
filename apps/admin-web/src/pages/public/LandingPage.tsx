import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bike, Users, BarChart3, Shield, ArrowRight, Menu, X, 
  ChevronLeft, ChevronRight, Bus, Car, CheckCircle, DollarSign, Package, Truck
} from 'lucide-react';

const slides = [
  { image: '/assets/photos/flotte-01.png', title: '🏍️ Ny asa tsy mba vintana, fa fitsirihana', subtitle: 'Le succès dépend de votre persévérance. Créez votre flotte dès maintenant.', cta: 'Créer ma flotte' },
  { image: '/assets/photos/flotte-02.png', title: '🛺 Aleo very tsiky toy izay very hiky', subtitle: 'Protégez votre activité avec Trans ByGagoos. Gratuit au démarrage.', cta: 'Créer ma flotte' },
  { image: '/assets/photos/flotte-03.png', title: '🚗 Votre flotte, votre fierté', subtitle: 'Rejoignez les 50+ flottes qui nous font confiance.', cta: 'Créer ma flotte' },
  { image: '/assets/photos/flotte-motos.jpg', title: 'Mieux vaut être seul que mal accompagné', subtitle: 'Gérez motos, voitures et bus en un seul endroit.', cta: 'Découvrir' },
  { image: '/assets/photos/yamaha-cygnus.jpg', title: 'Yamaha Cygnus C1 ByGagoos', subtitle: 'La moto idéale pour vos chauffeurs', cta: 'Découvrir' },
  { image: '/assets/photos/taxi-motos.jpg', title: 'Ny fianarana no lova tsara indrindra', subtitle: 'Gérez votre flotte avec intelligence.', cta: 'Rejoindre' },
];

export const LandingPage = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  const plans = [
    { nom: 'Gratuit', motos: '1 véhicule', prix: '0 Ar/mois', prixAnnuel: 'Gratuit', icon: '🆓', desc: 'Pour démarrer', features: ['Suivi de base', '1 chauffeur', 'Support email'] },
    { nom: 'Standard', motos: '2-5 véhicules', prix: '15 000 Ar/mois', prixAnnuel: '155 000 Ar/an', icon: '🥈', desc: 'Petite flotte', features: ['Suivi avancé', '5 chauffeurs', 'Support prioritaire', 'Statistiques'] },
    { nom: 'Premium', motos: '6-10 véhicules', prix: '25 000 Ar/mois', prixAnnuel: '265 000 Ar/an', icon: '🥇', desc: 'Flotte moyenne', features: ['Suivi complet', '10 chauffeurs', 'Support VIP', 'Analyses détaillées', 'Sans commission'] },
    { nom: 'Business', motos: '11+ véhicules', prix: '35 000 Ar/mois', prixAnnuel: '375 000 Ar/an', icon: '💎', desc: 'Grande flotte', features: ['Illimité', 'Support dédié', 'Dashboard personnalisé', 'API', 'Sans commission'] },
  ];

  const scrollToPricing = () => document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fade-in-left { animation: fadeInLeft 0.8s ease-out forwards; }
        .animate-fade-in-right { animation: fadeInRight 0.8s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.6s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        .hover-scale { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .hover-scale:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 25px 50px rgba(0,0,0,0.15); }
      `}</style>

      <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/60 to-transparent backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <a href="/" className="flex items-center gap-3">
              <img src="/assets/logo/b-trans.png" alt="Trans ByGagoos" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-white drop-shadow-lg">Trans ByGagoos</span>
            </a>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-white/80 hover:text-white drop-shadow transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-white/80 hover:text-white drop-shadow transition-colors">Tarifs</a>
              <button onClick={() => navigate('/login')} className="text-white/80 hover:text-white font-medium drop-shadow transition-colors">Connexion</button>
              <button onClick={() => navigate('/register')} className="bg-white text-indigo-600 px-5 py-2 rounded-xl font-medium hover:bg-white/90 transition-all shadow-lg hover-scale">Créer ma flotte</button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-white">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/80 backdrop-blur-sm px-4 py-4 space-y-3">
            <a href="#features" className="block text-white py-2">Fonctionnalités</a>
            <a href="#pricing" className="block text-white py-2">Tarifs</a>
            <button onClick={() => navigate('/login')} className="block w-full text-left text-white py-2">Connexion</button>
            <button onClick={() => navigate('/register')} className="block w-full bg-indigo-600 text-white text-center py-3 rounded-xl font-medium">Créer ma flotte</button>
          </div>
        )}
      </nav>

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
              <div className={`inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                🚀 {slides[currentSlide].cta}
              </div>
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 animate-fade-in-left delay-100 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                {slides[currentSlide].title}
              </h1>
              <p className={`text-lg text-white/80 leading-relaxed mb-10 max-w-xl animate-fade-in-right delay-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                {slides[currentSlide].subtitle}
              </p>
              <div className={`flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                <button onClick={() => navigate('/register')} className="bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-500/25 flex items-center justify-center gap-2 hover-scale">
                  Créer ma flotte gratuitement <ArrowRight size={20} />
                </button>
                <button onClick={scrollToPricing} className="border-2 border-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm">
                  Voir les tarifs
                </button>
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

      <section id="pricing" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl font-bold text-gray-900">Nos tarifs</h2>
            <p className="mt-4 text-xl text-gray-600">Choisissez le plan qui correspond à votre flotte</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <div key={i} className={`card-hover rounded-2xl border-2 ${plan.nom === 'Business' ? 'border-amber-300 bg-indigo-50/50' : 'border-gray-200 bg-white'} p-6 text-center`}>
                <span className="text-4xl">{plan.icon}</span>
                <h3 className="text-xl font-bold mt-3">{plan.nom}</h3>
                <p className="text-sm text-gray-500">{plan.motos}</p>
                <p className="text-2xl font-extrabold text-indigo-600 mt-4">{plan.prix}</p>
                <p className="text-sm text-green-600">{plan.prixAnnuel}</p>
                <p className="text-xs text-gray-400 mt-2">{plan.desc}</p>
                <ul className="mt-4 space-y-1 text-left text-sm">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-gray-600">
                      <CheckCircle className="h-4 w-4 text-indigo-500 mr-2 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate('/register')} className={`mt-4 w-full py-3 rounded-xl font-medium transition-all hover-scale ${plan.nom === 'Gratuit' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}>
                  {plan.nom === 'Gratuit' ? 'Démarrer' : 'Choisir'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-3 mb-4 md:mb-0">
              <img src="/assets/logo/b-trans.png" alt="Trans ByGagoos" className="w-8 h-8 object-contain" />
              <span className="text-white font-bold">Trans ByGagoos</span>
            </div>
            <div className="flex gap-6 text-sm">
              <a href="#" className="hover:text-white transition-colors">À propos</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
              <a href="#" className="hover:text-white transition-colors">Conditions</a>
              <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-800 text-center text-sm">© 2026 Trans ByGagoos - Ensemble pour la famille Gagoos ❤️</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
