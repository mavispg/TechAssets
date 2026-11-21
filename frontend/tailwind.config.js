/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'Arial',
          'sans-serif',
        ],
      },
      colors: {
        // Paleta oficial Innovatech Solutions
        innovatech: {
          navy: '#0B132B',       // Azul oscuro corporativo oficial del Sidebar y Branding
          slate: '#111827',      // Fondo oscuro secundario
          cardDark: '#1E293B',   // Superficie tarjetas dark
          lime: '#84CC16',       // Verde lima oficial (Accent/Brand)
          limeLight: '#A3E635',  // Verde lima brillante
          limeHover: '#65A30D',  // Verde lima hover
          blue: '#2563EB',       // Azul tecnológico de acento
          sky: '#0284C7',
          gray: {
            50: '#F8FAFC',
            100: '#F1F5F9',
            200: '#E2E8F0',
            300: '#CBD5E1',
            400: '#94A3B8',
            500: '#64748B',
            600: '#475569',
            700: '#334155',
            800: '#1E293B',
            900: '#0F172A',
          },
        },
        brand: {
          primary: '#0B132B',
          accent: '#84CC16',
          action: '#2563EB',
          surface: '#FFFFFF',
          background: '#F8FAFC',
        },
      },
    },
  },
  plugins: [],
};
