import { Mallow } from '@/components/illustrations/Mallow'

// Props are drawn in Mallow's 160×160 coordinate space and passed as children.

/** Mallow reading an open book. Sign-in and sign-up. */
export function AuthArt({ className }: { className?: string }) {
  return (
    <Mallow mood="reading" className={className}>
      {/* Open book held in front */}
      <path d="M36 112q22-10 44 0v30q-22-10-44 0z" fill="#8f76f5" />
      <path d="M124 112q-22-10-44 0v30q22-10 44 0z" fill="#6c4de6" />
      <path d="M41 114q19-7 39 1v23q-20-8-39-1z" fill="#fffaf1" />
      <path d="M119 114q-19-7-39 1v23q20-8 39-1z" fill="#f6ead8" />
      <path d="M48 121q12-3 25 1M48 128q12-3 25 1M87 122q12-4 25-1M87 129q12-4 25-1" fill="none" stroke="#c9b8a2" strokeWidth="2.500" strokeLinecap="round" />
      {/* Hands */}
      <ellipse cx="36" cy="124" rx="8" ry="9" fill="#fff6ea" stroke="#e6cdb0" strokeWidth="2" />
      <ellipse cx="124" cy="124" rx="8" ry="9" fill="#fff6ea" stroke="#e6cdb0" strokeWidth="2" />
    </Mallow>
  )
}

/** Mallow asleep next to an empty shelf. Empty lists. */
export function EmptyArt({ className }: { className?: string }) {
  return (
    <Mallow mood="sleepy" className={className}>
      <text x="118" y="40" fontFamily="Fredoka Variable, sans-serif" fontWeight="600" fontSize="18" fill="#8163f2">
        z
      </text>
      <text x="130" y="26" fontFamily="Fredoka Variable, sans-serif" fontWeight="600" fontSize="13" fill="#b9a8f8">
        z
      </text>
    </Mallow>
  )
}

/** Mallow holding a torn page. 404 and crashes. */
export function NotFoundArt({ className }: { className?: string }) {
  return (
    <Mallow mood="puzzled" className={className}>
      <path d="M104 106l34-8 6 30-8 3-5-4-6 6-6-4-7 6z" fill="#fffaf1" stroke="#e6cdb0" strokeWidth="2" strokeLinejoin="round" />
      <text x="114" y="126" fontFamily="Fredoka Variable, sans-serif" fontWeight="600" fontSize="20" fill="#6c4de6" transform="rotate(-12 114 126)">
        ?
      </text>
      <ellipse cx="104" cy="118" rx="8" ry="9" fill="#fff6ea" stroke="#e6cdb0" strokeWidth="2" />
    </Mallow>
  )
}

/** Mallow waving, with a small stack of books. Dashboard greeting. */
export function WelcomeArt({ className }: { className?: string }) {
  return (
    <Mallow className={className}>
      {/* Waving arm */}
      <ellipse cx="132" cy="74" rx="8" ry="12" fill="#fff6ea" stroke="#e6cdb0" strokeWidth="2" transform="rotate(28 132 74)" />
      {/* Book stack */}
      <rect x="6" y="126" width="44" height="13" rx="5" fill="#6c4de6" />
      <rect x="10" y="129" width="38" height="5" rx="2.500" fill="#fffaf1" />
      <rect x="10" y="113" width="38" height="13" rx="5" fill="#ff8fb3" />
      <rect x="13" y="116" width="33" height="5" rx="2.500" fill="#fffaf1" />
      <rect x="8" y="100" width="40" height="13" rx="5" fill="#63d2a9" />
      <rect x="11" y="103" width="35" height="5" rx="2.500" fill="#fffaf1" />
    </Mallow>
  )
}
