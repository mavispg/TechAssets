import React from 'react';
import { textoLanding } from '../contenido/landing';
import { Database, Zap, ShieldCheck, BarChart3 } from 'lucide-react';

const iconos = [Database, Zap, ShieldCheck, BarChart3];

export default function FuncionesBento() {
  const { funciones } = textoLanding;

  return (
    <section
      id="funciones"
      className="py-24 sm:py-28 lg:py-32 relative overflow-hidden bg-[#F8F7FC] dark:bg-[#14101F] transition-colors duration-300"
    >
      {/* Luz ambiental sutil */}
      <div className="absolute top-1/2 left-0 w-96 h-96 bg-brandpurple/5 dark:bg-brandpurple/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <span className="text-xs font-bold text-violet-600 dark:text-accentlime uppercase tracking-widest block mb-3">
            Capacidades del Sistema
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {funciones.titulo}
          </h2>
        </div>

        <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {funciones.elementos.map((item, idx) => {
            const Icono = iconos[idx] || Database;
            return (
              <article
                key={item.titulo}
                className="p-8 rounded-3xl bg-white dark:bg-[#1C162E]/80 backdrop-blur-md border border-slate-200/90 dark:border-white/10 hover:border-brandpurple/50 shadow-md hover:shadow-xl dark:shadow-purple-950/20 dark:hover:shadow-brandpurple/20 hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-violet-100 dark:bg-brandpurple/20 border border-violet-200 dark:border-brandpurple/30 flex items-center justify-center text-violet-700 dark:text-lightpurple mb-6 shadow-inner">
                    <Icono className="w-6 h-6 text-violet-600 dark:text-lightpurple" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                    {item.titulo}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    {item.descripcion}
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
