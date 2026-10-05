export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost'
export type ButtonSize = 'sm' | 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 font-bold whitespace-nowrap disabled:cursor-not-allowed disabled:opacity-60'

// Each tint utility colours the drop shadow, so a button casts a shadow of its own colour.
const variants: Record<ButtonVariant, string> = {
  primary: 'clay-btn bg-brand-600 text-white hover:bg-brand-500 tint-brand',
  secondary: 'clay-btn bg-white text-brand-700 hover:bg-brand-50',
  danger: 'clay-btn bg-rose-600 text-white hover:bg-rose-500 [--clay-tint:225_29_72]',
  ghost: 'rounded-2xl text-brand-700 transition-colors hover:bg-brand-100',
}

// `sm` is only for dense places (table rows, pagination). `md` and `lg` are 44px+ tall.
const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-9 px-3.5 py-1.5 text-sm',
  md: 'min-h-11 px-5 py-2.5 text-sm',
  lg: 'min-h-13 rounded-[1.375rem] px-7 py-3.5 text-base',
}

/** Shared by <Button> and by <Link>s that should look like buttons. */
export function buttonClass(variant: ButtonVariant = 'primary', size: ButtonSize = 'md', extra = ''): string {
  return `${base} ${variants[variant]} ${sizes[size]} ${extra}`.trim()
}
