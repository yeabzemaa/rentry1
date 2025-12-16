import api from './api';

/**
 * GET /api/products
 * Lists all products. Supports filtering by category.
 * @param {Object} params - Query parameters (e.g. { category: '...' })
 * @returns {Promise<Array>} - Array of products
 */
export async function fetchProducts(params = {}) {
  try {
    const response = await api.get('/products', { params });
    // API returns { success: true, count: number, data: Product[] }
    const data = response.data?.data;
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    // Fallback to mock data if API fails (for development/demo)
    if (import.meta.env.DEV) {
      console.warn('Falling back to mock data');
      return [
        { id: 1, name: 'Mock Product 1', category: 'Electronics', price: 99.99, condition: 'new' },
        { id: 2, name: 'Mock Product 2', category: 'Books', price: 19.99, condition: 'used' },
      ];
    }
    throw error;
  }
}

/**
 * GET /api/products/:id
 * Get a specific product by ID.
 * @param {string|number} id
 * @returns {Promise<Object>} - Product object
 */
export async function getProductById(id) {
  try {
    const response = await api.get(`/products/${id}`);
    // API returns { success: true, data: Product }
    return response.data.data;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    throw error;
  }
}

/**
 * POST /api/products
 * Creates a new product.
 * @param {Object} productData
 * @returns {Promise<Object>} - Created product
 */
export async function createProduct(productData) {
  try {
    const response = await api.post('/products', productData);
    // API returns { success: true, data: Product }
    return response.data.data;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
}

/**
 * PUT /api/products/:id
 * Updates an existing product.
 * @param {string|number} id
 * @param {Object} productData
 * @returns {Promise<Object>} - Updated product
 */
export async function updateProduct(id, productData) {
  try {
    const response = await api.put(`/products/${id}`, productData);
    // API returns { success: true, data: UpdatedProduct }
    return response.data.data;
  } catch (error) {
    console.error(`Error updating product ${id}:`, error);
    throw error;
  }
}

/**
 * DELETE /api/products/:id
 * Soft deletes a product.
 * @param {string|number} id
 * @returns {Promise<boolean>}
 */
export async function deleteProduct(id) {
  try {
    await api.delete(`/products/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting product ${id}:`, error);
    throw error;
  }
}
