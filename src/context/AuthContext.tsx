import React, { createContext, useEffect, useState, ReactNode } from 'react';
import type { User } from 'firebase/auth';
import { useRouter } from 'next/router';

export interface AuthContextProps {
  currentUser: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmailAndPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const route = useRouter()

  useEffect(() => {
    setLoading(true);
    let unsubscribe:()=>void=()=>{};let active=true;
    import('../database/AuthConfig').then(({auth})=>{if(!active)return;unsubscribe=auth.onAuthStateChanged(user=>{setCurrentUser(user);setLoading(false);});}).catch(()=>setLoading(false));
    return()=>{active=false;unsubscribe();};
  }, []);

  const signInWithGoogle = async () => {
    try {
      const [{GoogleAuthProvider,signInWithPopup},{auth}]=await Promise.all([import('firebase/auth'),import('../database/AuthConfig')]);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      route.push("/my-account")
    } catch (error) {
      console.error('Error al iniciar sesión con Google:', error);
    }
  };

  const signInWithEmailAndPassword = async (email: string, password: string) => {
    try {
      const [{signInWithEmailAndPassword},{auth}]=await Promise.all([import('firebase/auth'),import('../database/AuthConfig')]);
      await signInWithEmailAndPassword(auth, email, password);
      console.log('Inicio de sesión exitoso con correo y contraseña');

    } catch (error) {
      console.error('Error al iniciar sesión', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const {auth}=await import('../database/AuthConfig');await auth.signOut();
      route.push("/my-account")
    } catch (error) {
      console.error('Error al cerrar sesión', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        signInWithGoogle,
        signInWithEmailAndPassword,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
