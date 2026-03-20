import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { signIn, confirmSignIn } from 'aws-amplify/auth';
import { LogIn, Lock, Mail, AlertCircle, Key, User } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [nameAttrib, setNameAttrib] = useState('');
  const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isNewPasswordRequired) {
        // Confirmation du nouveau mot de passe
        const { isSignedIn, nextStep } = await confirmSignIn({
          challengeResponse: newPassword,
          options: {
            userAttributes: {
              name: nameAttrib,
            }
          }
        });
        
        if (isSignedIn) {
          navigate(from, { replace: true });
        } else {
           setError(`Étape suivante non gérée: ${nextStep.signInStep}`);
        }
      } else {
        // Connexion standard
        const { isSignedIn, nextStep } = await signIn({
          username,
          password,
        });

        if (isSignedIn) {
          navigate(from, { replace: true });
        } else if (nextStep.signInStep === 'CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED') {
          setIsNewPasswordRequired(true);
          setError(null);
        } else {
          setError(`Étape de connexion non gérée: ${nextStep.signInStep}`);
        }
      }
    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      if (err.name === 'NotAuthorizedException' || err.name === 'UserNotFoundException') {
        setError('Identifiants incorrects.');
      } else if (err.name === 'InvalidPasswordException') {
        setError('Le mot de passe ne respecte pas les critères de sécurité. Il doit généralement contenir majuscules, minuscules, chiffres et caractères spéciaux.');
      } else {
        setError(err.message || 'Une erreur est survenue lors de la connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-gray-900/50 p-10 shadow-2xl backdrop-blur-xl border border-gray-800">
        <div>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10 mb-6">
            {isNewPasswordRequired ? (
              <Key className="h-8 w-8 text-indigo-400" />
            ) : (
              <LogIn className="h-8 w-8 text-indigo-400" />
            )}
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {isNewPasswordRequired ? 'Nouveau mot de passe' : 'Connexion'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {isNewPasswordRequired 
              ? 'Votre compte nécessite un changement de mot de passe' 
              : 'Portail administrateur & enseignant'
            }
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="rounded-md bg-red-900/50 p-4 border border-red-800 flex items-center">
              <AlertCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0" />
              <div className="text-sm text-red-400">{error}</div>
            </div>
          )}
          
          <div className="space-y-4">
            {!isNewPasswordRequired ? (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="username">
                    Identifiant ou Email
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full rounded-md border border-gray-700 bg-gray-800 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10"
                      placeholder="admin.user"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="password">
                    Mot de passe
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full rounded-md border border-gray-700 bg-gray-800 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="nameAttrib">
                    Nom complet (Requis par AWS)
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <input
                      id="nameAttrib"
                      name="nameAttrib"
                      type="text"
                      required
                      value={nameAttrib}
                      onChange={(e) => setNameAttrib(e.target.value)}
                      className="block w-full rounded-md border border-gray-700 bg-gray-800 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10"
                      placeholder="Jean Dupont"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1" htmlFor="newPassword">
                  Nouveau mot de passe
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full rounded-md border border-gray-700 bg-gray-800 py-3 text-white placeholder-gray-500 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm pl-10"
                    placeholder="•••••••••"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Doit respecter les critères de sécurité de votre configuration Cognito.
                </p>
              </div>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 py-3 px-4 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-t-2 border-b-2 border-white"></div>
              ) : (
                isNewPasswordRequired ? 'Changer le mot de passe' : 'Se connecter'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
