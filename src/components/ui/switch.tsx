"use client"

import { useState, useEffect } from "react"

interface TailwindSwitchProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

export function TailwindSwitch({ checked = false, onCheckedChange, disabled = false }: TailwindSwitchProps) {
  const [isChecked, setIsChecked] = useState(checked)

  useEffect(() => {
    setIsChecked(checked)
  }, [checked])

  const handleToggle = () => {
    if (disabled) return
    const newState = !isChecked
    setIsChecked(newState)
    onCheckedChange?.(newState)
  }

  return (
    <button
      onClick={handleToggle}
      disabled={disabled}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        isChecked ? "bg-blue-600" : "bg-gray-300"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
      role="switch"
      aria-checked={isChecked}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          isChecked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  )
}
