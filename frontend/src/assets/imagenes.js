// Centralización de rutas de imágenes (Parte A - Sección 2.4)
// Permite reemplazar cualquier recurso visual sin modificar componentes.

import heroLanding from './hero-landing.webp';
import loginPanel from './login-panel.webp';
import fondoCta from './fondo-cta.webp';
import capturaTableroOscuro from './captura-tablero-oscuro.webp';
import capturaTableroClaro from './captura-tablero-claro.webp';

export const imagenes = {
  heroLanding: {
    src: heroLanding,
    width: 1920,
    height: 1080,
    alt: 'Equipos tecnológicos organizados en una plataforma de inventario y trazabilidad',
  },
  loginPanel: {
    src: loginPanel,
    width: 1200,
    height: 1600,
    alt: 'Almacén organizado de activos de tecnologías de la información con iluminación violeta',
  },
  fondoCta: {
    src: fondoCta,
    width: 1920,
    height: 800,
    alt: 'Fondo abstracto de tecnología en gradiente morado con puntos de luz',
  },
  capturaTableroOscuro: {
    src: capturaTableroOscuro,
    width: 1400,
    height: 850,
    alt: 'Vista previa del tablero de TechAsset en tema oscuro mostrando los seis indicadores clave',
  },
  capturaTableroClaro: {
    src: capturaTableroClaro,
    width: 1400,
    height: 850,
    alt: 'Vista previa del tablero de TechAsset en tema claro mostrando los seis indicadores clave',
  },
};

export default imagenes;
