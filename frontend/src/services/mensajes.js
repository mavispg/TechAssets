const mensajesPorRegla = {
  'RN-01': 'Este equipo ya tiene un préstamo activo.',
  'RN-02': 'Este equipo está en mantenimiento y no se puede prestar.',
  'RN-03': 'Este equipo está dado de baja y no se puede prestar.',
  'RN-04': 'La fecha de devolución debe ser posterior a la fecha de préstamo.',
  'RN-05': 'El usuario seleccionado no está activo y no puede recibir préstamos.',
  'RN-06': 'Este equipo tiene préstamos anteriores y no se puede eliminar.',
  'RN-07': 'Ya existe un equipo con ese código patrimonial.',
  'RN-08': 'Ya existe un usuario con ese correo electrónico.',
  'RN-09': 'Solo una persona administradora puede cambiar el acceso de usuarios.',
  'RN-10': 'Escribe una observación de al menos 5 caracteres sobre el estado del equipo.',
};

export function obtenerMensajeError(datos) {
  if (datos?.codigoRegla && mensajesPorRegla[datos.codigoRegla])
    return mensajesPorRegla[datos.codigoRegla];
  return String(
    datos?.mensaje || 'No se pudo completar la solicitud. Revisa los datos e inténtalo de nuevo.'
  )
    .replace(/RN-\w+\s*:\s*/g, '')
    .trim();
}
