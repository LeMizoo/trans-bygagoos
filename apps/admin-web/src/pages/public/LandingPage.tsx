import { useNavigate } from 'react-router-dom';
import { Bike, Users, BarChart3, Shield, ArrowRight, Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const slides = [
  {
    image: '/assets/photos/flotte-motos.jpg',
    placeholder: '🏍️🏍️🏍️',
    title: 'Gérez votre flotte de motos',
    subtitle: 'Suivi complet : kilométrage, vidange, assurance, vignette',
    bg: 'from-blue-600 to-blue-800',
  },
  {
    image: '/assets/photos/yamaha-cygnus.jpg',
    placeholder: '🛵',
    title: 'Yamaha Cygnus C1',
    subtitle: 'La moto idéale pour vos chauffeurs • Logo ByGagoos',
    bg: 'from-primary to-primary/80',
  },
  {
    image: '/assets/photos/dashboard.jpg',
    placeholder: '📊',
    title: 'Tableau de bord complet',
    subtitle: 'Visualisez vos revenus et dépenses en temps réel',
    bg: 'from-green-600 to-green-800',
  },
];

export function LandingPage() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % slides.length);

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-3">
              <img src="/assets/logo/b-trans.png" alt="Trans ByGagoos" className="w-10 h-10 object-contain" />
              <span className="text-xl font-bold text-gray-900">Trans ByGagoos</span>
            </div>
            
            <div className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-gray-600 hover:text-primary">Fonctionnalités</a>
              <a href="#slider" className="text-gray-600 hover:text-primary">Galerie</a>
              <a href="#contact" className="text-gray-600 hover:text-primary">Contact</a>
              <button onClick={() => navigate('/login')} className="text-gray-600 hover:text-primary font-medium">
                Connexion
              </button>
              <button onClick={() => navigate('/register')} className="bg-primary text-white px-5 py-2.5 rounded-xl font-medium hover:bg-primary/90 transition-all shadow-lg shadow-primary/25">
                Créer ma flotte
              </button>
            </div>

            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2">
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-white px-4 py-4 space-y-3">
            <a href="#features" className="block text-gray-600 py-2">Fonctionnalités</a>
            <a href="#slider" className="block text-gray-600 py-2">Galerie</a>
            <a href="#contact" className="block text-gray-600 py-2">Contact</a>
            <button onClick={() => navigate('/login')} className="block w-full text-left text-gray-600 py-2">Connexion</button>
            <button onClick={() => navigate('/register')} className="block w-full bg-primary text-white text-center py-3 rounded-xl font-medium">
              Créer ma flotte
            </button>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            🚀 Plateforme SaaS de gestion de flotte
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Gérez votre flotte de transport
            <span className="block text-primary">comme jamais auparavant</span>
          </h1>
          <p className="mt-6 text-lg text-gray-500 leading-relaxed">
            Trans ByGagoos vous offre une solution complète pour gérer vos motos, 
            chauffeurs, courses et finances. Tout depuis un seul tableau de bord.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <button onClick={() => navigate('/register')} className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 flex items-center justify-center gap-2">
              Créer ma flotte gratuitement <ArrowRight size={20} />
            </button>
            <button onClick={() => navigate('/login')} className="border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-xl text-lg font-semibold hover:border-primary hover:text-primary transition-all">
              Se connecter
            </button>
          </div>
          <p className="mt-4 text-sm text-gray-400">✓ Gratuit • ✓ Sans engagement • ✓ Démarrage immédiat</p>
        </div>
      </section>

      {/* Slider Section */}
      <section id="slider" className="bg-gray-900 py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-white">Notre flotte en images</h2>
            <p className="text-gray-400 mt-2">Découvrez les motos qui font tourner Trans ByGagoos</p>
          </div>

          <div className="relative">
            {/* Slide */}
            <div className="relative overflow-hidden rounded-2xl aspect-[16/9] max-h-[500px]">
              {slides.map((slide, index) => (
                <div
                  key={index}
                  className={`absolute inset-0 transition-opacity duration-700 ${
                    index === currentSlide ? 'opacity-100' : 'opacity-0 pointer-events-none'
                  }`}
                >
                  {/* Fond dégradé + emoji placeholder */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${slide.bg} flex flex-col items-center justify-center p-8 text-center`}>
                    <span className="text-8xl mb-6">{slide.placeholder}</span>
                    <h3 className="text-3xl sm:text-4xl font-bold text-white mb-4">{slide.title}</h3>
                    <p className="text-lg text-white/80">{slide.subtitle}</p>
                  </div>
                  {/* Remplacer par vraie image quand disponible : */}
                  {/* <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" /> */}
                </div>
              ))}
            </div>

            {/* Flèches */}
            <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-all">
              <ChevronLeft size={24} />
            </button>
            <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-3 rounded-full backdrop-blur-sm transition-all">
              <ChevronRight size={24} />
            </button>

            {/* Indicateurs */}
            <div className="flex justify-center gap-3 mt-6">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-primary w-8' : 'bg-gray-500 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
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
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                  <feature.icon size={24} className="text-primary" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Prêt à lancer votre flotte ?</h2>
          <p className="text-gray-500 mb-8">Rejoignez Trans ByGagoos et commencez à gérer votre flotte dès aujourd'hui.</p>
          <button onClick={() => navigate('/register')} className="bg-primary text-white px-10 py-4 rounded-xl text-lg font-semibold hover:bg-primary/90 transition-all shadow-xl shadow-primary/25 inline-flex items-center gap-2">
            Créer ma flotte <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-gray-400 py-8 text-center text-sm">
        © 2026 Trans ByGagoos - Ensemble pour la famille Gagoos ❤️
      </footer>
    </div>
  );
}
