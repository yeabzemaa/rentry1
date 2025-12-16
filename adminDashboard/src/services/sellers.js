import api from './api';

const requiredSellerFields = [
  'firstName',
  'lastName',
  'username',
  'email',
  'password',
  'address',
  'license',
];

function ensureSellerId(id) {
  if (!id) {
    throw new Error('Seller id required');
  }
}

function normalizeSeller(payload) {
  if (!payload) return null;
  if (payload.seller) return payload.seller;
  if (payload.data?.seller) return payload.data.seller;
  return payload;
}

function normalizeSellerList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.sellers)) return payload.sellers;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.sellers)) return payload.data.sellers;
  return [];
}

export async function registerSeller(payload = {}) {
  const missing = requiredSellerFields.filter((field) => !payload[field]);
  if (missing.length) {
    throw new Error('All fields required');
  }
  const { data } = await api.post('/sellers/register', payload);
  return data;
}

export async function fetchSellers(params = {}) {
  try {
    const { data } = await api.get('/sellers', { params });
    return normalizeSellerList(data);
  } catch (err) {
    const status = err?.response?.status;
    if (status === 404) {
      return [];
    }
    if (status === 401) {
      throw new Error('Unauthorized: Please log in again. Your session may have expired.');
    }
    if (status === 403) {
      throw new Error('Forbidden: Admin privileges required to view sellers.');
    }
    throw err;
  }
}

export async function fetchSeller(id) {
  ensureSellerId(id);
  try {
    const { data } = await api.get(`/sellers/${encodeURIComponent(id)}`);
    return normalizeSeller(data);
  } catch (err) {
    const status = err?.response?.status;
    if (status === 401) {
      throw new Error('Unauthorized: Please log in again. Your session may have expired.');
    }
    if (status === 403) {
      throw new Error('Forbidden: You do not have permission to view this seller.');
    }
    if (status === 404) {
      throw new Error('Seller not found.');
    }
    throw err;
  }
}

export async function updateSeller(id, updates = {}) {
  ensureSellerId(id);
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('No updates provided');
  }
  try {
    const { data } = await api.put(`/sellers/${encodeURIComponent(id)}`, updates);
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 401) {
      throw new Error('Unauthorized: Please log in again. Your session may have expired.');
    }
    if (status === 403) {
      throw new Error('Forbidden: You do not have permission to update this seller.');
    }
    if (status === 404) {
      throw new Error('Seller not found.');
    }
    throw err;
  }
}

export async function deleteSeller(id) {
  ensureSellerId(id);
  try {
    const { data } = await api.delete(`/sellers/${encodeURIComponent(id)}`);
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 401) {
      throw new Error('Unauthorized: Please log in again. Your session may have expired.');
    }
    if (status === 403) {
      throw new Error('Forbidden: Admin privileges required to delete sellers.');
    }
    if (status === 404) {
      throw new Error('Seller not found.');
    }
    throw err;
  }
}
