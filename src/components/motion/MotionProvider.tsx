import { LazyMotion, MotionConfig } from 'motion/react'
import type { ReactNode } from 'react'

// The animation engine arrives in its own chunk after first paint. Until then `m` components
// render as plain elements in their starting pose.
const loadFeatures = () => import('@/components/motion/features').then((module) => module.default)

/**
 * `LazyMotion` + the `m` components ship only the features in `domAnimation` instead of
 * the whole library. `strict` makes a stray full-size `motion.*` import an error.
 * `reducedMotion="user"` turns transforms off for people who asked their system for that.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </LazyMotion>
  )
}
