import { useNavigate } from 'react-router-dom';
import { Bike, Users, BarChart3, Shield, ArrowRight, Menu, X, ChevronLeft, ChevronRight, Bus, Car } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = 'https://trans-bygagoos-api.onrender.com/api/v1';

const slides = [
];

export function LandingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedType, setSelectedType] = useState("TAXI_MOTO");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const { data: pricing = {} } = useQuery({
    queryKey: ['pricing-landing'],
    queryFn: () => axios.get(`${API}/parametres`).then(r => r.data),
    staleTime: 30000,
  });

  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  const formatPrix = (val: string) => parseInt(val || '0').toLocaleString() + ' Ar/mois';
  const formatAnnuel = (val: string, reduc: string) => {
    const mensuel = parseInt(val || '0');
    const reduction = parseInt(reduc || '0');
    const annuel = Math.round(mensuel * 12 * (1 - reduction / 100));
    return annuel.toLocaleString() + ' Ar/an';
  };

  const p = pricing || {};
  const prix2_5 = p.abonnement_2_5_prix_mensuel || '50000';
  const prix6_10 = p.abonnement_6_10_prix_mensuel || '90000';
  const prix11 = p.abonnement_11_plus_prix_mensuel || '150000';
  const reduc = p.reduction_annuelle_pourcent || '7';

  const planPrices: Record<string, { standard: string; premium: string; business: string }> = {
    TAXI_MOTO: { standard: prix2_5, premium: prix6_10, business: prix11 },
    TAXI_BE: { standard: pricing.abonnement_taxibe_2_5_prix_mensuel || '75000', premium: pricing.abonnement_taxibe_6_10_prix_mensuel || '120000', business: pricing.abonnement_taxibe_11_plus_prix_mensuel || '200000' },
    TAXI: { standard: pricing.abonnement_taxi_2_5_prix_mensuel || '100000', premium: pricing.abonnement_taxi_6_10_prix_mensuel || '180000', business: pricing.abonnement_taxi_11_plus_prix_mensuel || '300000' },
  };
  const pp = planPrices[selectedType];
  const vLabel = selectedType === 'TAXI_MOTO' ? 'moto' : selectedType === 'TAXI_BE' ? 'véhicule' : 'voiture';
  const plans = [
    { nom: 'Gratuit', motos: '1 ' + vLabel, prix: '0 Ar/mois', prixAnnuel: 'Gratuit', icon: '🆓', desc: 'Pour démarrer', abo: 'GRATUIT' },
    { nom: 'Standard', motos: '2-5 ' + vLabel + 's', prix: formatPrix(pp.standard), prixAnnuel: formatAnnuel(pp.standard, reduc), icon: '🥈', desc: 'Petite flotte', reduction: '-' + reduc + '%', abo: '2_5' },
    { nom: 'Premium', motos: '6-10 ' + vLabel + 's', prix: formatPrix(pp.premium), prixAnnuel: formatAnnuel(pp.premium, reduc), icon: '🥇', desc: 'Flotte moyenne', reduction: '-' + reduc + '%', abo: '6_10' },
    { nom: 'Business', motos: '11+ ' + vLabel + 's', prix: formatPrix(pp.business), prixAnnuel: formatAnnuel(pp.business, reduc), icon: '💎', desc: 'Grande flotte', reduction: '-' + reduc + '%', abo: '11_PLUS' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeInLeft { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeInRight { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(50px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-fade-in-left { animation: fadeInLeft 0.8s ease-out forwards; }
        .animate-fade-in-right { animation: fadeInRight 0.8s ease-out forwards; }
        .animate-scale-in { animation: scaleIn 0.6s ease-out forwards; }
        .animate-slide-up { animation: slideUp 0.8s ease-out forwards; }
        .delay-100 { animation-delay: 0.1s; opacity: 0; }
        .delay-200 { animation-delay: 0.2s; opacity: 0; }
        .delay-300 { animation-delay: 0.3s; opacity: 0; }
        .delay-400 { animation-delay: 0.4s; opacity: 0; }
        .delay-500 { animation-delay: 0.5s; opacity: 0; }
        .hover-scale { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .hover-scale:hover { transform: translateY(-4px) scale(1.02); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
        .card-hover { transition: all 0.3s ease; }
        .card-hover:hover { transform: translateY(-5px); box-shadow: 0 25px 50px rgba(0,0,0,0.15); }
      `}</style>

      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent animate-fade-in-down">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <a href="/" className="flex items-center gap-3">
              <img src="/assets/logo/b-trans.png" alt="Trans ByGagoos" className="w-10 h-10 object-contain animate-scale-in" />
              <span className="text-xl font-bold text-white drop-shadow-lg">Trans ByGagoos</span>
            </a>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-white/80 hover:text-white drop-shadow transition-colors">Fonctionnalités</a>
              <a href="#pricing" className="text-white/80 hover:text-white drop-shadow transition-colors">Tarifs</a>
              <button onClick={() => window.location.href = 'https://trans-bygagoos-flotte.netlify.app/login'} className="text-white/80 hover:text-white font-medium drop-shadow transition-colors">Connexion</button>
              <button onClick={() => window.location.href = 'https://trans-bygagoos.netlify.app/register'} className="bg-white text-primary px-5 py-2 rounded-xl font-medium hover:bg-white/90 transition-all shadow-lg hover-scale">Créer ma flotte</button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-white">{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/80 backdrop-blur-sm px-4 py-4 space-y-3 animate-fade-in-down">
            <a href="#features" className="block text-white py-2">Fonctionnalités</a>
            <a href="#pricing" className="block text-white py-2">Tarifs</a>
            <button onClick={() => window.location.href = 'https://trans-bygagoos-flotte.netlify.app/login'} className="block w-full text-left text-white py-2">Connexion</button>
            <button onClick={() => window.location.href = 'https://trans-bygagoos.netlify.app/register'} className="block w-full bg-primary text-white text-center py-3 rounded-xl font-medium">Créer ma flotte</button>
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
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
            <div className="max-w-2xl">
<div className={`inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                {slides[currentSlide].cta}
              </div>
              <h1 className={`text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6 animate-fade-in-left delay-100 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                {slides[currentSlide].title}
              </h1>
              <p className={`text-lg text-white/80 leading-relaxed mb-10 max-w-xl animate-fade-in-right delay-200 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                {slides[currentSlide].subtitle}
              </p>
              <div className={`flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
                <button onClick={() => window.location.href = 'https://trans-bygagoos.netlify.app/register'} className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-2 hover-scale">
                  Créer ma flotte gratuitement <ArrowRight size={20} />
                </button>
                <button onClick={() => window.location.href = 'https://trans-bygagoos-flotte.netlify.app/login'} className="border-2 border-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm">
                  Se connecter
                </button>
              </div>
            </div>
          </div>
        </div>
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"><ChevronLeft size={24} /></button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"><ChevronRight size={24} /></button>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)} className={`h-2.5 rounded-full transition-all duration-300 ${index === currentSlide ? 'bg-primary w-10' : 'bg-white/30 hover:bg-white/50 w-2.5'}`} />
          ))}
        </div>
      </section>

      {/* Section Tarifs */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 animate-slide-up">
            <h2 className="text-3xl font-bold text-gray-900">Nos tarifs</h2>
            <p className="mt-4 text-gray-500">Choisissez le plan qui correspond à votre flotte</p>
          </div>
          <div className="flex justify-center gap-3 mb-8">
            {[
              { value: "TAXI_MOTO", label: "🏍️ Taxi Moto" },
              { value: "TAXI_BE", label: "🛺 Taxi-Be" },
              { value: "TAXI", label: "🚗 Taxi" },
            ].map(t => (
              <button key={t.value} onClick={() => setSelectedType(t.value)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedType === t.value ? "bg-primary text-white shadow-lg" : "bg-white text-gray-600 border hover:border-primary"
                }`}>{t.label}</button>
            ))}
          </div>
          <div className="text-center mb-8">
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <div key={i} className={`card-hover rounded-2xl border-2 ${plan.nom === 'Business' ? 'border-amber-300 bg-primary/5' : 'border-gray-200 bg-white'} p-4 text-center animate-scale-in delay-${i}00`} style={{ animationDelay: `${0.1 + i * 0.1}s`, opacity: 0 }}>
                <span className="text-3xl">{plan.icon}</span>
                <h3 className="text-xl font-bold mt-3">{plan.nom}</h3>
                <p className="text-sm text-gray-500">{plan.motos}</p>
                <p className="text-xl font-extrabold text-primary mt-4">{plan.prix}</p>
                <p className="text-sm text-green-600">{plan.prixAnnuel} {plan.reduction && <span className="text-xs">({plan.reduction})</span>}</p>
                <p className="text-xs text-gray-400 mt-2">{plan.desc}</p>
                <button onClick={() => window.location.href = 'https://trans-bygagoos.netlify.app/register?plan=' + plan.nom} className="mt-4 w-full bg-primary text-white py-2 rounded-xl font-medium hover:bg-primary/90 transition-all hover-scale">
                  {plan.nom === 'Gratuit' ? 'Démarrer' : 'Choisir'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-3xl font-bold text-gray-900">Tous les véhicules dans une seule flotte</h2>
            <p className="mt-4 text-gray-500">Trans ByGagoos s'adapte à tous les types de transport</p>
          </div>

          {/* 3 types de flottes */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div onClick={() => navigate('/register')} className="card-hover bg-orange-50 border-2 border-orange-200 p-8 rounded-2xl text-center cursor-pointer hover:shadow-lg transition-shadow">
              <Bike size={48} className="text-orange-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">🏍️ Taxi Moto</h3>
              <p className="text-gray-500 text-sm mb-4">Gérez votre flotte de motos. Idéal pour le transport rapide en ville.</p>
              <span className="text-orange-600 font-semibold text-sm">Dès 0 Ar/mois →</span>
            </div>
            <div onClick={() => navigate('/register')} className="card-hover bg-teal-50 border-2 border-teal-200 p-8 rounded-2xl text-center cursor-pointer hover:shadow-lg transition-shadow">
              <Bus size={48} className="text-teal-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">🛺 Taxi-Be</h3>
              <p className="text-gray-500 text-sm mb-4">Tricycles et Sprinters pour le transport urbain et périurbain.</p>
              <span className="text-teal-600 font-semibold text-sm">Dès 0 Ar/mois →</span>
            </div>
            <div onClick={() => navigate('/register')} className="card-hover bg-indigo-50 border-2 border-indigo-200 p-8 rounded-2xl text-center cursor-pointer hover:shadow-lg transition-shadow">
              <Car size={48} className="text-indigo-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">🚗 Taxi</h3>
              <p className="text-gray-500 text-sm mb-4">Voitures pour un service premium. Confort et fiabilité garantis.</p>
              <span className="text-indigo-600 font-semibold text-sm">Dès 0 Ar/mois →</span>
            </div>
          </div>

          {/* Fonctionnalités */}
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-gray-900">Fonctionnalités incluses</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Bike, title: 'Gestion des Véhicules', desc: 'Suivez chaque véhicule : kilométrage, vidange, assurance, vignette.' },
              { icon: Users, title: 'Gestion des Chauffeurs', desc: 'Créez des comptes chauffeurs, suivez leurs pointages et performances.' },
              { icon: BarChart3, title: 'Tableau de Bord', desc: 'Visualisez vos revenus, dépenses et statistiques en temps réel.' },
              { icon: Shield, title: 'Application Mobile', desc: 'Vos chauffeurs utilisent l\'app mobile pour les courses et dépenses.' },
            ].map((feature, i) => (
              <div key={i} className="card-hover bg-gray-50 p-6 rounded-2xl border border-gray-100" style={{ animationDelay: `${0.1 + i * 0.1}s` }}>
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4"><feature.icon size={24} className="text-primary" /></div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center animate-slide-up">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Prêt à lancer votre flotte ?</h2>
          <p className="text-gray-500 mb-8">Rejoignez Trans ByGagoos et commencez à gérer votre flotte dès aujourd'hui.</p>
          <button onClick={() => window.location.href = 'https://trans-bygagoos.netlify.app/register'} className="bg-primary text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 inline-flex items-center gap-2 hover-scale">
            Créer ma flotte <ArrowRight size={20} />
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        © 2026 Trans ByGagoos - Ensemble pour la famille Gagoos ❤️
      </footer>
    </div>
  );
}
