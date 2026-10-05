import type { GlyphName, Tone } from '@/components/illustrations/ClayIcon'

/** The order tiles cycle through when a list needs a different colour per item. */
export const TONES: Tone[] = ['brand', 'pink', 'butter', 'mint', 'sky', 'peach']

// Category slug → glyph. Unknown categories (admins can add any) fall back to a book.
const genreGlyphs: Record<string, GlyphName> = {
  programming: 'code',
  'computer-science': 'chip',
  mathematics: 'math',
  science: 'flask',
  business: 'chart',
  literature: 'quill',
}

export function genreGlyph(slug: string): GlyphName {
  return genreGlyphs[slug] ?? 'book'
}
