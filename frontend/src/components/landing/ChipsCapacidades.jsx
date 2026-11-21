import React from 'react';
import { CheckCircle2 } from 'lucide-react';
import { textoLanding } from '../../contenido/landing';

export default function ChipsCapacidades() {
  const { chips } = textoLanding;

  return (
    <section className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 mb-12 sm:mb-16">
      <div className="bg-white/95 dark:bg-[#1C162E]/90 backdrop-blur-xl rounded-2xl p-5 sm:p-6 border border-slate-200/90 dark:border-white/10 shadow-xl dark:shadow-2xl dark:shadow-purple-950/60 transition-colors duration-300">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {chips.map((chip) => (
            <div
              key={chip}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/5 hover:border-brandpurple/40 hover:bg-slate-100 dark:hover:bg-white/10 transition-all duration-200"
            >
              <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-accentlime shrink-0" />
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">
                {chip}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
