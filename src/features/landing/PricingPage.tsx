import { Link } from 'react-router'
import { Badge } from '@/components/Misc'
import { Reveal } from '@/components/motion/Reveal'
import { buttonClass } from '@/components/buttonStyles'
import { SectionHeading } from '@/features/landing/parts'
import { useSession } from '@/lib/session'

const FREE = [
  'Read and download every book',
  'Download notes, past papers and slides',
  'Upload your own resources (PDF, up to 25 MB)',
  'Rate and review books',
  'Download history and upload tracking',
]

// Not built yet and not promised: the page says so next to the list.
const PRO = ['Larger uploads', 'Private reading lists', 'Study groups with shared shelves']

const FAQ = [
  {
    q: 'Is Shelfmallow really free?',
    a: 'Yes. Everything that exists today is in the Free plan: reading, downloading, uploading and reviewing. There is nothing to pay and no card to enter.',
  },
  {
    q: 'Do I need an account?',
    a: 'Not to look around. You can browse and search the whole library without one. A free account is needed to download files, upload resources and write reviews.',
  },
  {
    q: 'What happens when I upload something?',
    a: 'It is marked as pending until a moderator has looked at it. Approved uploads appear in the public list. If one is rejected, you see the reason in My uploads.',
  },
  {
    q: 'What will Pro cost, and when?',
    a: 'Neither is decided yet. Pro is planned for extras on top of the free shelf, and nothing that is free today will move behind it.',
  },
]

function Tick({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 20 20" className={`mt-0.5 size-5 shrink-0 ${className}`} aria-hidden="true">
      <circle cx="10" cy="10" r="10" fill="currentColor" opacity="0.18" />
      <path d="M5.500 10.500l3 3 6-6.500" fill="none" stroke="currentColor" strokeWidth="2.400" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PricingPage() {
  const { status } = useSession()
  const signedIn = status === 'authenticated'

  return (
    <>
      <div className="text-center [&>div]:justify-center [&_p]:mx-auto">
        <SectionHeading
          level="h1"
          eyebrow="Pricing"
          title="Free, and staying free"
          lead="One plan today, and it costs nothing. A second one is being shaped for people who want more."
        />
      </div>

      <div className="mx-auto grid max-w-4xl items-stretch gap-6 md:grid-cols-2">
        <Reveal className="clay-lg tint-brand relative flex flex-col bg-brand-600 p-8 text-white sm:p-10">
          <span aria-hidden="true" className="clay-blob tint-butter absolute -top-5 -right-4 size-16 bg-butter" />
          <h2 className="text-2xl">Free</h2>
          <p className="mt-4 font-display text-6xl font-semibold">
            0<span className="ml-2 text-lg font-medium text-brand-100">forever</span>
          </p>
          <p className="mt-2 text-brand-100">For every student. Everything Shelfmallow does today.</p>
          <ul className="mt-7 flex-1 space-y-3">
            {FREE.map((item) => (
              <li key={item} className="flex gap-2.5 font-semibold">
                <Tick className="text-white" />
                {item}
              </li>
            ))}
          </ul>
          <Link to={signedIn ? '/dashboard' : '/register'} className={buttonClass('secondary', 'lg', 'mt-9 w-full')}>
            {signedIn ? 'Open your dashboard' : 'Create a free account'}
          </Link>
        </Reveal>

        <Reveal delay={0.08} className="clay-lg flex flex-col p-8 sm:p-10">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl">Pro</h2>
            <Badge tone="amber">Coming soon</Badge>
          </div>
          <p className="mt-4 font-display text-6xl font-semibold text-ink/30">–</p>
          <p className="mt-2 text-muted">Extras on top of the free shelf. Ideas we are considering, none final:</p>
          <ul className="mt-7 flex-1 space-y-3">
            {PRO.map((item) => (
              <li key={item} className="flex gap-2.5 font-semibold text-ink/80">
                <Tick className="text-brand-600" />
                {item}
              </li>
            ))}
          </ul>
          <button type="button" disabled className={buttonClass('secondary', 'lg', 'mt-9 w-full')}>
            Not available yet
          </button>
        </Reveal>
      </div>

      <section aria-labelledby="faq-heading" className="mx-auto mt-24 max-w-3xl">
        <h2 id="faq-heading" className="mb-6 text-center text-title">
          Questions, answered
        </h2>
        <div className="space-y-3">
          {FAQ.map((item) => (
            <details key={item.q} className="group clay px-6 open:pb-5">
              <summary className="flex min-h-16 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl font-display text-lg font-medium [&::-webkit-details-marker]:hidden">
                {item.q}
                <span
                  aria-hidden="true"
                  className="clay-sm tint-brand grid size-9 shrink-0 place-items-center bg-brand-100 text-xl text-brand-700 transition-transform group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="max-w-[62ch] text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  )
}
