const API_BASE = process.env.NEXT_PUBLIC_API_BACKEND || 'http://localhost:5000';

export async function apiRequest(path, { token, method = 'GET', body, headers = {}, raw = false } = {}) {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      ...(raw ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers
    },
    body: body ? (raw ? body : JSON.stringify(body)) : undefined
  });

  const payload = await response
    .json()
    .catch(() => ({ error: `HTTP ${response.status}` }));

  if (!response.ok) {
    throw new Error(payload.error || payload.message || 'Request failed');
  }

  return payload;
}

export { API_BASE };
