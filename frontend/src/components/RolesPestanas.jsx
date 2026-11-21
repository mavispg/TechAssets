import React, { useState } from 'react';
import { textoLanding } from '../contenido/landing';
import { ShieldCheck, Wrench, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const iconosRol = {
  admin: ShieldCheck,
  tech: Wrench,
  colab: Users,
};

export default function RolesPestanas() {
  const { roles } = textoLanding;
  const [activo, setActivo] = useState(roles.items[0].id);

  return (
    <section
      id="roles"
      className="py-24 sm:py-28 lg:py-32 relative overflow-hidden bg-[#F8F7FC] dark:bg-[#14101F] transition-colors duration-300"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold text-violet-600 dark:text-accentlime uppercase tracking-widest block mb-3">
            Gobernanza y Roles
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {roles.titulo}
          </h2>
        </div>

        {/* Barra de pestañas adaptativa a tema */}
        <div className="flex flex-wrap justify-center gap-2 p-2 bg-slate-200/80 dark:bg-[#1C162E]/90 border border-slate-300/60 dark:border-white/10 rounded-2xl max-w-xl mx-auto mb-10 shadow-md backdrop-blur-md">
          {roles.items.map((item) => {
            const Icono = iconosRol[item.id] || ShieldCheck;
            const esActivo = activo === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActivo(item.id)}
                className={`flex-1 min-w-[130px] py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 ${
                  esActivo
                    ? 'bg-brandpurple text-white shadow-lg shadow-brandpurple/40 scale-[1.02]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-300/50 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5'
                }`}
              >
                <Icono
                  className={`w-4 h-4 shrink-0 ${esActivo ? 'text-accentlime' : 'text-slate-500 dark:text-slate-400'}`}
                />
                <span className="truncate">{item.rol}</span>
              </button>
            );
          })}
        </div>

        {/* Tarjeta de detalle del rol activo */}
        {roles.items.map((item) => {
          if (item.id !== activo) return null;
          const Icono = iconosRol[item.id] || ShieldCheck;
          return (
            <div
              key={item.id}
              className="p-10 rounded-3xl bg-white dark:bg-[#1C162E]/90 border border-slate-200/90 dark:border-white/10 text-center shadow-xl dark:shadow-2xl dark:shadow-purple-950/40 max-w-xl mx-auto animate-in fade-in zoom-in-95 duration-200"
            >
              <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-brandpurple/20 border border-violet-200 dark:border-brandpurple/40 flex items-center justify-center mx-auto mb-6 text-violet-700 dark:text-accentlime shadow-inner">
                <Icono className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">{item.rol}</h3>
              <p className="text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal mb-8">
                {item.descripcion}
              </p>
              <Link
                to="/ingresar"
                className="inline-flex items-center gap-2 text-xs font-bold text-brandpurple dark:text-accentlime hover:underline transition-colors"
              >
                <span>Probar este rol en el sistema</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          );
        })}
      </div>
    </section>
  );
}
