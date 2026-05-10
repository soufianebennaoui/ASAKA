import React, { useState } from 'react';
import { ChefHat, Lock, User, ArrowRight, Eye, EyeOff } from 'lucide-react';

const API = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:3001`;

const Login = ({ onLogin, onGoToWebsite }) => {
  const [username,     setUsername]     = useState('');
  const [password,     setPassword]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error,        setError]        = useState('');
  const [loading,      setLoading]      = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API}/api/staff/login`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ username, password }),
      });
      if (res.status === 401) {
        setError('Nom ou mot de passe incorrect.');
        return;
      }
      if (!res.ok) throw new Error('server_error');
      const staff = await res.json();
      onLogin(staff);
    } catch (err) {
      if (err.message === 'server_error') {
        setError('Erreur serveur. Vérifiez que le serveur est démarré.');
      } else {
        setError('Impossible de contacter le serveur.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-asaka-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-center flex-col items-center">
          <div className="w-16 h-16 bg-asaka-500 rounded-full flex items-center justify-center shadow-lg shadow-asaka-500/30 mb-4">
            <ChefHat className="text-white w-8 h-8" />
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-white tracking-tight">
            Asaka Sushi
          </h2>
          <p className="mt-2 text-center text-sm text-asaka-muted">
            Staff CRM & Order Management
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-asaka-800/60 backdrop-blur-md py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-asaka-700/50"
               style={{ background: 'rgba(13,27,42,0.85)' }}>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-asaka-muted">
                  Name / Username
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-asaka-700/50 rounded-xl focus:ring-asaka-300/30 focus:border-asaka-300/60 sm:text-sm transition-colors outline-none"
                    style={{ background: '#060d18', color: '#ffffff' }}
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-asaka-muted">
                  Password
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 border border-asaka-700/50 rounded-xl focus:ring-asaka-300/30 focus:border-asaka-300/60 sm:text-sm transition-colors outline-none"
                    style={{ background: '#060d18', color: '#ffffff' }}
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-gray-400 hover:text-white focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {error && (
                <div className="text-sm text-rose-500 font-medium text-center">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-asaka-500 focus:ring-asaka-500 border-gray-300 rounded transition-colors"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-zinc-400">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-asaka-500 hover:text-asaka-300 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-asaka-500 hover:bg-asaka-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-asaka-500 transition-all group disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Connexion…' : 'Se connecter'}
                  {!loading && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 flex flex-col items-center space-y-3">
            {onGoToWebsite && (
              <button
                onClick={onGoToWebsite}
                className="text-sm text-asaka-muted hover:text-asaka-300 transition-colors flex items-center space-x-1"
              >
                <span>🌐</span>
                <span>Voir le site client</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
