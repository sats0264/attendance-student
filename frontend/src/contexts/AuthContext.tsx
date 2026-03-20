import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, fetchAuthSession, type AuthUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';

interface AuthContextType {
  user: AuthUser | null;
  userData: { name?: string; email?: string } | null;
  groups: string[];
  isAdmin: boolean;
  isTeacher: boolean;
  loading: boolean;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userData, setUserData] = useState<{ name?: string; email?: string } | null>(null);
  const [groups, setGroups] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const currentUser = await getCurrentUser();
      const session = await fetchAuthSession();
      const payload = session.tokens?.idToken?.payload;
      const userGroups = (payload?.['cognito:groups'] as string[]) || [];

      setUser(currentUser);
      setUserData({
        name: payload?.name as string,
        email: payload?.email as string
      });
      setGroups(userGroups);
    } catch (error) {
      setUser(null);
      setUserData(null);
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();

    const unsubscribe = Hub.listen('auth', ({ payload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkAuth();
          break;
        case 'signedOut':
          setUser(null);
          setUserData(null);
          setGroups([]);
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  const isAdmin = groups.some(g => g.toLowerCase() === 'admin');
  const isTeacher = groups.some(g => g.toLowerCase() === 'teacher');

  return (
    <AuthContext.Provider value={{ user, userData, groups, isAdmin, isTeacher, loading, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
