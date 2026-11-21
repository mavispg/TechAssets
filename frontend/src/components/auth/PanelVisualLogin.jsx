import React from 'react';
import Marca from '../Marca';
import { imagenes } from '../../assets/imagenes';

export default function PanelVisualLogin() {
  const { loginPanel } = imagenes;

  return (
    <div className="relative hidden md:flex md:w-[65%] flex-col justify-between p-10 lg:p-14 overflow-hidden bg-[#0B132B] text-white select-none">
      {/* Imagen fotográfica a sangre del almacén tecnológico */}
      <img
        src={loginPanel.src}
        width={loginPanel.width}
        height={loginPanel.height}
        alt={loginPanel.alt}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover object-center opacity-40"
      />

      {/* Degradado para garantizar legibilidad y contraste */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0B132B] via-[#0B132B]/80 to-[#0B132B]/90" />

      {/* Cabecera: logo + nombre del sistema */}
      <div className="relative z-10">
        <Marca tamano="grande" textoClaro={true} />
      </div>

      {/* Lema y línea descriptiva concisa */}
      <div className="relative z-10 max-w-lg mb-16 -translate-y-36">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
          Control y trazabilidad de cada activo tecnológico.
        </h2>
        <p className="mt-3 text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
          Gestión inteligente de inventario, autorizaciones y préstamos en tiempo real.
        </p>
      </div>

      {/* Pie sutil */}
      <div className="relative z-10 text-xs text-slate-400">
        Innovatech Solutions S.A.C.
      </div>
    </div>
  );
}
