// API base URL - proxied by Vite
const API_URL = '/api/autenticacin_y_gestin_de_usuarios';

// Generic request helper
async function request<T>(
  path: string,
  options: {
    method?: string;
    queryParams?: Record<string, string | number | undefined>;
    body?: unknown;
  } = {},
): Promise<T> {
  const { method = 'GET', queryParams, body } = options;

  // Build URL with query params
  let url = `${API_URL}${path}`;
  if (queryParams) {
    const searchParams = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, String(value));
      }
    });
    const qs = searchParams.toString();
    if (qs) url += `?${qs}`;
  }

  const headers: Record<string, string> = {};
  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const message =
      errorData?.detail || errorData?.message || `HTTP ${response.status}: ${response.statusText}`;
    throw new Error(message);
  }

  return response.json();
}

// ─── TypeScript Interfaces ───────────────────────────────────────────────────

export interface UsuarioResponse {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  esta_bloqueado: boolean;
  fecha_creacion: string;
  empresa?: string;
}

export interface TransportistaResponse {
  id: number;
  email: string;
  nombre: string;
  empresa?: string;
  esta_bloqueado: boolean;
  fecha_creacion: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  usuario: UsuarioResponse;
}

export interface MensajeResponse {
  mensaje: string;
}

export interface BloquearResponse {
  mensaje: string;
  usuario_id: number;
  bloqueado: boolean;
}

export interface TransportistaListParams {
  search?: string;
  nombre?: string;
  email?: string;
  estado?: string;
}

// ─── Auth Endpoints ──────────────────────────────────────────────────────────

export async function authRegisterTransportista(): Promise<UsuarioResponse> {
  return request<UsuarioResponse>(`/auth/register/transportista`, {
    method: 'POST',
  });
}

export async function authRegisterOperador(): Promise<UsuarioResponse> {
  return request<UsuarioResponse>(`/auth/register/operador`, {
    method: 'POST',
  });
}

export async function authLogin(): Promise<LoginResponse> {
  return request<LoginResponse>(`/auth/login`, {
    method: 'POST',
  });
}

export async function authPasswordResetRequest(): Promise<MensajeResponse> {
  return request<MensajeResponse>(`/auth/password-reset/request`, {
    method: 'POST',
  });
}

export async function authPasswordResetConfirm(): Promise<MensajeResponse> {
  return request<MensajeResponse>(`/auth/password-reset/confirm`, {
    method: 'POST',
  });
}

export async function authLogout(): Promise<MensajeResponse> {
  return request<MensajeResponse>(`/auth/logout`, {
    method: 'POST',
  });
}

// ─── Transportistas Endpoints ────────────────────────────────────────────────

export async function getTransportistas(
  params?: TransportistaListParams,
): Promise<TransportistaResponse[]> {
  return request<TransportistaResponse[]>(`/transportistas`, {
    queryParams: params as Record<string, string | number | undefined>,
  });
}

export async function blockTransportista(usuarioId: number): Promise<BloquearResponse> {
  const path = '/transportistas/' + usuarioId + '/block';
  return request<BloquearResponse>(path, { method: 'POST' });
}

export async function unblockTransportista(usuarioId: number): Promise<BloquearResponse> {
  const path = '/transportistas/' + usuarioId + '/unblock';
  return request<BloquearResponse>(path, { method: 'POST' });
}

// ─── Session ─────────────────────────────────────────────────────────────────

export async function validateSession(): Promise<UsuarioResponse> {
  return request<UsuarioResponse>(`/auth/session/validate`);
}
