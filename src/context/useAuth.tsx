import { useContext } from 'react';
import { AuthContext, AuthContextProps } from './AuthContext';

export const useAuth = (): AuthContextProps => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};