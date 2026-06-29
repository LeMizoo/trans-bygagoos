import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { LogIn, AlertCircle, Eye, EyeOff } from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('Admin123!');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch {
      setError('Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/assets/logo/b-trans.png" alt="Trans ByGagoos" className="w-20 h-20 mx-auto mb-4 object-contain" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Trans ByGagoos</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Connectez-vous à votre compte</p>
        </div>
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-sm p-6">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-500/10 text-red-600 p-3 rounded-xl mb-4 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Mot de passe</label>
              <div className="relative">
                <input type={showPwd ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none pr-10 transition-all" required />
                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="w-full bg-primary text-white py-2.5 rounded-xl font-medium hover:bg-primary/90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/25">
              <LogIn size={18} /> {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

