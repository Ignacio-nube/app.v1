import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';
import { AuthContextType, LoginCredenciales, Usuario } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUsuario = localStorage.getItem('usuario');

      if (savedToken && savedUsuario) {
        setToken(savedToken);
        setUsuario(JSON.parse(savedUsuario));

        try {
          const { data } = await api.get('/api/auth/verificar');
          if (data?.usuario) {
            setUsuario(data.usuario);
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
          }
        } catch (error) {
          console.error('Error verificando la sesión almacenada:', error);
          setToken(null);
          setUsuario(null);
          localStorage.removeItem('token');
          localStorage.removeItem('usuario');
        }
      }

      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credenciales: LoginCredenciales) => {
    try {
      const response = await api.post('/api/auth/login', credenciales);
      const { token: newToken, usuario: newUsuario } = response.data;

      setToken(newToken);
      setUsuario(newUsuario);
      localStorage.setItem('token', newToken);
      localStorage.setItem('usuario', JSON.stringify(newUsuario));

      // Redirigir según el rol
      navigate('/dashboard');
    } catch (error: any) {
      throw new Error(
        error.response?.data?.mensaje ||
        error.response?.data?.error ||
        'Error al iniciar sesión'
      );
    }
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      setToken(null);
      setUsuario(null);
      localStorage.removeItem('token');
      localStorage.removeItem('usuario');
      navigate('/login');
    }
  };

  const value: AuthContextType = {
    usuario,
    token,
    login,
    logout,
    isLoading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
