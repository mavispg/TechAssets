import React from 'react';

export default function CardKPI({
  titulo,
  valor,
  subtitulo,
  icon: Icon,
  color = 'blue',
}) {
  const colorMap = {
    blue: {
      iconoBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20',
      bordeHover: 'hover:border-blue-400/50',
    },
    emerald: {
      iconoBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      bordeHover: 'hover:border-emerald-400/50',
    },
    indigo: {
      iconoBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20',
      bordeHover: 'hover:border-indigo-400/50',
    },
    amber: {
      iconoBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
      bordeHover: 'hover:border-amber-400/50',
    },
    purple: {
      iconoBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20',
      bordeHover: 'hover:border-purple-400/50',
    },
    rose: {
      iconoBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      bordeHover: 'hover:border-rose-400/50',
    },
  };

  const actualColor = colorMap[color] || colorMap.blue;

  // El valor puede ser texto largo (ej: nombre de área). Ajustamos el tamaño de fuente
  // dinámicamente: si es una cadena con más de 10 caracteres, usamos texto más pequeño.
  const valorEsTextoLargo = typeof valor === 'string' && valor.length > 10;

  return (
    <div
      className={`bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm transition-all duration-200 flex items-center gap-3 p-4 ${actualColor.bordeHover}`}
    >
      {/* Icono (izquierda) — mismo tamaño en todas las tarjetas */}
      {Icon && (
        <div
          className={`w-11 h-11 rounded-xl border flex items-center justify-center shrink-0 ${actualColor.iconoBg}`}
        >
          <Icon className="w-5 h-5" />
        </div>
      )}

      {/* Contenido (derecha) — sin height fijo para que la tarjeta se ajuste al contenido */}
      <div className="min-w-0 flex-1">
        {/* Título: mismo tamaño y peso en todas */}
        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block leading-tight">
          {titulo}
        </span>
        {/* Valor: si es texto largo (nombre de área) bajamos la fuente para mantener jerarquía */}
        <span
          className={`font-black text-slate-900 dark:text-white tracking-tight block leading-tight mt-0.5 ${
            valorEsTextoLargo ? 'text-sm sm:text-base' : 'text-xl sm:text-2xl'
          }`}
        >
          {valor}
        </span>
        {subtitulo && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5 leading-tight">
            {subtitulo}
          </p>
        )}
      </div>
    </div>
  );
}
