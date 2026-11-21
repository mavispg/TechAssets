// Contenido oficial del Caso Práctico Académico de Innovatech Solutions S.A.C.
// Estructurado por: Problema, Objetivos, Alcance, Actores, Flujo de Préstamo, Beneficios y Contacto.

export const textoLanding = {
  navegacion: [
    { nombre: 'Inicio', href: '#hero' },
    { nombre: 'Objetivos', href: '#objetivos' },
    { nombre: 'Actores', href: '#actores' },
    { nombre: 'Flujo del Préstamo', href: '#flujo' },
    { nombre: 'Beneficios', href: '#beneficios' },
    { nombre: 'Contacto', href: '#contacto' },
  ],
  botonIngresar: 'Ingresar al Sistema',
  hero: {
    etiqueta: 'Caso Práctico &bull; Gestión Integral de Activos TI',
    titularParte1: 'Trazabilidad y control absoluto de cada equipo tecnológico, ',
    palabraResaltada: 'siempre.',
    subtitulo:
      'Plataforma institucional diseñada para Innovatech Solutions S.A.C. que automatiza el ciclo de vida, las solicitudes, aprobaciones y devoluciones de hardware con auditoría en tiempo real.',
    botonPrincipal: 'Iniciar Sesión',
    botonSecundario: 'Ver Caso Académico',
  },
  estadisticasHero: [
    { valor: '100%', etiqueta: 'Trazabilidad Patrimonial', desc: 'Registro auditado de cada cambio de estado' },
    { valor: '0', etiqueta: 'Traslapes de Asignación', desc: 'Validaciones que impiden doble préstamo' },
    { valor: '3', etiqueta: 'Roles Definidos', desc: 'Admin, Responsable TI y Colaborador' },
    { valor: '10', etiqueta: 'Equipos Catálogados', desc: 'Laptops, monitores, proyectores y más' },
  ],
  problema: {
    etiqueta: 'Diagnóstico Operativo',
    titulo: 'El problema que resuelve TechAsset',
    descripcion:
      'En Innovatech Solutions S.A.C., el control manual y disperso del equipamiento tecnológico ocasionaba deficiencias críticas en la continuidad de las operaciones:',
    desafios: [
      {
        icono: 'FileSpreadsheet',
        titulo: 'Hojas de cálculo vulnerables',
        descripcion:
          'Registros en Excel desactualizados, propensos a sobreescrituras accidentales y sin trazabilidad de quién modificó los datos.',
      },
      {
        icono: 'AlertTriangle',
        titulo: 'Falta de control en devoluciones',
        descripcion:
          'Préstamos extendidos sin fecha de retorno programada, activos que se daban por perdidos y demoras sin responsables asignados.',
      },
      {
        icono: 'Clock',
        titulo: 'Tiempos muertos en soporte',
        descripcion:
          'Equipos con fallas técnicas que se reasignaban por error a otros colaboradores por no existir un canal de inspección técnica previa.',
      },
      {
        icono: 'ShieldX',
        titulo: 'Cero auditoría patrimonial',
        descripcion:
          'Incertidumbre gerencial sobre la ubicación exacta, el valor de custodia y el estado de operatividad de los activos de la empresa.',
      },
    ],
  },
  objetivos: {
    etiqueta: 'Fundamentación del Proyecto',
    titulo: 'Objetivos del sistema',
    general: {
      titulo: 'Objetivo General',
      descripcion:
        'Desarrollar e implementar un sistema web integral de gestión y control de activos tecnológicos para Innovatech Solutions S.A.C., que centralice el inventario patrimonial, automatice el flujo de préstamos y garantice la trazabilidad de cada equipo mediante roles y reportabilidad en tiempo real.',
    },
    especificos: [
      {
        numero: '01',
        titulo: 'Catálogo Patrimonial Centralizado',
        descripcion:
          'Registrar y clasificar todo el hardware corporativo con código patrimonial único, número de serie, marca, modelo y estado operativo en tiempo real.',
      },
      {
        numero: '02',
        titulo: 'Flujo de Aprobación Sistemático',
        descripcion:
          'Gestionar el ciclo de vida del préstamo mediante solicitudes que inician como Pendientes, pasando por evaluación técnica de aprobación o rechazo.',
      },
      {
        numero: '03',
        titulo: 'Trazabilidad y Bitácora Histórica',
        descripcion:
          'Registrar cada evento de préstamo, devolución o cambio a mantenimiento en una bitácora inmutable con fecha, responsable y observaciones técnicas.',
      },
      {
        numero: '04',
        titulo: 'Reportes y Analítica Ejecutiva',
        descripcion:
          'Generar indicadores clave de rotación de hardware, demanda por áreas y exportación de reportes estructurados en formatos PDF y CSV.',
      },
    ],
  },
  actores: {
    etiqueta: 'Arquitectura de Permisos por Rol',
    titulo: 'Actores del sistema y responsabilidades',
    descripcion:
      'El sistema implementa control de acceso basado en roles (RBAC), asegurando que cada persona acceda estrictamente a las funciones que le corresponden:',
    roles: [
      {
        id: 'admin',
        rol: 'Administrador',
        subtitulo: 'Gobierno y Control Gerencial',
        color: 'blue',
        descripcion:
          'Responsable del gobierno global del sistema, gestión de cuentas institucionales y supervisión ejecutiva.',
        permisos: [
          'Gestión completa de usuarios institucionales (crear, editar, activar/deshabilitar).',
          'Alta, modificación y baja de activos tecnológicos en el catálogo patrimonial.',
          'Autorización o rechazo de solicitudes de préstamos.',
          'Recepción técnica de devoluciones e inspección de estado.',
          'Acceso total a todos los reportes analíticos y exportación a PDF/CSV.',
        ],
      },
      {
        id: 'tech',
        rol: 'Responsable de Tecnología',
        subtitulo: 'Custodio Técnico del Inventario',
        color: 'lime',
        descripcion:
          'Encargado operativo del almacén técnico, custodia de hardware y validación de operatividad de los activos.',
        permisos: [
          'Gestión operativa del catálogo de equipos (registro, edición, actualización de estado).',
          'Evaluación técnica de solicitudes: Aprobar o Rechazar préstamos de hardware.',
          'Registro de devoluciones con observaciones sobre la condición del equipo recibido.',
          'Consulta de indicadores de uso, rotación de activos y bitácora de movimientos.',
          'Exportación de reportes de auditoría y disponibilidad.',
        ],
      },
      {
        id: 'colab',
        rol: 'Colaborador',
        subtitulo: 'Usuario Solicitante',
        color: 'emerald',
        descripcion:
          'Personal de las distintas áreas de Innovatech que requiere equipamiento para sus labores operativas.',
        permisos: [
          'Consulta de equipos disponibles en tiempo real (código, marca, modelo y categoría).',
          'Registro de nuevas solicitudes de préstamo para asignación temporal.',
          'Consulta exclusiva de sus préstamos activos y su historial personal.',
          'Vista protegida: no visualiza información privada ni asignaciones de otros colaboradores.',
        ],
      },
    ],
  },
  flujo: {
    etiqueta: 'Ciclo de Vida Operativo',
    titulo: 'Flujo del préstamo paso a paso',
    descripcion:
      'Un proceso estandarizado de 4 fases que elimina la pérdida de equipos y garantiza entregas oportunas:',
    pasos: [
      {
        numero: '1',
        etapa: 'Solicitud',
        responsable: 'Colaborador',
        titulo: 'Registro de la solicitud',
        descripcion:
          'El colaborador selecciona un equipo en estado Disponible, define la fecha de devolución esperada y registra sus observaciones de requerimiento.',
      },
      {
        numero: '2',
        etapa: 'Evaluación',
        responsable: 'Responsable de TI / Admin',
        titulo: 'Revisión técnica y autorización',
        descripcion:
          'El Responsable de Tecnología evalúa la solicitud pendiente. Si la aprueba, el equipo pasa automáticamente a estado Prestado; si la rechaza, permanece Disponible.',
      },
      {
        numero: '3',
        etapa: 'Custodia',
        responsable: 'Colaborador',
        titulo: 'Uso y vigencia del préstamo',
        descripcion:
          'El equipo permanece asignado formalmente al colaborador, con alertas visuales de vencimiento en el panel de préstamos activos.',
      },
      {
        numero: '4',
        etapa: 'Cierre',
        responsable: 'Responsable de TI / Admin',
        titulo: 'Recepción y retorno a stock',
        descripcion:
          'Al momento de la entrega, se registra la condición física del hardware y el equipo regresa inmediatamente a estado Disponible para nuevos préstamos.',
      },
    ],
  },
  beneficios: {
    etiqueta: 'Impacto en la Organización',
    titulo: 'Beneficios comprobados para Innovatech',
    items: [
      {
        titulo: 'Cero Pérdidas Patrimoniales',
        descripcion: 'Cada equipo está vinculado permanentemente a un colaborador responsable con fecha límite.',
      },
      {
        titulo: 'Mantenimientos Preventivos a Tiempo',
        descripcion: 'Detección temprana de fallas y retiro oportuno de equipos a estado En Mantenimiento.',
      },
      {
        titulo: 'Reportabilidad en Segundos',
        descripcion: 'Descarga de reportes auditables en PDF con marca de agua y CSV para análisis contable.',
      },
      {
        titulo: 'Decisiones Basadas en Datos Reales',
        descripcion: 'Métricas de los equipos más solicitados y las áreas con mayor consumo tecnológico.',
      },
    ],
  },
  contacto: {
    etiqueta: 'Soporte y Mesa de Ayuda',
    titulo: '¿Necesitas asistencia técnica?',
    descripcion:
      'Para soporte sobre el sistema TechAsset, renovación de credenciales o consultas de asignación de hardware:',
    empresa: 'Innovatech Solutions S.A.C.',
    correo: 'soporte@innovatech.pe',
    area: 'Departamento de Tecnologías de la Información',
    horario: 'Lunes a Viernes: 08:30 - 18:30 hrs',
  },
  pie: {
    creditos: 'TechAsset &bull; Sistema de Gestión de Activos Tecnológicos &bull; Innovatech Solutions S.A.C.',
  },
};
