import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { imagenes } from '../../assets/imagenes';

export default function DispositivoMockup() {
  const { darkMode } = useAuth();
  const captura = darkMode ? imagenes.capturaTableroOscuro : imagenes.capturaTableroClaro;

  return (
    <div
      className="relative mx-auto w-full max-w-4xl"
      aria-label="Mockup de portátil con vista del tablero"
    >
      {/* Tapa / Pantalla del portátil */}
      <div className="relative rounded-t-2xl border-4 border-slate-700 bg-slate-900 p-2 shadow-2xl">
        {/* Cámara web y sensor */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800" />
          <div className="w-1.5 h-1.5 rounded-full bg-slate-700 ring-1 ring-slate-600" />
        </div>

        {/* Pantalla con captura real */}
        <div className="relative overflow-hidden rounded-lg aspect-[16/10] bg-slate-950">
          <img
            src={captura.src}
            width={captura.width}
            height={captura.height}
            alt={captura.alt}
            loading="lazy"
            className="w-full h-full object-cover object-top transition-opacity duration-300"
          />
        </div>
      </div>

      {/* Base del portátil */}
      <div className="relative mx-auto h-4 w-[106%] -left-[3%] rounded-b-xl bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 shadow-xl border-t border-slate-500">
        {/* Hendidura para abrir la tapa */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-1.5 w-20 rounded-b-md bg-slate-800" />
      </div>

      {/* Sombra proyectada */}
      <div className="mx-auto h-3 w-4/5 rounded-full bg-black/40 blur-md" />
    </div>
  );
}
