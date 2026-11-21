import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Paginador({
  pagina = 1,
  totalPaginas = 1,
  totalElementos = 0,
  tamano = 10,
  onCambiarPagina,
}) {
  if (totalElementos === 0) return null;
  // Con una sola página, mostrar solo el indicador de registros (sin controles de navegación)
  const soloUnaPagina = totalPaginas <= 1;

  const inicio = Math.min((pagina - 1) * tamano + 1, totalElementos);
  const fin = Math.min(pagina * tamano, totalElementos);
  const total = Math.max(1, totalPaginas);

  // Generar lista de números de página visibles
  const generarPaginas = () => {
    const paginas = [];
    const maxVisibles = 5;
    let inicioRango = Math.max(1, pagina - 2);
    let finRango = Math.min(total, inicioRango + maxVisibles - 1);

    if (finRango - inicioRango < maxVisibles - 1) {
      inicioRango = Math.max(1, finRango - maxVisibles + 1);
    }

    for (let i = inicioRango; i <= finRango; i++) {
      paginas.push(i);
    }
    return paginas;
  };

  const paginasVisibles = generarPaginas();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3.5 border-t border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-900/30 text-xs text-slate-600 dark:text-slate-400">
      {/* Indicador de registros */}
      <div className="font-medium">
        Mostrando <span className="font-bold text-slate-900 dark:text-white">{inicio}–{fin}</span> de{' '}
        <span className="font-bold text-slate-900 dark:text-white">{totalElementos}</span> registros
      </div>

      {/* Controles de paginación — solo si hay más de una página */}
      {!soloUnaPagina && (
        <div className="flex items-center gap-1">
        {/* Botón Anterior */}
        <button
          type="button"
          onClick={() => onCambiarPagina(pagina - 1)}
          disabled={pagina <= 1}
          className="btn-base px-2.5 py-1.5 min-h-[34px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
          title="Página anterior"
          aria-label="Página anterior"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Números de página */}
        <div className="flex items-center gap-1">
          {paginasVisibles[0] > 1 && (
            <>
              <button
                type="button"
                onClick={() => onCambiarPagina(1)}
                className="w-8 h-8 rounded-lg font-semibold text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
              >
                1
              </button>
              {paginasVisibles[0] > 2 && <span className="px-1 text-slate-400">…</span>}
            </>
          )}

          {paginasVisibles.map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => onCambiarPagina(num)}
              className={`w-8 h-8 rounded-lg font-bold text-xs transition-colors ${
                num === pagina
                  ? 'bg-[#0B132B] dark:bg-lime-500 text-white dark:text-[#0B132B] shadow-sm'
                  : 'border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
              aria-label={`Ir a la página ${num}`}
              aria-current={num === pagina ? 'page' : undefined}
            >
              {num}
            </button>
          ))}

          {paginasVisibles[paginasVisibles.length - 1] < total && (
            <>
              {paginasVisibles[paginasVisibles.length - 1] < total - 1 && (
                <span className="px-1 text-slate-400">…</span>
              )}
              <button
                type="button"
                onClick={() => onCambiarPagina(total)}
                className="w-8 h-8 rounded-lg font-semibold text-xs border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60"
              >
                {total}
              </button>
            </>
          )}
        </div>

        {/* Botón Siguiente */}
        <button
          type="button"
          onClick={() => onCambiarPagina(pagina + 1)}
          disabled={pagina >= total}
          className="btn-base px-2.5 py-1.5 min-h-[34px] rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed shadow-sm transition-all"
          title="Página siguiente"
          aria-label="Página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
      )}
    </div>
  );
}
