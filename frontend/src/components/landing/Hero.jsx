import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ArrowRight, ShieldCheck, CheckCircle2, Laptop } from 'lucide-react';
import { textoLanding } from '../../contenido/landing';
import { imagenes } from '../../assets/imagenes';

export default function Hero() {
  const { hero, estadisticasHero } = textoLanding;
  const { heroLanding } = imagenes;

  return (
    <section id="hero" className="relative min-h-[92vh] flex flex-col justify-center pt-32 pb-16 sm:pt-36 sm:pb-20 overflow-hidden bg-[#F8FAFC] dark:bg-[#0B132B] text-slate-900 dark:text-white transition-colors duration-300">
      {/* Imagen hero en WebP a la derecha */}
      <div className="absolute top-0 right-0 w-full md:w-3/5 h-full opacity-80 md:opacity-90 pointer-events-none select-none">
        <img
          src={heroLanding.src}
          width={heroLanding.width}
          height={heroLanding.height}
          alt={heroLanding.alt}
          loading="eager"
          className="w-full h-full object-cover object-right"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#F8FAFC] via-[#F8FAFC]/50 to-transparent dark:from-[#0B132B] dark:via-[#0B132B]/75 dark:to-transparent" />
      </div>

      {/* SVG decorativo de circuito */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none opacity-10 dark:opacity-15"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <pattern id="circuito-hero-innovatech" width="60" height="60" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="1.5" fill="#84CC16" />
          <path
            d="M 0 30 H 20 M 40 30 H 60 M 30 0 V 20 M 30 40 V 60"
            stroke="#84CC16"
            strokeWidth="0.8"
            fill="none"
          />
        </pattern>
        <rect width="100%" height="100%" fill="url(#circuito-hero-innovatech)" />
      </svg>

      {/* Contenido textual principal */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-2xl">
          {/* Badge de Caso Académico */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-200/80 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold mb-6 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-lime-500 animate-pulse" />
            <span dangerouslySetInnerHTML={{ __html: hero.etiqueta }} />
          </div>

          {/* Titular de Alto Impacto */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            {hero.titularParte1}
            <span className="text-lime-600 dark:text-lime-400 underline decoration-lime-500/40 decoration-wavy decoration-2">
              {hero.palabraResaltada}
            </span>
          </h1>

          {/* Subtítulo */}
          <p className="mt-5 text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
            {hero.subtitulo}
          </p>

          {/* Botón de Acción único al Caso Académico (Acceso a Login centralizado en Topbar) */}
          <div className="mt-8 flex items-center">
            <a
              href="#problema"
              className="btn-base btn-secundario px-6 py-3 min-h-[46px] rounded-xl font-bold text-sm flex items-center gap-2 shadow-sm hover:border-lime-500 transition-all"
            >
              <span>{hero.botonSecundario}</span>
              <ChevronDown className="w-4 h-4 text-lime-600 dark:text-lime-400" />
            </a>
          </div>
        </div>

        {/* Barra de 4 Contadores / Indicadores Clave del Proyecto */}
        <div className="mt-14 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 md:grid-cols-4 gap-4">
          {estadisticasHero.map((st) => (
            <div
              key={st.etiqueta}
              className="p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200/90 dark:border-slate-700/80 shadow-sm"
            >
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white block">
                {st.valor}
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-lime-400 block mt-0.5">
                {st.etiqueta}
              </span>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                {st.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
