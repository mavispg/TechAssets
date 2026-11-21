import React from 'react';
import logoIcono from '../assets/logo-icono.png';

/**
 * Marca — Logo + nombre del sistema.
 * Props:
 *  - tamano: 'pequeno' | 'normal' | 'grande'
 *  - soloIcono: true → solo muestra el icono (sidebar colapsado)
 *  - textoClaro: true → fuerza el texto en blanco (para fondos oscuros fijos como el sidebar)
 *  - className: clases extra
 */
export default function Marca({ className = '', tamano = 'normal', soloIcono = false, textoClaro = false }) {
  // Tamaño del contenedor del icono
  const iconoClase =
    tamano === 'grande'
      ? 'w-14 h-14 p-2.5 rounded-2xl'
      : tamano === 'pequeno'
        ? 'w-8 h-8 p-1.5 rounded-xl'
        : 'w-10 h-10 p-2 rounded-xl';

  // Tamaño del texto "InnovaTech"
  const textoClase =
    tamano === 'grande'
      ? 'text-xl'
      : tamano === 'pequeno'
        ? 'text-sm'
        : 'text-base';

  return (
    <div
      className={`inline-flex items-center gap-2.5 select-none shrink-0 ${className}`}
      aria-label="InnovaTech"
    >
      {/* Icono con fondo institucional para garantizar contraste en claro/oscuro */}
      <div
        className={`inline-flex items-center justify-center bg-[#0B132B] border border-slate-700/60 shadow-md shrink-0 ${iconoClase}`}
        title="InnovaTech"
      >
        <img
          src={logoIcono}
          alt="Logo InnovaTech"
          className="w-full h-full object-contain pointer-events-none"
        />
      </div>

      {/* Nombre del sistema — se oculta solo cuando soloIcono=true */}
      {!soloIcono && (
        <span
          className={`font-black tracking-tight leading-none ${textoClaro ? 'text-white' : 'text-slate-900 dark:text-white'} ${textoClase}`}
          aria-hidden="true"
        >
          Innova<span className="text-lime-500">Tech</span>
        </span>
      )}
    </div>
  );
}
