import api from './api';

function ensureId(id) {
  if (!id) {
    throw new Error('Buyer id required');
  }
}

function extractBuyer(payload) {
  if (!payload) return null;
  if (payload.buyer) return payload.buyer;
  if (payload.data?.buyer) return payload.data.buyer;
  return payload;
}

function extractBuyerList(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.buyers)) return payload.buyers;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.buyers)) return payload.data.buyers;
  return [];
}

export async function fetchBuyers(params = {}) {
  try {
    const { data } = await api.get('/buyers', { params });
    return extractBuyerList(data);
  } catch (err) {
    if (err?.response?.status === 404) {
      return [];
    }
    throw err;
  }
}

export async function fetchBuyer(id) {
  ensureId(id);
  const { data } = await api.get(`/buyers/${id}`);
  return extractBuyer(data);
}

export async function createBuyer(payload = {}) {
  const requiredFields = ['firstName', 'lastName', 'username', 'email', 'phoneNumber', 'password'];
  const missing = requiredFields.filter((field) => !payload[field]);

  if (missing.length) {
    throw new Error('All fields required');
  }

  const { data } = await api.post('/buyers', payload);
  return data;
}

export async function updateBuyer(id, updates = {}) {
  ensureId(id);
  if (!updates || Object.keys(updates).length === 0) {
    throw new Error('No updates provided');
  }
  const { data } = await api.patch(`/buyers/${id}`, updates);
  return data;
}

export async function deleteBuyer(id) {
  ensureId(id);
  try {
    const { data } = await api.delete(`/buyers/${id}`);
    return data;
  } catch (err) {
    const status = err?.response?.status;
    if (status === 401) {
      throw new Error('Unauthorized: Please log in again. Your session may have expired.');
    }
    if (status === 403) {
      throw new Error('Forbidden: Admin privileges required to delete buyers.');
    }
    if (status === 404) {
      throw new Error('Buyer not found.');
    }
    throw err;
  }
}

