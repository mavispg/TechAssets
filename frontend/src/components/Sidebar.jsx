import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Laptop,
  ArrowLeftRight,
  Users,
  FileBarChart,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Marca from './Marca';

export default function Sidebar({ colapsado = false, onToggle }) {
  const { esAdmin } = useAuth();

  // Menú sin la etiqueta redundante "ADMIN"
  const gruposNavegacion = [
    {
      titulo: 'Módulos Principales',
      items: [
        { nombre: 'Inicio', ruta: '/app', icono: LayoutDashboard },
        { nombre: 'Equipos', ruta: '/equipos', icono: Laptop },
        { nombre: 'Préstamos', ruta: '/prestamos', icono: ArrowLeftRight },
      ],
    },
    {
      titulo: 'Gestión & Reportes',
      items: [
        ...(esAdmin ? [{ nombre: 'Usuarios', ruta: '/usuarios', icono: Users }] : []),
        { nombre: 'Reportes', ruta: '/reportes', icono: FileBarChart },
      ],
    },
  ];

  return (
    <aside
      className={`shrink-0 flex flex-col bg-[#0B132B] text-slate-100 border-r border-slate-800/80 transition-all duration-300 ease-in-out z-30 select-none ${
        colapsado ? 'w-full md:w-20' : 'w-full md:w-64'
      }`}
      aria-label="Navegación lateral"
    >
      {/* Cabecera del Sidebar: Logo + nombre del sistema (o solo icono cuando colapsado) */}
      <div className="flex items-center px-4 py-3 border-b border-slate-800/80 min-h-[70px]">
        <div className={`flex items-center ${colapsado ? 'justify-center w-full' : 'flex-1 min-w-0'}`}>
          <Marca tamano="normal" soloIcono={colapsado} textoClaro={true} />
        </div>
      </div>

      {/* Menú de Navegación Vertical Agrupado */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {gruposNavegacion.map((grupo) => (
          <div key={grupo.titulo} className="space-y-1">
            {!colapsado && (
              <span className="px-3 text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-2">
                {grupo.titulo}
              </span>
            )}

            <div className="space-y-1">
              {grupo.items.map(({ nombre, ruta, icono: Icono }) => (
                <NavLink
                  key={ruta}
                  to={ruta}
                  end
                  title={colapsado ? nombre : undefined}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all group ${
                      isActive
                        ? 'bg-lime-500 text-[#0B132B] shadow-md shadow-lime-500/20 font-black'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                    } ${colapsado ? 'justify-center px-2' : ''}`
                  }
                >
                  <Icono className="w-5 h-5 shrink-0" />
                  {!colapsado && <span className="truncate">{nombre}</span>}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Pie del Menú: Reemplazo del bloque de usuario por estado operativo discreto */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/40">
        <div className={`flex items-center gap-2 ${colapsado ? 'justify-center' : 'px-2'}`}>
          <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse shrink-0" />
          {!colapsado && (
            <span className="text-[11px] font-semibold text-slate-400 truncate tracking-wide">
              Sistema operativo en línea
            </span>
          )}
        </div>
      </div>
    </aside>
  );
}
