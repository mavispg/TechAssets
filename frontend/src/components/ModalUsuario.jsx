import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, Eye, EyeOff } from 'lucide-react';
import Modal from './Modal';
import AlertBanner from './AlertBanner';
import { usuariosService } from '../services/api';

const DOMINIO = '@innovatech.pe';

function limpiarParaCorreo(texto) {
  if (!texto) return '';
  return texto
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

function generarPrefijoCorreo(nombreStr, apellidoStr) {
  const primerNombre = limpiarParaCorreo((nombreStr || '').trim().split(/\s+/)[0] || '');
  const primerApellido = limpiarParaCorreo((apellidoStr || '').trim().split(/\s+/)[0] || '');
  if (primerNombre && primerApellido) {
    return `${primerNombre}.${primerApellido}`;
  }
  return primerNombre || primerApellido;
}

export default function ModalUsuario({ isOpen, onClose, usuarioParaEditar = null, onGuardado }) {
  const [nombres, setNombres] = useState('');
  const [apellidos, setApellidos] = useState('');
  const [correoPrefijo, setCorreoPrefijo] = useState('');
  const [passwordInicial, setPasswordInicial] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [correoModificadoManualmente, setCorreoModificadoManualmente] = useState(false);
  const [area, setArea] = useState('Desarrollo de Software');
  const [rol, setRol] = useState('Colaborador');
  const [activo, setActivo] = useState(true);

  const [cargando, setCargando] = useState(false);
  const [errorValidacion, setErrorValidacion] = useState(null);

  const esEdicion = Boolean(usuarioParaEditar);
  const requisitosPassword = [
    { texto: 'Mínimo 8 caracteres', cumple: passwordInicial.length >= 8 },
    { texto: 'Una letra mayúscula (A-Z)', cumple: /[A-Z]/.test(passwordInicial) },
    { texto: 'Una letra minúscula (a-z)', cumple: /[a-z]/.test(passwordInicial) },
    { texto: 'Un número (0-9)', cumple: /[0-9]/.test(passwordInicial) },
    { texto: 'Un símbolo (ej. ! @ # $ %)', cumple: /[^A-Za-z0-9\s]/.test(passwordInicial) },
  ];
  const passwordValida = requisitosPassword.every((requisito) => requisito.cumple);

  const areasDisponibles = [
    'Tecnologías de Información',
    'Soporte Técnico',
    'Desarrollo de Software',
    'Diseño UX/UI',
    'Administración y Finanzas',
    'Marketing Digital',
    'Recursos Humanos',
  ];

  const rolesDisponibles = ['Administrador', 'Responsable de Tecnología', 'Colaborador'];

  useEffect(() => {
    if (isOpen) {
      setErrorValidacion(null);
      setPasswordInicial('');
      setMostrarPassword(false);
      if (usuarioParaEditar) {
        setNombres(usuarioParaEditar.nombres || '');
        setApellidos(usuarioParaEditar.apellidos || '');
        const prefijoExistente = (usuarioParaEditar.correo || '').replace(/@innovatech\.pe$/i, '');
        setCorreoPrefijo(prefijoExistente);
        setCorreoModificadoManualmente(true);
        setArea(usuarioParaEditar.area || 'Desarrollo de Software');
        setRol(usuarioParaEditar.rol || 'Colaborador');
        setActivo(usuarioParaEditar.activo ?? true);
      } else {
        setNombres('');
        setApellidos('');
        setCorreoPrefijo('');
        setCorreoModificadoManualmente(false);
        setArea('Desarrollo de Software');
        setRol('Colaborador');
        setActivo(true);
      }
    }
  }, [isOpen, usuarioParaEditar]);

  const handleNombresChange = (val) => {
    setNombres(val);
    if (!esEdicion && !correoModificadoManualmente) {
      setCorreoPrefijo(generarPrefijoCorreo(val, apellidos));
    }
  };

  const handleApellidosChange = (val) => {
    setApellidos(val);
    if (!esEdicion && !correoModificadoManualmente) {
      setCorreoPrefijo(generarPrefijoCorreo(nombres, val));
    }
  };

  const handleCorreoPrefijoChange = (val) => {
    setCorreoModificadoManualmente(true);
    const limpio = val.replace(/[^a-zA-Z0-9._-]/g, '').toLowerCase();
    setCorreoPrefijo(limpio);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorValidacion(null);

    if (!nombres.trim() || nombres.trim().length < 2) {
      setErrorValidacion('El nombre debe tener al menos 2 caracteres.');
      return;
    }

    if (!apellidos.trim() || apellidos.trim().length < 2) {
      setErrorValidacion('Los apellidos deben tener al menos 2 caracteres.');
      return;
    }

    const prefijo = correoPrefijo.trim().toLowerCase();
    if (!prefijo || prefijo.length < 2) {
      setErrorValidacion('Debe ingresar un prefijo de correo válido (ej. roberto.vargas).');
      return;
    }

    if (!esEdicion && !passwordValida) {
      setErrorValidacion('Completa todos los requisitos de la contraseña.');
      return;
    }

    const correoCompleto = `${prefijo}${DOMINIO}`;

    try {
      setCargando(true);
      if (esEdicion) {
        await usuariosService.update(usuarioParaEditar.id, {
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          area,
          rol,
          activo,
        });
      } else {
        await usuariosService.create({
          nombres: nombres.trim(),
          apellidos: apellidos.trim(),
          correo: correoCompleto,
          area,
          rol,
          passwordInicial,
        });
      }

      onGuardado();
      onClose();
    } catch (err) {
      setErrorValidacion(err.message || 'Error guardando usuario.');
    } finally {
      setCargando(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      titulo={
        esEdicion
          ? `Editar Usuario: ${usuarioParaEditar.nombreCompleto || usuarioParaEditar.nombres}`
          : 'Registrar Usuario'
      }
      subtitulo="Innovatech Solutions S.A.C. – Gestión de Usuarios"
      maxWidth="max-w-xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorValidacion && (
          <AlertBanner
            tipo="error"
            mensaje={errorValidacion}
            onClose={() => setErrorValidacion(null)}
          />
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombres *
            </label>
            <input
              type="text"
              value={nombres}
              onChange={(e) => handleNombresChange(e.target.value)}
              placeholder="Ej. Roberto"
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Apellidos *
            </label>
            <input
              type="text"
              value={apellidos}
              onChange={(e) => handleApellidosChange(e.target.value)}
              placeholder="Ej. Vargas Silva"
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
              required
            />
          </div>
        </div>

        {/* Correo Electrónico con sufijo fijo @innovatech.pe */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Correo Electrónico Institucional *
          </label>
          <div className="flex rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden focus-within:ring-2 focus-within:ring-violet-500">
            <input
              type="text"
              value={correoPrefijo}
              onChange={(e) => handleCorreoPrefijoChange(e.target.value)}
              disabled={esEdicion}
              placeholder="primernombre.primerapellido"
              className="flex-1 min-w-0 text-sm bg-transparent text-slate-900 dark:text-slate-100 p-2.5 outline-none font-mono disabled:opacity-75 disabled:cursor-not-allowed"
              required
            />
            <span className="inline-flex items-center px-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs sm:text-sm font-semibold select-none border-l border-slate-300 dark:border-slate-700 font-mono">
              @innovatech.pe
            </span>
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">
            Autocompletado: primer nombre y primer apellido. Puedes editar la parte anterior al @.
          </span>
        </div>

        {!esEdicion && (
          <div>
            <label htmlFor="passwordInicial" className="mb-1 block text-sm font-semibold text-slate-700 dark:text-slate-300">
              Contraseña *
            </label>
            <div className="relative">
              <input
                id="passwordInicial"
                type={mostrarPassword ? 'text' : 'password'}
                value={passwordInicial}
                onChange={(e) => setPasswordInicial(e.target.value)}
                autoComplete="new-password"
                minLength={8}
                maxLength={100}
                required
                aria-describedby="passwordInicialRequisitos"
                className="w-full rounded-lg border border-slate-300 bg-white p-2.5 pr-12 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-violet-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
              <button
                type="button"
                onClick={() => setMostrarPassword((visible) => !visible)}
                aria-label={mostrarPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="absolute inset-y-0 right-0 flex min-h-11 w-11 items-center justify-center text-slate-600 dark:text-slate-300"
              >
                {mostrarPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <ul id="passwordInicialRequisitos" className="mt-2 space-y-1" aria-live="polite" aria-label="Requisitos de la contraseña">
              {requisitosPassword.map(({ texto, cumple }) => {
                const Icono = cumple ? CheckCircle2 : Circle;
                return (
                  <li key={texto} className={`flex items-center gap-2 text-sm ${cumple ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'}`}>
                    <Icono size={18} aria-hidden="true" />
                    <span>{texto}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Área */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Área Operativa *
            </label>
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
            >
              {areasDisponibles.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>

          {/* Rol */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Rol en el Sistema *
            </label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value)}
              className="w-full text-sm rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2.5 focus:ring-2 focus:ring-violet-500 outline-none"
            >
              {rolesDisponibles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {esEdicion && (
          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="chkActivo"
              checked={activo}
              onChange={(e) => setActivo(e.target.checked)}
              className="w-4 h-4 rounded text-violet-600 focus:ring-violet-500 border-slate-300"
            />
            <label
              htmlFor="chkActivo"
              className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Usuario Activo (Habilitado para solicitar préstamos)
            </label>
          </div>
        )}

        {/* Botones de Acción */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={cargando}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={cargando}
            className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 shadow-md shadow-violet-600/30 transition-all"
          >
            {cargando ? 'Guardando...' : esEdicion ? 'Actualizar Usuario' : 'Registrar Usuario'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
