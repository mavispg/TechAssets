import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit2, ShieldAlert, CheckCircle2, XCircle, Search, RotateCcw } from 'lucide-react';
import ModalUsuario from '../components/ModalUsuario';
import ModalConfirmacion from '../components/ModalConfirmacion';
import AlertBanner from '../components/AlertBanner';
import { usuariosService } from '../services/api';
import Paginador from '../components/shared/Paginador';
import { useAuth } from '../context/AuthContext';

export default function UsuariosPage() {
  const { esAdmin } = useAuth();

  const [usuarios, setUsuarios] = useState([]);
  const [pagina, setPagina] = useState(1);
  const tamano = 10;
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState(null);
  const [exito, setExito] = useState(null);

  // Buscador / Consulta
  const [busqueda, setBusqueda] = useState('');

  // Modales
  const [modalUsuarioAbierto, setModalUsuarioAbierto] = useState(false);
  const [usuarioParaEditar, setUsuarioParaEditar] = useState(null);
  const [usuarioParaAlternarEstado, setUsuarioParaAlternarEstado] = useState(null);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      setError(null);
      const data = await usuariosService.getAll();
      const items = Array.isArray(data) ? data : data.items || [];
      setUsuarios(items);
    } catch (err) {
      setError('Error al obtener lista de usuarios: ' + err.message);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleConfirmarAlternarEstado = async () => {
    if (!usuarioParaAlternarEstado) return;

    try {
      const nuevoEstado = !usuarioParaAlternarEstado.activo;
      await usuariosService.changeState(usuarioParaAlternarEstado.id, nuevoEstado);
      setExito(
        `Usuario '${usuarioParaAlternarEstado.nombres} ${usuarioParaAlternarEstado.apellidos}' ${nuevoEstado ? 'activado' : 'deshabilitado'} correctamente.`
      );
      setUsuarioParaAlternarEstado(null);
      cargarUsuarios();
    } catch (err) {
      setError(err.message || 'Error cambiando estado de usuario.');
      setUsuarioParaAlternarEstado(null);
    }
  };

  // Filtrado por buscador
  const usuariosFiltrados = usuarios.filter((u) => {
    if (!busqueda.trim()) return true;
    const term = busqueda.trim().toLowerCase();
    const nombreCompleto = `${u.nombres} ${u.apellidos}`.toLowerCase();
    const correo = (u.correo || '').toLowerCase();
    const rol = (u.rol || '').toLowerCase();
    const area = (u.area || '').toLowerCase();
    return (
      nombreCompleto.includes(term) ||
      correo.includes(term) ||
      rol.includes(term) ||
      area.includes(term)
    );
  });

  const totalFiltrados = usuariosFiltrados.length;
  const totalPaginas = Math.ceil(totalFiltrados / tamano) || 1;
  const usuariosPaginados = usuariosFiltrados.slice((pagina - 1) * tamano, pagina * tamano);

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            Gestión de usuarios y colaboradores
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Administración de perfiles institucionales, áreas y roles del sistema.
          </p>
        </div>

        {esAdmin && (
          <button
            type="button"
            onClick={() => {
              setUsuarioParaEditar(null);
              setModalUsuarioAbierto(true);
            }}
            className="btn-base btn-primario self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Registrar Usuario</span>
          </button>
        )}
      </div>

      {error && <AlertBanner tipo="error" mensaje={error} onClose={() => setError(null)} />}
      {exito && <AlertBanner tipo="success" mensaje={exito} onClose={() => setExito(null)} />}

      {/* Buscador / Consulta */}
      <div className="bg-white dark:bg-slate-800/90 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPagina(1);
          }}
          className="flex flex-1 items-center gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value);
                setPagina(1);
              }}
              placeholder="Buscar por nombre, correo, área o rol..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-lime-500"
            />
          </div>
          <button
            type="submit"
            className="btn-base btn-primario px-4 py-2 min-h-[38px] text-xs flex items-center gap-1.5 shrink-0"
          >
            <Search className="w-3.5 h-3.5" />
            <span>Consultar</span>
          </button>
          {busqueda && (
            <button
              type="button"
              onClick={() => {
                setBusqueda('');
                setPagina(1);
              }}
              className="btn-base btn-secundario text-xs px-3 py-2 min-h-[38px] flex items-center gap-1 shrink-0"
              title="Limpiar búsqueda"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpiar</span>
            </button>
          )}
        </form>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 uppercase font-semibold bg-slate-50 dark:bg-slate-900/60">
                <th className="py-3 px-4">Colaborador</th>
                <th className="py-3 px-4">Correo Institucional</th>
                <th className="py-3 px-4">Área</th>
                <th className="py-3 px-4">Rol</th>
                <th className="py-3 px-4">Préstamos Activos</th>
                <th className="py-3 px-4">Estado</th>
                {esAdmin && <th className="py-3 px-4 text-right">Acciones</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {usuariosPaginados.length === 0 ? (
                <tr>
                  <td colSpan={esAdmin ? 7 : 6} className="py-10 text-center text-slate-400">
                    No se encontraron usuarios que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                usuariosPaginados.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/20 transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 dark:text-white block">
                        {u.nombres} {u.apellidos}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                      {u.correo}
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 dark:text-slate-300">{u.area}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
                        {u.rol}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`font-bold ${
                          u.prestamosActivosCount > 0
                            ? 'text-blue-600 dark:text-blue-400'
                            : 'text-slate-400'
                        }`}
                      >
                        {u.prestamosActivosCount} activo(s)
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          u.activo
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {u.activo ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {u.activo ? 'Habilitado' : 'Deshabilitado'}
                      </span>
                    </td>
                    {esAdmin && (
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Botón Editar: Azul, 40x40px, icono 20px */}
                          <button
                            type="button"
                            onClick={() => {
                              setUsuarioParaEditar(u);
                              setModalUsuarioAbierto(true);
                            }}
                            className="btn-accion-tabla text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40 border border-transparent hover:border-blue-200 dark:hover:border-blue-900"
                            title="Editar información de usuario"
                            aria-label={`Editar usuario ${u.nombres} ${u.apellidos}`}
                          >
                            <Edit2 className="w-5 h-5" />
                          </button>

                          {/* Botón Alternar Estado: Rojo / Ámbar, 40x40px, icono 20px */}
                          <button
                            type="button"
                            onClick={() => setUsuarioParaAlternarEstado(u)}
                            className="btn-accion-tabla text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 border border-transparent hover:border-rose-200 dark:hover:border-rose-900"
                            title={
                              u.activo
                                ? 'Deshabilitar cuenta institucional'
                                : 'Habilitar cuenta institucional'
                            }
                            aria-label={`${u.activo ? 'Deshabilitar' : 'Habilitar'} a ${u.nombres}`}
                          >
                            <ShieldAlert className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginador obligatorio: 10 filas por página */}
        <Paginador
          pagina={pagina}
          totalPaginas={totalPaginas}
          totalElementos={totalFiltrados}
          tamano={tamano}
          onCambiarPagina={setPagina}
        />
      </div>

      {/* Modal Crear / Editar */}
      <ModalUsuario
        isOpen={modalUsuarioAbierto}
        onClose={() => setModalUsuarioAbierto(false)}
        usuarioParaEditar={usuarioParaEditar}
        onGuardado={() => {
          setExito('Usuario registrado / actualizado exitosamente.');
          cargarUsuarios();
        }}
      />

      {/* Modal Confirmar Alternar Estado */}
      <ModalConfirmacion
        isOpen={Boolean(usuarioParaAlternarEstado)}
        onClose={() => setUsuarioParaAlternarEstado(null)}
        onConfirmar={handleConfirmarAlternarEstado}
        titulo={
          usuarioParaAlternarEstado?.activo
            ? 'Deshabilitar Cuenta de Usuario'
            : 'Habilitar Cuenta de Usuario'
        }
        mensaje={`¿Está seguro de ${
          usuarioParaAlternarEstado?.activo ? 'deshabilitar' : 'habilitar'
        } al colaborador '${usuarioParaAlternarEstado?.nombres} ${
          usuarioParaAlternarEstado?.apellidos
        }'?`}
        textoConfirmar={
          usuarioParaAlternarEstado?.activo ? 'Deshabilitar Usuario' : 'Habilitar Usuario'
        }
        esPeligroso={usuarioParaAlternarEstado?.activo}
      />
    </div>
  );
}
