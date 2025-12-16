import React from 'react'
import useAppStore from '../state/store'
import {
  fetchSellers,
  registerSeller,
  updateSeller as updateSellerRequest,
  deleteSeller as deleteSellerRequest,
} from '../services/sellers'

const createFormDefaults = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  password: '',
  address: '',
  license: '',
}

const detailDefaults = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  address: '',
  license: '',
  approved: false,
}

export default function Sellers() {
  const [sellers, setSellers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [feedback, setFeedback] = React.useState('')
  const [creating, setCreating] = React.useState(false)
  const [updating, setUpdating] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState(null)
  const [approvingId, setApprovingId] = React.useState(null)
  const [selectedSeller, setSelectedSeller] = React.useState(null)
  const [detailForm, setDetailForm] = React.useState(detailDefaults)
  const [createForm, setCreateForm] = React.useState(createFormDefaults)
  const [searchTerm, setSearchTerm] = React.useState('')
  const approveSeller = useAppStore((s) => s.approveSeller)

  React.useEffect(() => {
    let alive = true
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const data = await fetchSellers()
        if (!alive) return
        setSellers(data)
      } catch (err) {
        if (!alive) return
        if (err?.response?.status !== 404) {
          setError(err?.message || 'Failed to load sellers')
        } else {
          setSellers([])
        }
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  React.useEffect(() => {
    if (!selectedSeller) {
      setDetailForm(detailDefaults)
      return
    }
    setDetailForm({
      firstName: selectedSeller.firstName || '',
      lastName: selectedSeller.lastName || '',
      username: selectedSeller.username || '',
      email: selectedSeller.email || '',
      address: selectedSeller.address || '',
      license: selectedSeller.license || '',
      approved: Boolean(selectedSeller.approved),
    })
  }, [selectedSeller])

  const resetMessages = () => {
    setError('')
    setFeedback('')
  }

  const sellerFromResponse = (payload, fallback) =>
    payload?.seller || payload?.data?.seller || fallback || null

  const handleCreate = async (event) => {
    event.preventDefault()
    setCreating(true)
    resetMessages()
    try {
      const payload = {
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        username: createForm.username.trim(),
        email: createForm.email.trim(),
        password: createForm.password,
        address: createForm.address.trim(),
        license: createForm.license.trim(),
      }
      const response = await registerSeller(payload)
      const createdSeller =
        sellerFromResponse(response, {
          ...payload,
          id: response?.seller?.id || response?.id || `temp-${Date.now()}`,
          approved: false,
        }) || payload
      setSellers((prev) => [createdSeller, ...prev])
      setCreateForm(createFormDefaults)
      setFeedback(response?.message || 'Seller registered successfully')
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to register seller')
    } finally {
      setCreating(false)
    }
  }

  const handleSelectSeller = (seller) => {
    setSelectedSeller((prev) => (prev?.id === seller.id ? null : seller))
    resetMessages()
  }

  const handleUpdate = async (event) => {
    event.preventDefault()
    if (!selectedSeller) return
    const updates = {}
    ;['firstName', 'lastName', 'username', 'email', 'address', 'license'].forEach((field) => {
      if ((detailForm[field] || '') !== (selectedSeller[field] || '')) {
        updates[field] = typeof detailForm[field] === 'string' ? detailForm[field].trim() : detailForm[field]
      }
    })
    if (detailForm.approved !== Boolean(selectedSeller.approved)) {
      updates.approved = detailForm.approved
    }
    if (!Object.keys(updates).length) {
      setFeedback('No changes to save')
      return
    }
    setUpdating(true)
    resetMessages()
    try {
      const response = await updateSellerRequest(selectedSeller.id, updates)
      const updatedPayload = sellerFromResponse(response, updates) || updates
      const updatedSeller = { ...selectedSeller, ...updatedPayload }
      setSellers((prev) => prev.map((s) => (s.id === selectedSeller.id ? updatedSeller : s)))
      setSelectedSeller(updatedSeller)
      setFeedback(response?.message || 'Seller updated successfully')
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update seller')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (seller) => {
    if (!seller || !window.confirm(`Delete seller "${seller.username || seller.email}"?`)) return
    setDeletingId(seller.id)
    resetMessages()
    try {
      const response = await deleteSellerRequest(seller.id)
      setSellers((prev) => prev.filter((s) => s.id !== seller.id))
      if (selectedSeller?.id === seller.id) {
        setSelectedSeller(null)
      }
      setFeedback(response?.message || 'Seller deleted successfully')
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to delete seller')
    } finally {
      setDeletingId(null)
    }
  }

  const handleApprove = async (seller) => {
    if (!seller || seller.approved) return
    if (!window.confirm(`Approve seller "${seller.username || seller.id}"?`)) return
    resetMessages()
    setApprovingId(seller.id)
    try {
      const result = await approveSeller(seller.id)
      setSellers((prev) => prev.map((s) => (s.id === seller.id ? { ...s, approved: true } : s)))
      if (selectedSeller?.id === seller.id) {
        setSelectedSeller((prev) => (prev ? { ...prev, approved: true } : prev))
      }
      setFeedback(result?.message || 'Seller approved successfully')
    } catch (err) {
      setError(err?.message || 'Failed to approve seller')
    } finally {
      setApprovingId(null)
    }
  }

  const refreshSellers = async () => {
    setLoading(true)
    resetMessages()
    try {
      const data = await fetchSellers()
      setSellers(data)
    } catch (err) {
      if (err?.response?.status !== 404) {
        setError(err?.response?.data?.message || err.message || 'Failed to refresh sellers')
      } else {
        setSellers([])
      }
    } finally {
      setLoading(false)
    }
  }

  const filteredSellers = sellers.filter((seller) => {
    if (!searchTerm.trim()) return true
    const needle = searchTerm.trim().toLowerCase()
    const haystack = `${seller.firstName || ''} ${seller.lastName || ''} ${seller.username || ''} ${seller.email || ''} ${seller.address || ''}`.toLowerCase()
    return haystack.includes(needle)
  })

  const statusPill = (approved) =>
    approved
      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
      : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-violet-500 to-fuchsia-500 text-white">
              <ShieldIcon />
            </span>
            Sellers
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Manage seller onboarding, verification, and compliance.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshSellers}
            className="inline-flex items-center gap-1 h-9 px-3 rounded-lg border border-gray-200/70 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm"
          >
            {loading ? <SpinnerIcon /> : <RefreshIcon />}
            Refresh
          </button>
        </div>
      </div>

      {(error || feedback) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            error
              ? 'bg-rose-50 dark:bg-rose-900/30 border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300'
          }`}
        >
          {error || feedback}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <div className="space-y-6">
          <form onSubmit={handleCreate} className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-4">
            <div>
              <h2 className="text-base font-semibold">Register new seller</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">All fields are required to onboard a seller.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First name" value={createForm.firstName} onChange={(e) => setCreateForm((f) => ({ ...f, firstName: e.target.value }))} />
              <Input label="Last name" value={createForm.lastName} onChange={(e) => setCreateForm((f) => ({ ...f, lastName: e.target.value }))} />
              <Input label="Username" value={createForm.username} onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))} />
              <Input label="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} />
              <Input label="Address" value={createForm.address} onChange={(e) => setCreateForm((f) => ({ ...f, address: e.target.value }))} />
              <Input label="License" value={createForm.license} onChange={(e) => setCreateForm((f) => ({ ...f, license: e.target.value }))} />
              <Input label="Password" type="password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creating ? <SpinnerIcon /> : <PlusIcon />}
              {creating ? 'Registering seller...' : 'Register seller'}
            </button>
          </form>

          <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex flex-col gap-3 border-b border-gray-100 dark:border-gray-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold">Seller directory</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{sellers.length} total sellers</p>
              </div>
              <div className="relative w-full sm:w-64">
                <input
                  className="w-full h-9 rounded-lg border border-gray-200/70 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-8 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  placeholder="Search sellers"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-gray-400">
                  <SearchIcon />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-sm text-gray-600 dark:text-gray-300">Loading sellers…</div>
            ) : filteredSellers.length === 0 ? (
              <div className="p-6 text-sm text-gray-600 dark:text-gray-300">No sellers match this search.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Username</th>
                      <th className="text-left px-4 py-3">Email</th>
                      <th className="text-left px-4 py-3">Address</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSellers.map((seller) => (
                      <tr
                        key={seller.id}
                        className={`border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer ${
                          selectedSeller?.id === seller.id ? 'bg-indigo-50/70 dark:bg-indigo-900/20' : ''
                        }`}
                        onClick={() => handleSelectSeller(seller)}
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {(seller.firstName || seller.lastName) ? `${seller.firstName || ''} ${seller.lastName || ''}`.trim() : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{seller.username || '—'}</td>
                        <td className="px-4 py-3">{seller.email || '—'}</td>
                        <td className="px-4 py-3 truncate max-w-[220px]" title={seller.address || '—'}>
                          {seller.address || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${statusPill(seller.approved)}`}>
                            {seller.approved ? (
                              <>
                                <CheckIcon />
                                Verified
                              </>
                            ) : (
                              <>
                                <ClockIcon />
                                Pending
                              </>
                            )}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            {!seller.approved && (
                              <button
                                onClick={(event) => {
                                  event.stopPropagation()
                                  handleApprove(seller)
                                }}
                                disabled={approvingId === seller.id}
                                className="inline-flex items-center gap-1 h-8 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                              >
                                {approvingId === seller.id ? 'Approving…' : 'Approve'}
                              </button>
                            )}
                            <button
                              onClick={(event) => {
                                event.stopPropagation()
                                handleDelete(seller)
                              }}
                              disabled={deletingId === seller.id}
                              className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-gray-200/70 dark:border-gray-700 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                              {deletingId === seller.id ? 'Deleting…' : 'Delete'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900 p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Seller details</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedSeller ? `Editing seller #${selectedSeller.id}` : 'Select a seller from the list to view or edit details.'}
              </p>
            </div>
            {selectedSeller && (
              <button
                onClick={() => setSelectedSeller(null)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200/70 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          {selectedSeller ? (
            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <Input label="First name" value={detailForm.firstName} onChange={(e) => setDetailForm((f) => ({ ...f, firstName: e.target.value }))} />
              <Input label="Last name" value={detailForm.lastName} onChange={(e) => setDetailForm((f) => ({ ...f, lastName: e.target.value }))} />
              <Input label="Username" value={detailForm.username} onChange={(e) => setDetailForm((f) => ({ ...f, username: e.target.value }))} />
              <Input label="Email" type="email" value={detailForm.email} onChange={(e) => setDetailForm((f) => ({ ...f, email: e.target.value }))} />
              <Input label="Address" value={detailForm.address} onChange={(e) => setDetailForm((f) => ({ ...f, address: e.target.value }))} />
              <Input label="License" value={detailForm.license} onChange={(e) => setDetailForm((f) => ({ ...f, license: e.target.value }))} />
              <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={detailForm.approved}
                  onChange={(e) => setDetailForm((f) => ({ ...f, approved: e.target.checked }))}
                />
                Approved
              </label>
              <button
                type="submit"
                disabled={updating}
                className="inline-flex items-center gap-2 h-10 w-full justify-center rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {updating ? <SpinnerIcon /> : <SaveIcon />}
                {updating ? 'Saving changes...' : 'Save changes'}
              </button>
            </form>
          ) : (
            <div className="mt-6 rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-6 text-sm text-gray-500 dark:text-gray-400">
              Select a seller from the table to view full details and edit profile information.
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function Input({ label, type = 'text', ...props }) {
  return (
    <label className="text-sm font-medium text-gray-700 dark:text-gray-200 space-y-1">
      <span>{label}</span>
      <input
        type={type}
        className="mt-0 block w-full rounded-lg border border-gray-200/70 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
        {...props}
      />
    </label>
  )
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v6c0 5-3.58 7.5-8 8-4.42-.5-8-3-8-8V7l8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10Z" />
    </svg>
  )
}

function SpinnerIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 animate-spin">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v4M12 18v4M6 12H2M22 12h-4M19.07 19.07l-2.83-2.83M19.07 4.93l-2.83 2.83M4.93 4.93l2.83 2.83M4.93 19.07l2.83-2.83" />
    </svg>
  )
}

function RefreshIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v6h6M20 20v-6h-6" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 19A9 9 0 0 1 6 6l4-4m4 0 4 4a9 9 0 0 1 1 13" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Z" />
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5v14l7 4 7-4V5L12 1 5 5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v6H9z" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6l-12 12" />
    </svg>
  )
}

