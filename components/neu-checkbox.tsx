import type React from "react"
import { Checkbox } from "@/components/ui/checkbox"

type NeuCheckboxProps = {
  id: string
  label: string
  checked: boolean
  onChange: () => void
}

export const NeuCheckbox: React.FC<NeuCheckboxProps> = ({ id, label, checked, onChange }) => {
  return (
    <label
      htmlFor={id}
      className="flex items-center space-x-3 p-2.5 bg-surface rounded-neu shadow-neu-sm shadow-neu-hover cursor-pointer transition-neu"
    >
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-[#009edb] border-[#d1d9e6] transition-all duration-200"
      />
      <span className="text-xs text-[#2c3e50] font-medium flex-1 text-balance leading-tight">{label}</span>
    </label>
  )
}

export default NeuCheckbox
