import React from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import { fetchBuyers } from '../services/buyers'
import { fetchSellers } from '../services/sellers'
import { fetchProducts } from '../services/products'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d']

export default function Analytics() {
  const [sellerMetrics, setSellerMetrics] = React.useState({ total: null, verified: null, loading: true, error: '' })
  const [productMetrics, setProductMetrics] = React.useState({ categories: [], conditions: [], prices: [], loading: true, error: '' })
  const [userChart, setUserChart] = React.useState({ data: [], note: '', loading: true, error: '' })

  const messageFromError = React.useCallback((err, fallback) => {
    if (!err) return fallback
    return err?.response?.data?.message || err?.message || fallback
  }, [])

  React.useEffect(() => {
    let alive = true
    setUserChart((prev) => ({ ...prev, loading: true, error: '' }))
      ; (async () => {
        try {
          const buyers = await fetchBuyers()
          if (!alive) return
          const chartData = computeWeeklyUserSeries(buyers)
          setUserChart({ ...chartData, loading: false, error: '' })
        } catch (err) {
          if (!alive) return
          const errorMessage = messageFromError(err, 'Failed to load buyers')
          setUserChart((prev) => ({ ...prev, loading: false, error: errorMessage }))
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

  React.useEffect(() => {
    let alive = true
      ; (async () => {
        try {
          const products = await fetchProducts()
          if (!alive) return
          
          // Compute category distribution
          const categoryMap = {}
          const conditionMap = {}
          const priceRanges = { 'Under $50': 0, '$50 - $200': 0, '$200 - $500': 0, '$500+': 0 }

          products.forEach(p => {
            // Categories
            const cat = p.category || 'Uncategorized'
            categoryMap[cat] = (categoryMap[cat] || 0) + 1

            // Conditions
            const cond = p.condition ? (p.condition.charAt(0).toUpperCase() + p.condition.slice(1)) : 'Unknown'
            conditionMap[cond] = (conditionMap[cond] || 0) + 1

            // Prices
            const price = Number(p.price) || 0
            if (price < 50) priceRanges['Under $50']++
            else if (price < 200) priceRanges['$50 - $200']++
            else if (price < 500) priceRanges['$200 - $500']++
            else priceRanges['$500+']++
          })
          
          const categories = Object.entries(categoryMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)

          const conditions = Object.entries(conditionMap)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)

          const prices = Object.entries(priceRanges).map(([name, value]) => ({ name, value }))
            
          setProductMetrics({ categories, conditions, prices, loading: false, error: '' })
        } catch (err) {
          if (!alive) return
          setProductMetrics({ categories: [], conditions: [], prices: [], loading: false, error: messageFromError(err, 'Failed to load products') })
        }
      })()
    return () => {
      alive = false
    }
  }, [messageFromError])

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-5 flex items-center gap-2">
        <AnalyticsIcon />
        Analytics
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="New Users (Last 8 Weeks)" subtitle="Registrations">
          {userChart.loading ? (
            <ChartPlaceholder message="Loading user activity…" />
          ) : userChart.error ? (
            <ChartPlaceholder message={userChart.error} tone="error" />
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={userChart.data}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              {userChart.note && (
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 text-center">
                  {userChart.note}
                </p>
              )}
            </div>
          )}
        </ChartCard>

        <ChartCard title="Product Categories" subtitle="Distribution">
          {productMetrics.loading ? (
            <ChartPlaceholder message="Loading product data…" />
          ) : productMetrics.error ? (
            <ChartPlaceholder message={productMetrics.error} tone="error" />
          ) : productMetrics.categories.length === 0 ? (
            <ChartPlaceholder message="No products found" />
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productMetrics.categories}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {productMetrics.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="middle" align="right" layout="vertical" iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <ChartCard title="Product Conditions" subtitle="Inventory Mix">
          {productMetrics.loading ? (
            <ChartPlaceholder message="Loading product data…" />
          ) : productMetrics.error ? (
            <ChartPlaceholder message={productMetrics.error} tone="error" />
          ) : productMetrics.conditions.length === 0 ? (
            <ChartPlaceholder message="No products found" />
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={productMetrics.conditions}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {productMetrics.conditions.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Price Distribution" subtitle="Product Pricing">
          {productMetrics.loading ? (
            <ChartPlaceholder message="Loading product data…" />
          ) : productMetrics.error ? (
            <ChartPlaceholder message={productMetrics.error} tone="error" />
          ) : productMetrics.prices.length === 0 ? (
            <ChartPlaceholder message="No products found" />
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productMetrics.prices}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                  />
                  <Tooltip 
                    cursor={{ fill: '#f3f4f6' }}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Seller Status" subtitle="Verification">
          {sellerMetrics.loading ? (
            <ChartPlaceholder message="Loading seller data…" />
          ) : sellerMetrics.error ? (
            <ChartPlaceholder message={sellerMetrics.error} tone="error" />
          ) : (
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Verified', value: sellerMetrics.verified },
                      { name: 'Pending/Unverified', value: (sellerMetrics.total || 0) - (sellerMetrics.verified || 0) }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                  >
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
        
        <ChartCard title="Sales Trend (Mock)" subtitle="Last 6 Months">
           <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={[
                    { name: 'Jan', value: 4000 },
                    { name: 'Feb', value: 3000 },
                    { name: 'Mar', value: 2000 },
                    { name: 'Apr', value: 2780 },
                    { name: 'May', value: 1890 },
                    { name: 'Jun', value: 2390 },
                  ]}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="value" stroke="#8884d8" fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
           </div>
        </ChartCard>
      </div>
    </div>
  )
}

function AnalyticsIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5 text-gray-600 dark:text-gray-300">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3v18h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M7 15v3M11 9v9M15 6v12M19 12v6" />
    </svg>
  )
}

function ChartCard({ title, subtitle, children }) {
  return (
    <div className="rounded-2xl border border-gray-200/70 dark:border-gray-800/70 bg-white dark:bg-gray-900 p-4 shadow-sm">
      <div className="mb-3">
        <div className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</div>
        <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</div>
      </div>
      {children}
    </div>
  )
}

function ChartPlaceholder({ message, tone = 'muted' }) {
  const toneClass =
    tone === 'error' ? 'text-rose-600 dark:text-rose-300' : 'text-gray-500 dark:text-gray-400'
  return (
    <div className={`h-[240px] flex items-center justify-center text-sm ${toneClass}`}>
      {message}
    </div>
  )
}

function computeWeeklyUserSeries(buyers = [], weeks = 8) {
  const weekFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' })
  const baseStart = startOfWeek(new Date())
  const ranges = []
  for (let i = weeks - 1; i >= 0; i--) {
    const start = new Date(baseStart)
    start.setDate(start.getDate() - i * 7)
    const end = new Date(start)
    end.setDate(end.getDate() + 7)
    ranges.push({ startMs: start.getTime(), endMs: end.getTime(), labelStart: start })
  }
  const counts = new Array(weeks).fill(0)
  let undatedCount = 0
  const earliestStart = ranges[0]?.startMs ?? 0
  const latestEnd = ranges[ranges.length - 1]?.endMs ?? earliestStart

  buyers.forEach((buyer) => {
    const createdAt =
      parseDateValue(buyer?.createdAt) ||
      parseDateValue(buyer?.created_at) ||
      parseDateValue(buyer?.createdOn) ||
      parseDateValue(buyer?.created_on) ||
      parseDateValue(buyer?.created) ||
      parseDateValue(buyer?.createdDate) ||
      parseDateValue(buyer?.created_date) ||
      parseDateValue(buyer?.registeredAt) ||
      parseDateValue(buyer?.registered_at) ||
      parseDateValue(buyer?.joinedAt) ||
      parseDateValue(buyer?.joined_at) ||
      parseDateValue(buyer?.timestamp)

    if (!createdAt) {
      undatedCount += 1
      return
    }

    const time = createdAt.getTime()
    if (!Number.isFinite(time)) {
      undatedCount += 1
      return
    }

    if (time < earliestStart) {
      counts[0] += 1
      return
    }

    if (time >= latestEnd) {
      counts[counts.length - 1] += 1
      return
    }

    for (let i = 0; i < ranges.length; i++) {
      const range = ranges[i]
      if (time >= range.startMs && time < range.endMs) {
        counts[i] += 1
        return
      }
    }

    undatedCount += 1
  })

  if (undatedCount) {
    counts[counts.length - 1] += undatedCount
  }

  const labels = ranges.map((range) => weekFormatter.format(range.labelStart))
  const note = undatedCount ? 'Buyers without timestamps are counted in the most recent week.' : ''
  
  const data = labels.map((label, i) => ({
    name: label,
    value: counts[i]
  }))
  
  return { data, note }
}

function parseDateValue(value) {
  if (value === null || value === undefined) return null

  if (value instanceof Date) {
    const time = value.getTime()
    return Number.isNaN(time) ? null : new Date(time)
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    let ms = value
    if (value < 1e12) {
      ms = value * 1000
    }
    const date = new Date(ms)
    return Number.isNaN(date.getTime()) ? null : date
  }

  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return null
    if (/^\d+$/.test(trimmed)) {
      return parseDateValue(Number(trimmed))
    }
    const date = new Date(trimmed)
    return Number.isNaN(date.getTime()) ? null : date
  }

  return null
}

function startOfWeek(date) {
  const result = new Date(date)
  const day = result.getDay()
  const diff = (day + 6) % 7
  result.setDate(result.getDate() - diff)
  result.setHours(0, 0, 0, 0)
  return result
}
