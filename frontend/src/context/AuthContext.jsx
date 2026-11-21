import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authService, configurarSesion } from '../services/api';

const AuthContext = createContext(null);

const ESCALA_KEY = 'techasset_texto_escala';

function aplicarFontSize(valor) {
  if (valor === 100) {
    document.documentElement.style.fontSize = '';
  } else {
    document.documentElement.style.fontSize = `${valor}%`;
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Tema Claro / Oscuro persistente
  const [darkMode, setDarkMode] = useState(() => {
    const guardado = localStorage.getItem('techasset_theme');
    return guardado
      ? guardado === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Escala de texto unificada (porcentual 90–135, default 100)
  const [escalaTexto, setEscalaTexto] = useState(() => {
    const guardado = Number(localStorage.getItem(ESCALA_KEY));
    return guardado >= 90 && guardado <= 135 ? guardado : 100;
  });

  const cerrarSesion = () => {
    configurarSesion(null, null);
    setCurrentUser(null);
  };

  useEffect(() => {
    configurarSesion(localStorage.getItem('techasset_token'), cerrarSesion);
    const expira = Number(localStorage.getItem('techasset_expira') || 0);
    if (localStorage.getItem('techasset_token') && expira > Date.now()) {
      authService
        .yo()
        .then(setCurrentUser)
        .catch(cerrarSesion)
        .finally(() => setCargandoSesion(false));
    } else {
      cerrarSesion();
      setCargandoSesion(false);
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('techasset_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Aplicar escala de texto al montar y cada vez que cambie
  useEffect(() => {
    aplicarFontSize(escalaTexto);
    localStorage.setItem(ESCALA_KEY, String(escalaTexto));
  }, [escalaTexto]);

  const iniciarSesion = async (correo, contrasena) => {
    const data = await authService.login(correo, contrasena);
    localStorage.setItem('techasset_expira', String(new Date(data.expira).getTime()));
    configurarSesion(data.token, cerrarSesion);
    setCurrentUser(data.usuario);
    return data.usuario;
  };

  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Función para cambiar escala (usada por ControlesTamanoTexto)
  const cambiarEscalaTexto = (nuevoValor) => {
    const valorValido = Math.max(90, Math.min(135, nuevoValor));
    setEscalaTexto(valorValido);
  };

  const value = useMemo(
    () => ({
      currentUser,
      cargandoSesion,
      iniciarSesion,
      cerrarSesion,
      darkMode,
      toggleDarkMode,
      escalaTexto,
      cambiarEscalaTexto,
      // Compatibilidad hacia atrás
      tamanoGrande: escalaTexto > 100,
      toggleTamanoTexto: () => cambiarEscalaTexto(escalaTexto > 100 ? 100 : 120),
      esAdmin: currentUser?.rol === 'Administrador',
      esResponsableTecnologia: currentUser?.rol === 'Responsable de Tecnología',
      esColaborador: currentUser?.rol === 'Colaborador',
    }),
    [currentUser, cargandoSesion, darkMode, escalaTexto]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
