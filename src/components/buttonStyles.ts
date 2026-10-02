export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md'

const base =
  'inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60'

// `--clay-tint` colours the drop shadow so each button casts a shadow of its own colour.
const variants: Record<ButtonVariant, string> = {
  primary: 'clay-btn bg-brand-600 text-white hover:bg-brand-500 [--clay-tint:108_77_230]',
  secondary: 'clay-btn bg-white text-brand-700 hover:bg-brand-50',
  danger: 'clay-btn bg-rose-500 text-white hover:bg-rose-400 [--clay-tint:225_29_72]',
  ghost: 'rounded-2xl text-brand-700 transition-colors hover:bg-brand-100',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-5 py-2.5 text-sm',
}

/** Shared by <Button> and by <Link>s that should look like buttons. */
export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = ''): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim()
}
