import React from 'react'
import { fetchBuyers, createBuyer, updateBuyer, deleteBuyer } from '../services/buyers'

const createFormDefaults = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phoneNumber: '',
  password: '',
}

const detailDefaults = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phoneNumber: '',
  emailVerified: false,
}

export default function Buyers() {
  const [buyers, setBuyers] = React.useState([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState('')
  const [feedback, setFeedback] = React.useState('')

  const [createForm, setCreateForm] = React.useState(createFormDefaults)
  const [creating, setCreating] = React.useState(false)

  const [selectedBuyer, setSelectedBuyer] = React.useState(null)
  const [detailForm, setDetailForm] = React.useState(detailDefaults)
  const [updating, setUpdating] = React.useState(false)
  const [deletingId, setDeletingId] = React.useState(null)

  const [searchTerm, setSearchTerm] = React.useState('')

  React.useEffect(() => {
    let alive = true
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const list = await fetchBuyers()
        if (alive) {
          setBuyers(list)
          if (!list.length) {
            setFeedback('No buyers yet. Use the form to create the first buyer.')
          }
        }
      } catch (err) {
        if (alive) {
          setError(err?.response?.data?.message || err.message || 'Failed to load buyers')
        }
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  React.useEffect(() => {
    if (!selectedBuyer) {
      setDetailForm(detailDefaults)
      return
    }
    setDetailForm({
      firstName: selectedBuyer.firstName || '',
      lastName: selectedBuyer.lastName || '',
      username: selectedBuyer.username || '',
      email: selectedBuyer.email || '',
      phoneNumber: selectedBuyer.phoneNumber || '',
      emailVerified: Boolean(selectedBuyer.emailVerified),
    })
  }, [selectedBuyer])

  const resetFeedback = () => {
    setFeedback('')
    setError('')
  }

  const buyerFromResponse = (payload, fallback) =>
    payload?.buyer || payload?.data?.buyer || fallback || null

  const handleCreate = async (event) => {
    event.preventDefault()
    setCreating(true)
    resetFeedback()
    try {
      const payload = {
        firstName: createForm.firstName.trim(),
        lastName: createForm.lastName.trim(),
        username: createForm.username.trim(),
        email: createForm.email.trim(),
        phoneNumber: createForm.phoneNumber.trim(),
        password: createForm.password,
      }
      const response = await createBuyer(payload)
      const generatedId =
        (typeof crypto !== 'undefined' && crypto.randomUUID && crypto.randomUUID()) || `temp-${Date.now()}`
      const createdBuyer =
        buyerFromResponse(response, {
          ...payload,
          id: response?.buyer?.id || response?.id || generatedId,
          emailVerified: false,
        }) || payload

      setBuyers((prev) => [createdBuyer, ...prev])
      setCreateForm(createFormDefaults)
      setFeedback(response?.message || 'Buyer created successfully')
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to create buyer')
    } finally {
      setCreating(false)
    }
  }

  const handleSelectBuyer = (buyer) => {
    setSelectedBuyer((prev) => (prev?.id === buyer.id ? null : buyer))
    setFeedback('')
    setError('')
  }

  const handleUpdate = async (event) => {
    event.preventDefault()
    if (!selectedBuyer) return

    const updates = {}
    ;['firstName', 'lastName', 'username', 'email', 'phoneNumber', 'emailVerified'].forEach((field) => {
      if (detailForm[field] !== selectedBuyer[field]) {
        updates[field] = typeof detailForm[field] === 'string' ? detailForm[field].trim() : detailForm[field]
      }
    })

    if (!Object.keys(updates).length) {
      setFeedback('No changes to save')
      return
    }

    setUpdating(true)
    resetFeedback()
    try {
      const response = await updateBuyer(selectedBuyer.id, updates)
      const updatedPayload = buyerFromResponse(response, updates) || updates
      const updatedBuyer = {
        ...selectedBuyer,
        ...updatedPayload,
      }

      setBuyers((prev) => prev.map((buyer) => (buyer.id === selectedBuyer.id ? { ...buyer, ...updatedBuyer } : buyer)))
      setSelectedBuyer(updatedBuyer)
      setFeedback(response?.message || 'Buyer updated successfully')
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to update buyer')
    } finally {
      setUpdating(false)
    }
  }

  const handleDelete = async (buyer) => {
    if (!buyer || !window.confirm(`Delete buyer "${buyer.username || buyer.email}"?`)) {
      return
    }
    setDeletingId(buyer.id)
    resetFeedback()
    try {
      const response = await deleteBuyer(buyer.id)
      setBuyers((prev) => prev.filter((b) => b.id !== buyer.id))
      if (selectedBuyer?.id === buyer.id) {
        setSelectedBuyer(null)
      }
      setFeedback(response?.message || 'Buyer deleted successfully')
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to delete buyer')
    } finally {
      setDeletingId(null)
    }
  }

  const refreshBuyers = async () => {
    setLoading(true)
    resetFeedback()
    try {
      const list = await fetchBuyers()
      setBuyers(list)
      if (!list.length) {
        setFeedback('No buyers yet. Use the form to create the first buyer.')
      }
    } catch (err) {
      setError(err?.response?.data?.message || err.message || 'Failed to refresh buyers')
    } finally {
      setLoading(false)
    }
  }

  const filteredBuyers = buyers.filter((buyer) => {
    if (!searchTerm.trim()) return true
    const target = `${buyer.firstName || ''} ${buyer.lastName || ''} ${buyer.username || ''} ${buyer.email || ''} ${buyer.phoneNumber || ''}`.toLowerCase()
    return target.includes(searchTerm.trim().toLowerCase())
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-xl font-semibold flex items-center gap-2">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-sky-500 to-blue-500 text-white">
              <UsersIcon />
            </span>
            Buyers
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-300">Manage buyer accounts, verification status, and contacts.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={refreshBuyers}
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
              <h2 className="text-base font-semibold">Register new buyer</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">All fields are required.</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First name" value={createForm.firstName} onChange={(e) => setCreateForm((f) => ({ ...f, firstName: e.target.value }))} />
              <Input label="Last name" value={createForm.lastName} onChange={(e) => setCreateForm((f) => ({ ...f, lastName: e.target.value }))} />
              <Input label="Username" value={createForm.username} onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))} />
              <Input label="Email" type="email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} />
              <Input label="Phone number" value={createForm.phoneNumber} onChange={(e) => setCreateForm((f) => ({ ...f, phoneNumber: e.target.value }))} />
              <Input label="Password" type="password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} />
            </div>
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto h-10 px-4 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {creating ? <SpinnerIcon /> : <PlusIcon />}
              {creating ? 'Creating buyer...' : 'Create buyer'}
            </button>
          </form>

          <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex flex-col gap-3 border-b border-gray-100 dark:border-gray-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold">Buyer directory</h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">{buyers.length} total buyers</p>
              </div>
              <div className="relative w-full sm:w-64">
                <input
                  className="w-full h-9 rounded-lg border border-gray-200/70 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 pl-8 pr-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50"
                  placeholder="Search buyers"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="pointer-events-none absolute inset-y-0 left-2 flex items-center text-gray-400">
                  <SearchIcon />
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-6 text-sm text-gray-600 dark:text-gray-300">Loading buyers…</div>
            ) : filteredBuyers.length === 0 ? (
              <div className="p-6 text-sm text-gray-600 dark:text-gray-300">No buyers match this search.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800/70 text-gray-700 dark:text-gray-300">
                    <tr>
                      <th className="text-left px-4 py-3">Name</th>
                      <th className="text-left px-4 py-3">Username</th>
                      <th className="text-left px-4 py-3">Email</th>
                      <th className="text-left px-4 py-3">Phone</th>
                      <th className="text-left px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBuyers.map((buyer) => (
                      <tr
                        key={buyer.id}
                        className={`border-t border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 cursor-pointer ${
                          selectedBuyer?.id === buyer.id ? 'bg-indigo-50/70 dark:bg-indigo-900/20' : ''
                        }`}
                        onClick={() => handleSelectBuyer(buyer)}
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-gray-900 dark:text-gray-100">
                            {(buyer.firstName || buyer.lastName) ? `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3">{buyer.username || '—'}</td>
                        <td className="px-4 py-3">{buyer.email || '—'}</td>
                        <td className="px-4 py-3">{buyer.phoneNumber || '—'}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
                              buyer.emailVerified
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                                : 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                            }`}
                          >
                            {buyer.emailVerified ? (
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
                          <button
                            onClick={(event) => {
                              event.stopPropagation()
                              handleDelete(buyer)
                            }}
                            disabled={deletingId === buyer.id}
                            className="inline-flex items-center gap-1 h-8 px-3 rounded-lg border border-gray-200/70 dark:border-gray-700 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 disabled:opacity-60 disabled:cursor-not-allowed"
                          >
                            {deletingId === buyer.id ? 'Deleting…' : 'Delete'}
                          </button>
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
              <h2 className="text-base font-semibold">Buyer details</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {selectedBuyer ? `Editing buyer #${selectedBuyer.id}` : 'Select a buyer to view or edit details.'}
              </p>
            </div>
            {selectedBuyer && (
              <button
                onClick={() => setSelectedBuyer(null)}
                className="h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200/70 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <CloseIcon />
              </button>
            )}
          </div>

          {selectedBuyer ? (
            <form onSubmit={handleUpdate} className="mt-4 space-y-4">
              <Input label="First name" value={detailForm.firstName} onChange={(e) => setDetailForm((f) => ({ ...f, firstName: e.target.value }))} />
              <Input label="Last name" value={detailForm.lastName} onChange={(e) => setDetailForm((f) => ({ ...f, lastName: e.target.value }))} />
              <Input label="Username" value={detailForm.username} onChange={(e) => setDetailForm((f) => ({ ...f, username: e.target.value }))} />
              <Input label="Email" type="email" value={detailForm.email} onChange={(e) => setDetailForm((f) => ({ ...f, email: e.target.value }))} />
              <Input label="Phone number" value={detailForm.phoneNumber} onChange={(e) => setDetailForm((f) => ({ ...f, phoneNumber: e.target.value }))} />
              <label className="flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-200">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                  checked={detailForm.emailVerified}
                  onChange={(e) => setDetailForm((f) => ({ ...f, emailVerified: e.target.checked }))}
                />
                Email verified
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
              Select a buyer from the table to view full details and edit profile information.
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

function UsersIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11c1.657 0 3-1.79 3-4s-1.343-4-3-4-3 1.79-3 4 1.343 4 3 4ZM8 13c2.21 0 4-2.015 4-4.5S10.21 4 8 4 4 6.015 4 8.5 5.79 13 8 13Zm0 2c-3.866 0-7 2.239-7 5v2h14v-2c0-2.761-3.134-5-7-5Zm8 1c2.761 0 5 1.79 5 4v2h-6" />
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

function SaveIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5v14l7 4 7-4V5L12 1 5 5Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 10h6v6H9z" />
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

function CloseIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M18 6l-12 12" />
    </svg>
  )
}

