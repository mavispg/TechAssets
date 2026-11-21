import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react';
import { textoLanding } from '../../contenido/landing';
import { useAuth } from '../../context/AuthContext';
import Marca from '../Marca';
import ControlesAccesibilidad from '../shared/ControlesAccesibilidad';

export default function BarraNavegacion() {
  const { darkMode } = useAuth();
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [scrollActivo, setScrollActivo] = useState(false);
  // 'hero' es la sección activa por defecto (cuando el usuario está en la parte superior)
  const [seccionActiva, setSeccionActiva] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      setScrollActivo(window.scrollY > 25);

      // Si el usuario está al tope, marcar 'hero' como activo
      if (window.scrollY < 150) {
        setSeccionActiva('hero');
        return;
      }

      const secciones = ['objetivos', 'actores', 'flujo', 'beneficios', 'contacto'];
      let encontrada = false;
      for (const id of secciones) {
        const el = document.getElementById(id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setSeccionActiva(id);
            encontrada = true;
            break;
          }
        }
      }
      if (!encontrada && window.scrollY >= 150) {
        // Estamos entre el hero y la siguiente sección → mantener hero
        setSeccionActiva('hero');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    if (href === '#hero') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setMenuAbierto(false);
      setSeccionActiva('hero');
      return;
    }
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setMenuAbierto(false);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrollActivo
          ? 'py-2.5 bg-white/95 dark:bg-[#0B132B]/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-lg'
          : 'py-4 bg-gradient-to-b from-white/95 via-white/80 to-transparent dark:from-[#0B132B]/95 dark:via-[#0B132B]/80 dark:to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Marca corporativa con logo + nombre del sistema */}
          <Link to="/" className="flex items-center group">
            <Marca tamano="grande" />
          </Link>

          {/* Navegación de escritorio: Barra dinámica */}
          <nav
            className="hidden lg:flex items-center gap-1 p-1.5 rounded-full bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 backdrop-blur-md shadow-inner"
            aria-label="Navegación principal"
          >
            {textoLanding.navegacion.map((item) => {
              const id = item.href.replace('#', '');
              const esActivo = seccionActiva === id;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`relative px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 ${
                    esActivo
                      ? 'bg-[#0B132B] text-white dark:bg-lime-500 dark:text-[#0B132B] shadow-sm scale-105'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700/60'
                  }`}
                >
                  {item.nombre}
                </a>
              );
            })}
          </nav>

          {/* Acciones y accesibilidad */}
          <div className="hidden md:flex items-center gap-3">
            <ControlesAccesibilidad compact={true} />

            <Link
              to="/ingresar"
              className="px-4 py-2 rounded-xl bg-[#0B132B] dark:bg-lime-500 hover:bg-slate-800 dark:hover:bg-lime-400 text-white dark:text-[#0B132B] text-xs font-black shadow-md shadow-slate-900/10 dark:shadow-lime-500/20 transition-all flex items-center gap-2 border border-slate-700 dark:border-lime-400"
            >
              <LogIn className="w-4 h-4" />
              <span>{textoLanding.botonIngresar}</span>
            </Link>
          </div>

          {/* Botón menú móvil */}
          <div className="flex lg:hidden items-center gap-2">
            <ControlesAccesibilidad compact={true} />
            <button
              type="button"
              onClick={() => setMenuAbierto((v) => !v)}
              className="p-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
            >
              {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú móvil desplegable */}
      {menuAbierto && (
        <div className="lg:hidden mt-2 mx-4 p-5 rounded-2xl bg-white/95 dark:bg-[#0B132B]/95 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-2 animate-in fade-in slide-in-from-top-2 duration-200">
          {textoLanding.navegacion.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={(e) => handleNavClick(e, item.href)}
              className="block px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {item.nombre}
            </a>
          ))}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <Link
              to="/ingresar"
              onClick={() => setMenuAbierto(false)}
              className="w-full py-2.5 rounded-xl bg-lime-500 hover:bg-lime-400 text-[#0B132B] text-xs font-extrabold text-center flex items-center justify-center gap-2 shadow-md"
            >
              <LogIn className="w-4 h-4" />
              <span>{textoLanding.botonIngresar}</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
