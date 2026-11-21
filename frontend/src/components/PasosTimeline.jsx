import React from 'react';
import { textoLanding } from '../contenido/landing';

export default function PasosTimeline() {
  const { comoFunciona } = textoLanding;

  return (
    <section
      id="como-funciona"
      className="py-24 sm:py-28 lg:py-32 relative overflow-hidden bg-white dark:bg-gradient-to-b dark:from-transparent dark:via-[#1A132B]/80 dark:to-transparent transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <span className="text-xs font-bold text-violet-600 dark:text-accentlime uppercase tracking-widest block mb-3">
            Flujo de Trabajo
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {comoFunciona.titulo}
          </h2>
        </div>

        <div className="grid gap-8 sm:gap-10 md:grid-cols-3 relative">
          {comoFunciona.pasos.map((paso) => (
            <div
              key={paso.numero}
              className="flex flex-col items-center text-center p-8 rounded-3xl bg-slate-50 dark:bg-[#1C162E]/70 backdrop-blur-md border border-slate-200/90 dark:border-white/10 hover:border-brandpurple/50 shadow-md hover:shadow-xl dark:shadow-purple-950/20 hover:-translate-y-1 transition-all duration-300"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-brandpurple text-white font-black text-2xl flex items-center justify-center shadow-lg shadow-brandpurple/40 mb-8 ring-8 ring-brandpurple/15">
                {paso.numero}
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
                {paso.titulo}
              </h3>
              <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xs leading-relaxed font-normal">
                {paso.descripcion}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
