import React from 'react'
import { fetchBuyers } from '../services/buyers'
import { fetchSellers } from '../services/sellers'

export default function Dashboard() {
  const numberFormatter = React.useMemo(() => new Intl.NumberFormat('en-US'), [])
  const [buyerMetrics, setBuyerMetrics] = React.useState({ count: null, loading: true, error: '' })
  const [sellerMetrics, setSellerMetrics] = React.useState({ total: null, verified: null, loading: true, error: '' })

  const messageFromError = React.useCallback((err, fallback) => {
    if (!err) return fallback
    return err?.response?.data?.message || err?.message || fallback
  }, [])

  React.useEffect(() => {
    let alive = true
      ; (async () => {
        try {
          const buyers = await fetchBuyers()
          if (!alive) return
          setBuyerMetrics({ count: buyers.length, loading: false, error: '' })
        } catch (err) {
          if (!alive) return
          const errorMessage = messageFromError(err, 'Failed to load buyers')
          setBuyerMetrics({ count: null, loading: false, error: errorMessage })
        }
      })()
    return () => {
      alive = false
    }
  }, [messageFromError])

  React.useEffect(() => {
    let alive = true
      ; (async () => {
        try {
          const sellers = await fetchSellers()
          if (!alive) return
          const verifiedCount = sellers.filter((seller) => seller.approved).length
          setSellerMetrics({ total: sellers.length, verified: verifiedCount, loading: false, error: '' })
        } catch (err) {
          if (!alive) return
          setSellerMetrics({
            total: null,
            verified: null,
            loading: false,
            error: messageFromError(err, 'Failed to load sellers'),
          })
        }
      })()
    return () => {
      alive = false
    }
  }, [messageFromError])



  const formatCount = React.useCallback(
    (count) => {
      if (typeof count !== 'number') return '—'
      return numberFormatter.format(count)
    },
    [numberFormatter]
  )

  const pendingSellerCount =
    typeof sellerMetrics.total === 'number' && typeof sellerMetrics.verified === 'number'
      ? Math.max(0, sellerMetrics.total - sellerMetrics.verified)
      : null

  const stats = [
    {
      key: 'buyers-registered',
      title: 'Registered Buyers',
      value: formatCount(buyerMetrics.count),
      delta: buyerMetrics.loading ? 'Fetching' : buyerMetrics.error ? 'Unavailable' : 'Live data',
      deltaTone: buyerMetrics.error ? 'down' : 'up',
      icon: UsersIcon,
      accent: 'from-indigo-500 to-purple-500',
      loading: buyerMetrics.loading,
      error: buyerMetrics.error,
    },
    {
      key: 'sellers-total',
      title: 'Registered Sellers',
      value: formatCount(sellerMetrics.total),
      delta: sellerMetrics.loading ? 'Fetching' : sellerMetrics.error ? 'Unavailable' : 'Live data',
      deltaTone: sellerMetrics.error ? 'down' : 'up',
      icon: AddUserIcon,
      accent: 'from-emerald-500 to-teal-500',
      loading: sellerMetrics.loading,
      error: sellerMetrics.error,
    },
    {
      key: 'sellers-verified',
      title: 'Verified Sellers',
      value: formatCount(sellerMetrics.verified),
      delta: sellerMetrics.loading ? 'Fetching' : sellerMetrics.error ? 'Unavailable' : 'Based on seller feed',
      deltaTone: sellerMetrics.error ? 'down' : 'up',
      icon: ShieldIcon,
      accent: 'from-violet-500 to-fuchsia-500',
      loading: sellerMetrics.loading,
      error: sellerMetrics.error,
    },
    {
      key: 'sellers-pending',
      title: 'Pending Seller Approvals',
      value: formatCount(pendingSellerCount),
      delta: sellerMetrics.loading ? 'Fetching' : sellerMetrics.error ? 'Unavailable' : 'Needs review',
      deltaTone: sellerMetrics.error ? 'down' : 'up',
      icon: BoxIcon,
      accent: 'from-sky-500 to-cyan-500',
      loading: sellerMetrics.loading,
      error: sellerMetrics.error,
    },
    {
      key: 'disputes',
      title: 'Disputes',
      value: '—',
      delta: 'Endpoint unavailable',
      deltaTone: 'down',
      icon: AlertIcon,
      accent: 'from-rose-500 to-orange-500',
      loading: false,
      error: 'No disputes endpoint available yet.',
    },
  ]

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5 flex items-center gap-2">
        <SmallGridIcon />
        Overview
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((s) => (
          <StatsCard key={s.key} {...s} />
        ))}
      </div>


    </div>
  )
}

function StatsCard({ title, value, delta, deltaTone = 'up', icon: Icon, accent, loading = false, error = '' }) { // eslint-disable-line no-unused-vars
  const displayValue = loading ? 'Loading...' : value ?? '—'
  const showDelta = Boolean(delta)

  return (
    <div className="relative overflow-hidden rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{title}</div>
          <div className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{displayValue}</div>
          {showDelta && (
            <div
              className={`mt-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${deltaTone === 'up'
                  ? 'text-emerald-700 bg-emerald-50 dark:text-emerald-300/90 dark:bg-emerald-900/30'
                  : 'text-rose-700 bg-rose-50 dark:text-rose-300/90 dark:bg-rose-900/30'
                }`}
            >
              {deltaTone === 'up' ? <ArrowUpIcon /> : <ArrowDownIcon />}
              {delta}
            </div>
          )}
          {error && (
            <p className="mt-2 text-xs text-rose-600 dark:text-rose-300">
              {error}
            </p>
          )}
        </div>
        <div className={`h-12 w-12 rounded-xl bg-gradient-to-tr ${accent} text-white flex items-center justify-center`}>
          <Icon />
        </div>
      </div>
      <div className={`pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-tr ${accent} opacity-10`} />
    </div>
  )
}

function IconBase({ children }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
      {children}
    </svg>
  )
}

function UsersIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 11c1.657 0 3-1.79 3-4s-1.343-4-3-4-3 1.79-3 4 1.343 4 3 4ZM8 13c2.21 0 4-2.015 4-4.5S10.21 4 8 4 4 6.015 4 8.5 5.79 13 8 13Zm0 2c-3.866 0-7 2.239-7 5v2h14v-2c0-2.761-3.134-5-7-5Zm8 1c2.761 0 5 1.79 5 4v2h-6" />
    </IconBase>
  )
}

function AddUserIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 13c2.21 0 4-2.015 4-4.5S10.21 4 8 4 4 6.015 4 8.5 5.79 13 8 13Zm0 2c-3.866 0-7 2.239-7 5v2h10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 10v6M14 13h6" />
    </IconBase>
  )
}

function BoxIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9-4 9 4-9 4-9-4Zm18 0v10l-9 4-9-4V7" />
    </IconBase>
  )
}

function AlertIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
    </IconBase>
  )
}

function ShieldIcon() {
  return (
    <IconBase>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l8 4v6c0 5-3.58 7.5-8 8-4.42-.5-8-3-8-8V7l8-4Z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4" />
    </IconBase>
  )
}

function ArrowUpIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7 7 7M12 3v18" />
    </svg>
  )
}

function ArrowDownIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 14l-7 7-7-7M12 21V3" />
    </svg>
  )
}

function SmallGridIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-6 w-6 text-indigo-600 dark:text-indigo-400">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z" />
    </svg>
  )
}


