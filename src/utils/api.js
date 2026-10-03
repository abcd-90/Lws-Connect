const API_BASE = '/api';

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('lws_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { error: text || 'Server returned an invalid non-JSON response.' };
  }

  if (!response.ok) {
    throw new Error(data.error || data.message || 'An error occurred while processing request.');
  }

  return data;
}

export async function uploadFile(file) {
  const token = localStorage.getItem('lws_token');
  const formData = new FormData();
  formData.append('attachment', file);

  const response = await fetch(`${API_BASE}/chat/upload`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    body: formData
  });

  let data;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = { error: text || 'File upload failed with invalid response.' };
  }

  if (!response.ok) {
    throw new Error(data.error || 'File upload failed');
  }

  return data;
}
