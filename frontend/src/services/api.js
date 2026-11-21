const API_BASE_URL = 'http://localhost:5265/api';
import { obtenerMensajeError } from './mensajes';

let onUnauthorized = null;
export function configurarSesion(token, callback) {
  onUnauthorized = callback;
  if (token) localStorage.setItem('techasset_token', token);
  else localStorage.removeItem('techasset_token');
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(localStorage.getItem('techasset_token')
        ? { Authorization: `Bearer ${localStorage.getItem('techasset_token')}` }
        : {}),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Si es NoContent (204)
    if (response.status === 204) {
      return null;
    }

    const data = await response.json();

    if (response.status === 401 && onUnauthorized) onUnauthorized();

    if (!response.ok) {
      const error = new Error(obtenerMensajeError(data));
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}

export const equiposService = {
  getAll: async (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.termino) searchParams.append('termino', params.termino);
    if (params.categoria) searchParams.append('categoria', params.categoria);
    if (params.estado) searchParams.append('estado', params.estado);
    // Usar los nombres que el backend espera (Pagina / Tamano en español via query binding)
    if (params.page) searchParams.append('pagina', params.page);
    if (params.pageSize) searchParams.append('tamano', params.pageSize);
    const qs = searchParams.toString();
    const url = `${API_BASE_URL}/equipos${qs ? `?${qs}` : ''}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(localStorage.getItem('techasset_token')
          ? { Authorization: `Bearer ${localStorage.getItem('techasset_token')}` }
          : {}),
      },
    };
    const response = await fetch(url, config);
    if (!response.ok) throw new Error('Error al obtener equipos');
    const data = await response.json();
    // Si el backend devuelve paginado (PaginaResultadoDto con Elementos y TotalElementos)
    if (data && !Array.isArray(data) && data.elementos !== undefined) {
      return { items: data.elementos, total: data.totalElementos };
    }
    // Fallback: array directo — usar X-Total-Count o length
    const items = Array.isArray(data) ? data : data.items || [];
    const totalHeader = parseInt(response.headers.get('X-Total-Count') || '0', 10);
    return { items, total: totalHeader > 0 ? totalHeader : items.length };
  },
  getById: (id) => request(`/equipos/${id}`),
  create: (data) => request('/equipos', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/equipos/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id) => request(`/equipos/${id}`, { method: 'DELETE' }),
  changeState: (id, nuevoEstado, motivo) =>
    request(`/equipos/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ nuevoEstado, motivo }),
    }),
};

export const prestamosService = {
  getAll: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.termino) searchParams.append('termino', params.termino);
    if (params.estadoPrestamo) searchParams.append('estadoPrestamo', params.estadoPrestamo);
    if (params.usuarioId) searchParams.append('usuarioId', params.usuarioId);
    if (params.area) searchParams.append('area', params.area);
    if (params.desde) searchParams.append('desde', params.desde);
    if (params.hasta) searchParams.append('hasta', params.hasta);
    const qs = searchParams.toString();
    return request(`/prestamos${qs ? `?${qs}` : ''}`);
  },
  getById: (id) => request(`/prestamos/${id}`),
  getByUsuario: (usuarioId) => request(`/prestamos/usuario/${usuarioId}`),
  create: (data) => request('/prestamos', { method: 'POST', body: JSON.stringify(data) }),
  approveLoan: (id) => request(`/prestamos/${id}/aprobar`, { method: 'POST' }),
  rejectLoan: (id, motivo) =>
    request(`/prestamos/${id}/rechazar`, {
      method: 'POST',
      body: JSON.stringify({ motivo }),
    }),
  returnLoan: (id, data) =>
    request(`/prestamos/${id}/devolver`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

export const usuariosService = {
  getAll: (soloActivos = null) => {
    const qs = soloActivos !== null ? `?soloActivos=${soloActivos}` : '';
    return request(`/usuarios${qs}`);
  },
  getById: (id) => request(`/usuarios/${id}`),
  create: (data) => request('/usuarios', { method: 'POST', body: JSON.stringify(data) }),
  update: (id, data) => request(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  changeState: (id, activo) =>
    request(`/usuarios/${id}/estado`, {
      method: 'PATCH',
      body: JSON.stringify({ activo }),
    }),
};

export const authService = {
  login: (correo, contrasena) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ correo, contrasena }) }),
  yo: () => request('/auth/yo'),
};

export const dashboardService = {
  getSummary: () => request('/dashboard'),
};

export const reportesService = {
  getIndicadores: () => request('/reportes/indicadores'),
  getDisponibles: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.termino) searchParams.append('termino', params.termino);
    if (params.categoria) searchParams.append('categoria', params.categoria);
    const qs = searchParams.toString();
    return request(`/reportes/disponibles${qs ? `?${qs}` : ''}`);
  },
  getPrestados: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.termino) searchParams.append('termino', params.termino);
    const qs = searchParams.toString();
    return request(`/reportes/prestados${qs ? `?${qs}` : ''}`);
  },
  getByArea: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.desde) searchParams.append('desde', params.desde);
    if (params.hasta) searchParams.append('hasta', params.hasta);
    const qs = searchParams.toString();
    return request(`/reportes/por-area${qs ? `?${qs}` : ''}`);
  },
  getMovimientos: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.equipoId) searchParams.append('equipoId', params.equipoId);
    if (params.desde) searchParams.append('desde', params.desde);
    if (params.hasta) searchParams.append('hasta', params.hasta);
    const qs = searchParams.toString();
    return request(`/reportes/movimientos${qs ? `?${qs}` : ''}`);
  },
  getHistorial: (params = {}) => {
    const searchParams = new URLSearchParams();
    if (params.desde) searchParams.append('desde', params.desde);
    if (params.hasta) searchParams.append('hasta', params.hasta);
    if (params.categoria) searchParams.append('categoria', params.categoria);
    const qs = searchParams.toString();
    return request(`/reportes/historial${qs ? `?${qs}` : ''}`);
  },
};
