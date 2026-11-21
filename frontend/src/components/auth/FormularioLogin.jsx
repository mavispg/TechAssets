import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ArrowLeft, Info } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import CampoFormulario from '../shared/CampoFormulario';
import ControlesAccesibilidad from '../shared/ControlesAccesibilidad';

export default function FormularioLogin() {
  const { iniciarSesion } = useAuth();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [cargando, setCargando] = useState(false);
  const [errorCorreo, setErrorCorreo] = useState(null);
  const [errorContrasena, setErrorContrasena] = useState(null);
  const [mostrarAyudaPassword, setMostrarAyudaPassword] = useState(false);

  const validarFormulario = () => {
    let esValido = true;
    setErrorCorreo(null);
    setErrorContrasena(null);

    // Validación de Correo
    if (!correo.trim()) {
      setErrorCorreo('Ingresa tu correo electrónico.');
      esValido = false;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo.trim())) {
        setErrorCorreo('El formato del correo no es válido.');
        esValido = false;
      }
    }

    // Validación de Contraseña
    if (!contrasena) {
      setErrorContrasena('Ingresa tu contraseña.');
      esValido = false;
    }

    return esValido;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    try {
      setCargando(true);
      setErrorCorreo(null);
      setErrorContrasena(null);

      await iniciarSesion(correo.trim(), contrasena);
      navigate('/app');
    } catch (err) {
      const campo = err.data?.campo;
      const mensaje = err.data?.mensaje || err.message || '';

      if (campo === 'correo' || mensaje.toLowerCase().includes('correo')) {
        setErrorCorreo('El correo ingresado es incorrecto o no está registrado.');
      } else if (campo === 'contrasena' || mensaje.toLowerCase().includes('contraseña')) {
        setErrorContrasena('La contraseña es incorrecta.');
      } else {
        // Fallback para credenciales inválidas generales
        setErrorCorreo('El correo ingresado es incorrecto o no está registrado.');
        setErrorContrasena('La contraseña es incorrecta.');
      }
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="w-full md:w-[35%] flex flex-col justify-between p-6 sm:p-8 lg:p-8 xl:p-12 overflow-y-auto bg-white dark:bg-slate-900 transition-colors">
      {/* Controles de accesibilidad superiores y enlace de retorno */}
      <div className="flex items-center justify-between pb-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al inicio</span>
        </Link>
        <ControlesAccesibilidad compact={true} />
      </div>

      {/* Formulario de Acceso */}
      <div className="max-w-md w-full mx-auto my-auto py-4">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="mt-1.5 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Accede con tu cuenta institucional de Innovatech Solutions.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Campo Correo Electrónico */}
          <CampoFormulario
            id="correo"
            label="Correo electrónico"
            tipo="email"
            valor={correo}
            onChange={(e) => {
              setCorreo(e.target.value);
              if (errorCorreo) setErrorCorreo(null);
            }}
            placeholder="usuario@innovatech.pe"
            autoComplete="username"
            error={errorCorreo}
            requerido
          />

          {/* Campo Contraseña */}
          <CampoFormulario
            id="contrasena"
            label="Contraseña"
            tipo="password"
            valor={contrasena}
            onChange={(e) => {
              setContrasena(e.target.value);
              if (errorContrasena) setErrorContrasena(null);
            }}
            placeholder="••••••••"
            autoComplete="current-password"
            error={errorContrasena}
            requerido
          >
            <button
              type="button"
              onClick={() => setMostrarAyudaPassword((v) => !v)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </CampoFormulario>

          {mostrarAyudaPassword && (
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs text-blue-700 dark:text-blue-300 flex items-start gap-2 animate-in fade-in">
              <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
              <span>Para restablecer tu acceso, contacta al Administrador de TI de Innovatech.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={cargando}
            className="w-full mt-4 py-3 px-4 rounded-xl bg-[#0B132B] dark:bg-lime-500 hover:bg-slate-800 dark:hover:bg-lime-400 text-white dark:text-[#0B132B] font-black text-sm shadow-md shadow-slate-900/10 dark:shadow-lime-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>{cargando ? 'Ingresando...' : 'Iniciar Sesión'}</span>
          </button>
        </form>

      </div>

      {/* Pie institucional */}
      <div className="pt-6 text-center text-xs text-slate-400">
        Innovatech Solutions S.A.C.
      </div>
    </div>
  );
}
