import React from 'react'

export default function Dispute() {
const disputes = [
  { id: 'DP-1023', buyer: 'Jane Doe', seller: 'ACME Shop', status: 'Open', amount: '$124.00', createdAt: '2025-11-01' },
  { id: 'DP-1022', buyer: 'John Smith', seller: 'Techify', status: 'Investigating', amount: '$58.90', createdAt: '2025-10-30' },
  { id: 'DP-1019', buyer: 'Amy Lin', seller: 'Urban Gear', status: 'Resolved', amount: '$240.00', createdAt: '2025-10-25' },
  ]

  const statusPill = (s) => {
    const map = {
      Open: 'bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
      Investigating: 'bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      Resolved: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    }
    return map[s] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold flex items-center gap-2">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-rose-500 to-orange-500 text-white">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
            </svg>
          </span>
          Dispute
        </h1>
        <div className="flex items-center gap-2">
          <button className="h-9 px-3 rounded-lg border border-gray-200/70 dark:border-gray-700 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-sm">Export</button>
          <button className="h-9 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm">New Dispute</button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200/70 dark:border-gray-800 bg-white dark:bg-gray-900">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="text-left px-4 py-3">ID</th>
              <th className="text-left px-4 py-3">Buyer</th>
              <th className="text-left px-4 py-3">Seller</th>
              <th className="text-left px-4 py-3">Amount</th>
              <th className="text-left px-4 py-3">Created</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {disputes.map((d) => (
              <tr key={d.id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-4 py-3 font-medium">{d.id}</td>
                <td className="px-4 py-3">{d.buyer}</td>
                <td className="px-4 py-3">{d.seller}</td>
                <td className="px-4 py-3">{d.amount}</td>
                <td className="px-4 py-3">{d.createdAt}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 ${statusPill(d.status)}`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <button className="h-8 px-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
