import React from 'react';
import PanelVisualLogin from '../components/auth/PanelVisualLogin';
import FormularioLogin from '../components/auth/FormularioLogin';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 dark:bg-slate-950">
      {/* Mitad izquierda (≥ md): Panel visual con imagen a sangre */}
      <PanelVisualLogin />

      {/* Mitad derecha: Formulario sobre fondo del tema */}
      <FormularioLogin />
    </div>
  );
}
