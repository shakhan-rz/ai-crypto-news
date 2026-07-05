'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { TrendingDown, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

type Price = { usd: number; usd_24h_change: number }

export function CryptoPrices() {
  const [prices, setPrices] = useState<{ bitcoin?: Price; ethereum?: Price } | null>(null)

  useEffect(() => {
    const ctrl = new AbortController()
    const load = () =>
      fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd&include_24hr_change=true',
        { signal: ctrl.signal }
      )
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => data && setPrices(data))
        .catch(() => {})
    load()
    const id = setInterval(load, 60_000)
    return () => {
      clearInterval(id)
      ctrl.abort()
    }
  }, [])

  if (!prices?.bitcoin || !prices?.ethereum) return null

  const coins = [
    { label: 'BTC', price: prices.bitcoin },
    { label: 'ETH', price: prices.ethereum },
  ]

  return (
    <div className="flex gap-2">
      {coins.map(({ label, price }) => {
        const up = price.usd_24h_change >= 0
        return (
          <span
            key={label}
            className="flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white/60 px-3 py-1 text-xs font-medium tabular-nums backdrop-blur-sm dark:border-neutral-800 dark:bg-black/40"
          >
            <span className="text-neutral-500">{label}</span>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={price.usd}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="text-neutral-900 dark:text-neutral-100"
              >
                ${price.usd.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </motion.span>
            </AnimatePresence>
            <span
              className={cn(
                'flex items-center gap-0.5',
                up ? 'text-emerald-500 dark:text-emerald-400' : 'text-red-500 dark:text-red-400'
              )}
            >
              {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {Math.abs(price.usd_24h_change).toFixed(1)}%
            </span>
          </span>
        )
      })}
    </div>
  )
}
