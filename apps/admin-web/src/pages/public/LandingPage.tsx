import { useNavigate } from 'react-router-dom';
import { Bike, Users, BarChart3, Shield, ArrowRight, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { photos } from './photos';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';

const API = 'https://trans-bygagoos.onrender.com/api/v1';

const slides = [
  { image: photos['flotte-motos'], title: 'Gérez votre flotte de motos', subtitle: 'Suivi complet : kilométrage, vidange, assurance, vignette', cta: 'Créer ma flotte' },
  { image: photos['yamaha-cygnus'], title: 'Yamaha Cygnus C1 ByGagoos', subtitle: 'La moto idéale pour vos chauffeurs', cta: 'Découvrir' },
  { image: photos['taxi-motos'], title: 'Taxi Moto ByGagoos', subtitle: 'Vos chauffeurs prêts à servir vos clients', cta: 'Rejoindre' },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Prix depuis l'API avec fallback sur les valeurs admin
  const { data: pricing = {} } = useQuery({
    queryKey: ['pricing-landing'],
    queryFn: () => axios.get(`${API}/parametres`).then(r => {
      const map: any = {};
      (Array.isArray(r.data) ? r.data : []).forEach((p: any) => { map[p.nom] = p.valeur; });
      return map;
    }),
    staleTime: 300000, // 5 min de cache
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  const formatPrix = (val: string) => parseInt(val || '0').toLocaleString() + ' Ar/mois';
  const formatAnnuel = (val: string, reduc: string) => {
    const mensuel = parseInt(val || '0');
    const reduction = parseInt(reduc || '0');
    const annuel = Math.round(mensuel * 12 * (1 - reduction / 100));
    return annuel.toLocaleString() + ' Ar/an';
  };

  // Valeurs synchronisées avec l'admin (fallback = valeurs configurées)
  const prix2_5 = pricing.abonnement_2_5_prix_mensuel || '7000';
  const prix6_10 = pricing.abonnement_6_10_prix_mensuel || '15000';
  const prix11 = pricing.abonnement_11_plus_prix_mensuel || '50000';
  const reduc = pricing.reduction_annuelle_pourcent || '7';

  const plans = [
    { nom: 'Gratuit', motos: '1 moto', prix: '0 Ar/mois', prixAnnuel: 'Gratuit', icon: '🆓', desc: 'Pour démarrer', abo: 'GRATUIT' },
    { nom: 'Standard', motos: '2-5 motos', prix: formatPrix(prix2_5), prixAnnuel: formatAnnuel(prix2_5, reduc), icon: '🥈', desc: 'Petite flotte', reduction: '-' + reduc + '%', abo: '2_5' },
    { nom: 'Premium', motos: '6-10 motos', prix: formatPrix(prix6_10), prixAnnuel: formatAnnuel(prix6_10, reduc), icon: '🥇', desc: 'Flotte moyenne', reduction: '-' + reduc + '%', abo: '6_10' },
    { nom: 'Business', motos: '11+ motos', prix: formatPrix(prix11), prixAnnuel: formatAnnuel(prix11, reduc), icon: '💎', desc: 'Grande flotte', reduction: '-' + reduc + '%', abo: '11_PLUS' },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <a href="/" className="flex items-center gap-3">
              <img src="/assets/logo/b-trans.png" alt="Trans ByGagoos" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-white drop-shadow-lg">Trans ByGagoos</span>
            </a>
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-white/80 hover:text-white drop-shadow">Fonctionnalités</a>
              <a href="#pricing" className="text-white/80 hover:text-white drop-shadow">Tarifs</a>
              <button onClick={() => navigate('/login')} className="text-white/80 hover:text-white font-medium drop-shadow">Connexion</button>
              <button onClick={() => navigate('/register')} className="bg-white text-primary px-5 py-2.5 rounded-xl font-medium hover:bg-white/90 transition-all shadow-lg">Créer ma flotte</button>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-white">{mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}</button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-black/80 backdrop-blur-sm px-4 py-4 space-y-3">
            <a href="#features" className="block text-white py-2">Fonctionnalités</a>
            <a href="#pricing" className="block text-white py-2">Tarifs</a>
            <button onClick={() => navigate('/login')} className="block w-full text-left text-white py-2">Connexion</button>
            <button onClick={() => navigate('/register')} className="block w-full bg-primary text-white text-center py-3 rounded-xl font-medium">Créer ma flotte</button>
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
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-full text-sm font-medium mb-6">🚀 Plateforme SaaS de gestion de flotte</div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight mb-6">Gérez votre flotte de transport<span className="block text-primary-300">comme jamais auparavant</span></h1>
              <p className="text-lg text-white/80 leading-relaxed mb-10 max-w-xl">Trans ByGagoos vous offre une solution complète pour gérer vos motos, chauffeurs, courses et finances. Tout depuis un seul tableau de bord.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => navigate('/register')} className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-2">Créer ma flotte gratuitement <ArrowRight size={20} /></button>
                <button onClick={() => navigate('/login')} className="border-2 border-white/30 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-white/10 hover:border-white/50 transition-all backdrop-blur-sm">Se connecter</button>
              </div>
              <p className="mt-4 text-sm text-white/60">✓ Gratuit • ✓ Sans engagement • ✓ Démarrage immédiat</p>
            </div>
          </div>
        </div>
        <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"><ChevronLeft size={24} /></button>
        <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/30 text-white p-3 rounded-full backdrop-blur-sm transition-all z-10"><ChevronRight size={24} /></button>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-3 z-10">
          {slides.map((_, index) => (
            <button key={index} onClick={() => setCurrentSlide(index)} className={`h-2.5 rounded-full transition-all ${index === currentSlide ? 'bg-primary w-10' : 'bg-white/30 hover:bg-white/50 w-2.5'}`} />
          ))}
        </div>
      </section>

      {/* Section Tarifs - PRIX SYNCHRONISÉS AVEC L'ADMIN */}
      <section id="pricing" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Nos tarifs</h2>
            <p className="mt-4 text-gray-500">Choisissez le plan qui correspond à votre flotte</p>
            <p className="mt-1 text-xs text-gray-400">Prix synchronisés avec l'administration</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {plans.map((plan, i) => (
              <div key={i} className={`rounded-2xl border-2 ${plan.nom === 'Business' ? 'border-amber-300 bg-primary/5' : 'border-gray-200 bg-white'} p-6 text-center hover:shadow-lg transition-all`}>
                <span className="text-3xl">{plan.icon}</span>
                <h3 className="text-xl font-bold mt-3">{plan.nom}</h3>
                <p className="text-sm text-gray-500">{plan.motos}</p>
                <p className="text-3xl font-extrabold text-primary mt-4">{plan.prix}</p>
                <p className="text-sm text-green-600">{plan.prixAnnuel} {plan.reduction && <span className="text-xs">({plan.reduction})</span>}</p>
                <p className="text-xs text-gray-400 mt-2">{plan.desc}</p>
                <button onClick={() => navigate('/register?plan=' + plan.nom)} className="mt-4 w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all">
                  {plan.nom === 'Gratuit' ? 'Démarrer' : 'Choisir'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">Tout ce dont vous avez besoin</h2>
            <p className="mt-4 text-gray-500">Une plateforme complète pour gérer votre flotte de A à Z</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Bike, title: 'Gestion des Motos', desc: 'Suivez chaque moto : kilométrage, vidange, assurance, vignette.' },
              { icon: Users, title: 'Gestion des Chauffeurs', desc: 'Créez des comptes chauffeurs, suivez leurs pointages et performances.' },
              { icon: BarChart3, title: 'Tableau de Bord', desc: 'Visualisez vos revenus, dépenses et statistiques en temps réel.' },
              { icon: Shield, title: 'Application Mobile', desc: 'Vos chauffeurs utilisent l\'app mobile pour les courses et dépenses.' },
            ].map((feature, i) => (
              <div key={i} className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
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
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Prêt à lancer votre flotte ?</h2>
          <p className="text-gray-500 mb-8">Rejoignez Trans ByGagoos et commencez à gérer votre flotte dès aujourd'hui.</p>
          <button onClick={() => navigate('/register')} className="bg-primary text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 inline-flex items-center gap-2">Créer ma flotte <ArrowRight size={20} /></button>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-8 text-center text-sm">© 2026 Trans ByGagoos - Ensemble pour la famille Gagoos ❤️</footer>
    </div>
  );
}
