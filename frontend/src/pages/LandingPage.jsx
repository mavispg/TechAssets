import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Target,
  CheckCircle2,
  Users,
  ShieldCheck,
  Wrench,
  ArrowRight,
  Send,
  Building2,
  Mail,
  Phone,
  Laptop,
  Check,
  ChevronRight,
} from 'lucide-react';
import BarraNavegacion from '../components/landing/BarraNavegacion';
import Hero from '../components/landing/Hero';
import { textoLanding } from '../contenido/landing';
import Marca from '../components/Marca';

export default function LandingPage() {
  const [rolActivo, setRolActivo] = useState('admin');

  // Mapa de iconos para la sección de problemas
  const getIconoProblema = (nombre) => {
    switch (nombre) {
      case 'FileSpreadsheet':
        return <FileSpreadsheet className="w-6 h-6 text-rose-500" />;
      case 'AlertTriangle':
        return <AlertTriangle className="w-6 h-6 text-amber-500" />;
      case 'Clock':
        return <Clock className="w-6 h-6 text-blue-500" />;
      default:
        return <ShieldAlert className="w-6 h-6 text-rose-500" />;
    }
  };

  const rolSeleccionado =
    textoLanding.actores.roles.find((r) => r.id === rolActivo) ||
    textoLanding.actores.roles[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B132B] text-slate-900 dark:text-slate-100 selection:bg-lime-500 selection:text-[#0B132B] overflow-x-hidden transition-colors duration-300">
      {/* 1. Barra de Navegación Oficial con Logo y Accesibilidad */}
      <BarraNavegacion />

      {/* 2. Hero Section con Contadores y Caso Académico */}
      <Hero />

      <main id="contenido" className="space-y-24 sm:space-y-32 py-16">
        {/* ================================================================= */}
        {/* SECCIÓN 3: EL PROBLEMA QUE RESUELVE */}
        {/* ================================================================= */}
        <section id="problema" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-lime-600 dark:text-lime-400 uppercase tracking-widest block mb-2">
              {textoLanding.problema.etiqueta}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {textoLanding.problema.titulo}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              {textoLanding.problema.descripcion}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {textoLanding.problema.desafios.map((desafio) => (
              <div
                key={desafio.titulo}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-700/60 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {getIconoProblema(desafio.icono)}
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  {desafio.titulo}
                </h3>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {desafio.descripcion}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECCIÓN 4: OBJETIVOS DEL SISTEMA */}
        {/* ================================================================= */}
        <section
          id="objetivos"
          className="py-16 bg-slate-100/70 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800 scroll-mt-24"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-2">
                {textoLanding.objetivos.etiqueta}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {textoLanding.objetivos.titulo}
              </h2>
            </div>

            {/* Panel de Objetivo General */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#0B132B] text-white shadow-xl mb-12 border border-slate-700 relative overflow-hidden">
              <div className="relative z-10 max-w-3xl">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/20 text-lime-400 text-xs font-bold uppercase tracking-wider mb-3">
                  <Target className="w-3.5 h-3.5" />
                  <span>{textoLanding.objetivos.general.titulo}</span>
                </div>
                <p className="text-base sm:text-lg text-slate-200 font-medium leading-relaxed">
                  {textoLanding.objetivos.general.descripcion}
                </p>
              </div>
            </div>

            {/* Objetivos Específicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {textoLanding.objetivos.especificos.map((obj) => (
                <div
                  key={obj.numero}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm"
                >
                  <span className="text-3xl font-black text-lime-500 block mb-3">
                    {obj.numero}
                  </span>
                  <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">
                    {obj.titulo}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    {obj.descripcion}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECCIÓN 5: ACTORES DEL SISTEMA Y RESPONSABILIDADES */}
        {/* ================================================================= */}
        <section id="actores" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <span className="text-xs font-bold text-lime-600 dark:text-lime-400 uppercase tracking-widest block mb-2">
              {textoLanding.actores.etiqueta}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {textoLanding.actores.titulo}
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
              {textoLanding.actores.descripcion}
            </p>
          </div>

          {/* Selector de Roles */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-200/80 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 gap-1.5 overflow-x-auto max-w-full">
              {textoLanding.actores.roles.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRolActivo(r.id)}
                  className={`px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
                    rolActivo === r.id
                      ? 'bg-[#0B132B] dark:bg-lime-500 text-white dark:text-[#0B132B] shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {r.rol}
                </button>
              ))}
            </div>
          </div>

          {/* Tarjeta de Detalle del Rol Activo */}
          <div className="max-w-4xl mx-auto bg-white dark:bg-slate-800/90 rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-slate-700/80 shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-700">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-lime-600 dark:text-lime-400">
                  {rolSeleccionado.subtitulo}
                </span>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                  {rolSeleccionado.rol}
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 self-start sm:self-auto">
                Permisos Controlados por RBAC
              </span>
            </div>

            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300 font-medium">
              {rolSeleccionado.descripcion}
            </p>

            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">
                Funciones y Privilegios Asignados:
              </h4>
              <ul className="space-y-2.5">
                {rolSeleccionado.permisos.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-xs sm:text-sm text-slate-700 dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-lime-500 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECCIÓN 6: FLUJO DEL PRÉSTAMO (4 ETAPAS) */}
        {/* ================================================================= */}
        <section
          id="flujo"
          className="py-16 bg-slate-100/70 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800 scroll-mt-24"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-14">
              <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest block mb-2">
                {textoLanding.flujo.etiqueta}
              </span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {textoLanding.flujo.titulo}
              </h2>
              <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-300">
                {textoLanding.flujo.descripcion}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
              {textoLanding.flujo.pasos.map((paso) => (
                <div
                  key={paso.numero}
                  className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="w-10 h-10 rounded-xl bg-[#0B132B] dark:bg-lime-500 text-white dark:text-[#0B132B] font-black text-base flex items-center justify-center shadow-sm">
                        {paso.numero}
                      </span>
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {paso.etapa}
                      </span>
                    </div>
                    <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 block mb-1">
                      Responsable: {paso.responsable}
                    </span>
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white mb-2">
                      {paso.titulo}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {paso.descripcion}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECCIÓN 7: BENEFICIOS INSTITUCIONALES */}
        {/* ================================================================= */}
        <section id="beneficios" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold text-lime-600 dark:text-lime-400 uppercase tracking-widest block mb-2">
              {textoLanding.beneficios.etiqueta}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
              {textoLanding.beneficios.titulo}
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {textoLanding.beneficios.items.map((item, idx) => (
              <div
                key={idx}
                className="p-6 rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-sm hover:border-lime-500 transition-colors"
              >
                <div className="w-10 h-10 rounded-xl bg-lime-500/15 text-lime-600 dark:text-lime-400 flex items-center justify-center font-bold mb-4">
                  <Check className="w-5 h-5" />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-2">
                  {item.titulo}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.descripcion}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* ================================================================= */}
        {/* SECCIÓN 8: CONTACTO Y MESA DE AYUDA TI */}
        {/* ================================================================= */}
        <section id="contacto" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 scroll-mt-24">
          <div className="rounded-3xl bg-[#0B132B] text-white p-8 sm:p-12 shadow-xl border border-slate-800 grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-xs font-bold text-lime-400 uppercase tracking-widest block mb-2">
                {textoLanding.contacto.etiqueta}
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
                {textoLanding.contacto.titulo}
              </h2>
              <p className="mt-3 text-sm text-slate-300 leading-relaxed max-w-lg">
                {textoLanding.contacto.descripcion}
              </p>

              <div className="mt-6 space-y-3 text-xs sm:text-sm">
                <div className="flex items-center gap-3 text-slate-200">
                  <Building2 className="w-4 h-4 text-lime-400 shrink-0" />
                  <span>{textoLanding.contacto.empresa} &bull; {textoLanding.contacto.area}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <Mail className="w-4 h-4 text-lime-400 shrink-0" />
                  <span className="font-mono">{textoLanding.contacto.correo}</span>
                </div>
                <div className="flex items-center gap-3 text-slate-200">
                  <Clock className="w-4 h-4 text-lime-400 shrink-0" />
                  <span>{textoLanding.contacto.horario}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center p-8 rounded-2xl bg-white/5 border border-white/10 text-center">
              <Marca oscuro={true} compacta={false} className="mb-4" />
              <h3 className="text-base font-bold">Acceso Directo a la Plataforma</h3>
              <p className="text-xs text-slate-400 mt-1 mb-6">
                Ingresa con tu correo institucional (@innovatech.pe)
              </p>
              <Link
                to="/ingresar"
                className="btn-base px-6 py-3 min-h-[46px] rounded-xl bg-lime-500 hover:bg-lime-400 text-[#0B132B] font-black text-sm shadow-lg shadow-lime-500/20 transition-all flex items-center gap-2"
              >
                <span>Acceder a TechAsset</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Pie de Página Oficial (Sin logo según requerimiento) */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-[#070D1E] py-8 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p dangerouslySetInnerHTML={{ __html: textoLanding.pie.creditos }} />
          <a href="#contenido" className="hover:text-slate-900 dark:hover:text-white font-semibold">
            Volver arriba &uarr;
          </a>
        </div>
      </footer>
    </div>
  );
}
