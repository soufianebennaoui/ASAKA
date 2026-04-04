import React, { useState } from 'react';
import { ChefHat, Lock, User, ArrowRight, Instagram } from 'lucide-react';

const Login = ({ onLogin, onGoToWebsite }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'Admin' && password === '123123123') {
      setError('');
      onLogin(username);
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors duration-200 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex justify-center flex-col items-center">
          <div className="w-16 h-16 bg-salmon-500 rounded-full flex items-center justify-center shadow-lg shadow-salmon-500/30 mb-4">
            <ChefHat className="text-white w-8 h-8" />
          </div>
          <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Salmon Sushi
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-zinc-400">
            Staff CRM & Order Management
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white dark:bg-zinc-900/80 backdrop-blur-md py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100 dark:border-zinc-800 transition-colors duration-200">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
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
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-salmon-500 focus:border-salmon-500 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white sm:text-sm transition-colors outline-none"
                    placeholder="Enter your name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300">
                  Password
                </label>
                <div className="mt-2 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 dark:text-zinc-500" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-zinc-700 rounded-xl focus:ring-salmon-500 focus:border-salmon-500 bg-gray-50 dark:bg-zinc-900 text-gray-900 dark:text-white sm:text-sm transition-colors outline-none"
                    placeholder="••••••••"
                  />
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
                    className="h-4 w-4 text-salmon-500 focus:ring-salmon-500 border-gray-300 rounded transition-colors"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-600 dark:text-zinc-400">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-salmon-500 hover:text-salmon-400 transition-colors">
                    Forgot password?
                  </a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-salmon-500 hover:bg-salmon-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-salmon-500 transition-all group"
                >
                  Sign in
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </form>
          </div>
          
          <div className="mt-8 flex flex-col items-center space-y-3">
            <a
              href="https://www.instagram.com/salmonsushisidimaaroufofficiel/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-gray-500 hover:text-salmon-500 transition-colors"
            >
              <Instagram className="w-5 h-5 mr-2" />
              <span className="text-sm font-medium">Follow us on Instagram</span>
            </a>
            {onGoToWebsite && (
              <button
                onClick={onGoToWebsite}
                className="text-sm text-gray-400 hover:text-salmon-500 transition-colors flex items-center space-x-1"
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
