import * as m from 'motion/react-m'
import type { ReactNode } from 'react'

interface RevealProps {
  children: ReactNode
  className?: string
  /** Seconds. Use small steps (0.06–0.1) to stagger siblings. */
  delay?: number
  as?: 'div' | 'li' | 'section'
}

/** Fades and rises into place the first time it scrolls into view, then never animates again. */
export function Reveal({ children, className, delay = 0, as = 'div' }: RevealProps) {
  const Tag = m[as]
  return (
    <Tag
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -60px 0px' }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </Tag>
  )
}
