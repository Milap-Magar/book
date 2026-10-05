import { useEffect, useState } from 'react'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  label: string
}

/** Text input that reports changes 300 ms after the user stops typing, so each keystroke is not a request. */
export function SearchInput({ value, onChange, placeholder, label }: SearchInputProps) {
  const [text, setText] = useState(value)

  // If the value changes from outside (back button, "clear filters"), follow it.
  const [lastValue, setLastValue] = useState(value)
  if (value !== lastValue) {
    setLastValue(value)
    setText(value)
  }

  useEffect(() => {
    if (text === value) return
    const timer = setTimeout(() => onChange(text), 300)
    return () => clearTimeout(timer)
  }, [text, value, onChange])

  return (
    <input
      type="search"
      aria-label={label}
      value={text}
      onChange={(event) => setText(event.target.value)}
      placeholder={placeholder}
      className="block w-full clay-input placeholder:text-muted/70"
    />
  )
}
