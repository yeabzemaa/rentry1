import React from 'react'
import { useNavigate } from 'react-router-dom'
import { fetchProducts, deleteProduct } from '../services/products'

export default function Products() {
  const navigate = useNavigate()
  const [products, setProducts] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [deletingId, setDeletingId] = React.useState(null)

  React.useEffect(() => {
    let alive = true
      ; (async () => {
        try {
          const data = await fetchProducts()
          if (alive) setProducts(Array.isArray(data) ? data : [])
        } catch (err) {
          console.error('Failed to load products', err)
          if (alive) setError('Failed to load products')
        } finally {
          if (alive) setLoading(false)
        }
      })()
    return () => {
      alive = false
    }
  }, [])

  const onDelete = async (id) => {
    const product = products.find((p) => p.id === id)
    const name = product ? product.name : id
    if (!window.confirm(`Delete product "${name}"?`)) return
    setDeletingId(id)
    const ok = await deleteProduct(id)
    if (ok) setProducts((arr) => arr.filter((p) => p.id !== id))
    setDeletingId(null)
  }



  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-500 text-white">
            <BoxIcon />
          </span>
          Products
        </h1>
        <div className="flex items-center gap-2">
          <button className="h-9 px-3 rounded-lg border border-gray-200/70 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">Export</button>
          <button onClick={() => navigate('/products/new')} className="h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm">Add Product</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900">
        {loading ? (
          <div className="p-6 text-sm text-gray-600 dark:text-gray-300">Loading products…</div>
        ) : error ? (
          <div className="p-6 text-sm text-rose-600">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-6 text-sm text-gray-600 dark:text-gray-300">No products found.</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300">
              <tr>
                <th className="text-left px-4 py-3">ID</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Category</th>
                <th className="text-left px-4 py-3">Price</th>
                <th className="text-left px-4 py-3">Condition</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                if (!p) return null;
                return (
                  <tr key={p.id || Math.random()} className="border-t border-gray-100 dark:border-gray-800">
                    <td className="px-4 py-3 font-medium">{p.id || '-'}</td>
                    <td className="px-4 py-3">{p.name || 'Untitled'}</td>
                    <td className="px-4 py-3">{p.category || '-'}</td>
                    <td className="px-4 py-3">${(Number(p.price) || 0).toFixed(2)}</td>
                    <td className="px-4 py-3 capitalize">{p.condition || '-'}</td>

                    <td className="px-4 py-3 text-right">
                      <button onClick={() => navigate(`/products/edit/${p.id}`)} className="h-8 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 mr-1">Edit</button>
                      <button
                        onClick={() => onDelete(p.id)}
                        disabled={deletingId === p.id}
                        className="inline-flex items-center gap-1 h-8 px-2 rounded-lg text-rose-600 hover:bg-rose-50 disabled:opacity-60 dark:hover:bg-rose-900/20"
                      >
                        <TrashIcon />
                        Delete
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

function BoxIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9-4 9 4-9 4-9-4Zm18 0v10l-9 4-9-4V7" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14" />
    </svg>
  )
}
