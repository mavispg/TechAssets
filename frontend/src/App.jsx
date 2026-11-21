import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import DashboardPage from './pages/DashboardPage';
import EquiposPage from './pages/EquiposPage';
import PrestamosPage from './pages/PrestamosPage';
import UsuariosPage from './pages/UsuariosPage';
import ReportesPage from './pages/ReportesPage';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

function Protegida({ roles }) {
  const { currentUser, cargandoSesion } = useAuth();
  const location = useLocation();

  if (cargandoSesion) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#0B132B] text-white" role="status">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-lime-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-semibold">Cargando sesión...</span>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/ingresar" state={{ from: location }} replace />;
  if (roles && !roles.includes(currentUser.rol)) return <Navigate to="/sin-permiso" replace />;
  return <Outlet />;
}

function SinPermiso() {
  return (
    <main className="grid min-h-screen place-items-center p-6 text-center bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white">
      <div className="max-w-md p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
        <h1 className="text-2xl font-extrabold text-rose-600">Acceso no autorizado</h1>
        <p className="my-4 text-sm text-slate-600 dark:text-slate-300">
          Tu rol actual no dispone de permisos para acceder a este módulo. Consulta con el Administrador del sistema.
        </p>
        <a className="btn-base btn-primario inline-flex" href="/app">
          Volver al panel principal
        </a>
      </div>
    </main>
  );
}

function LayoutPrincipal() {
  const loc = useLocation();
  const [sidebarColapsado, setSidebarColapsado] = useState(false);

  const titulos = {
    '/app': ['Panel de Control', 'Monitoreo en tiempo real de inventario y estado de asignaciones.'],
    '/equipos': ['Catálogo de Equipos', 'Consulta de hardware tecnológico, asignaciones y estado operativo.'],
    '/prestamos': ['Gestión de Préstamos', 'Control de solicitudes, autorizaciones, entregas y devoluciones.'],
    '/usuarios': ['Gestión de Usuarios', 'Administración de cuentas institucionales y roles en Innovatech.'],
    '/reportes': ['Reportes & Analítica', 'Consultas consolidadas, trazabilidad histórica y exportación de datos.'],
  };

  const [titulo, subtitulo] = titulos[loc.pathname] || titulos['/app'];

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-[#F8FAFC] dark:bg-[#0B111E] text-slate-900 dark:text-slate-100 transition-colors">
      <a className="skip-link" href="#contenido">
        Saltar al contenido principal
      </a>

      {/* Sidebar con modo colapsable */}
      <Sidebar
        colapsado={sidebarColapsado}
        onToggle={() => setSidebarColapsado(!sidebarColapsado)}
      />

      {/* Área Principal */}
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          titulo={titulo}
          subtitulo={subtitulo}
          colapsado={sidebarColapsado}
          onToggleSidebar={() => setSidebarColapsado(!sidebarColapsado)}
        />

        <main id="contenido" className="flex-1 overflow-auto p-3 sm:p-5 lg:p-6">
          <div className="w-full max-w-[1600px] mx-auto">
            <Routes>
              <Route path="/app" element={<DashboardPage />} />
              <Route path="/equipos" element={<EquiposPage />} />
              <Route path="/prestamos" element={<PrestamosPage />} />
              <Route path="/usuarios" element={<UsuariosPage />} />
              <Route path="/reportes" element={<ReportesPage />} />
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/ingresar" element={<LoginPage />} />
          <Route path="/sin-permiso" element={<SinPermiso />} />
          <Route element={<Protegida />}>
            <Route element={<LayoutPrincipal />}>
              <Route path="/app" element={<DashboardPage />} />
              <Route path="/equipos" element={<EquiposPage />} />
              <Route path="/prestamos" element={<PrestamosPage />} />
              <Route path="/reportes" element={<ReportesPage />} />
            </Route>
          </Route>
          <Route element={<Protegida roles={['Administrador']} />}>
            <Route element={<LayoutPrincipal />}>
              <Route path="/usuarios" element={<UsuariosPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
