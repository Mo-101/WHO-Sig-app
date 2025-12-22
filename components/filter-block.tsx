"use client"

import type React from "react"
import { NeuCheckbox } from "@/components/neu-checkbox"

type FilterBlockProps = {
  title: string
  icon: string
  items: string[]
  selectedItems: string[]
  onToggle: (value: string) => void
  maxHeight?: string
}

export const FilterBlock: React.FC<FilterBlockProps> = ({
  title,
  icon,
  items,
  selectedItems,
  onToggle,
  maxHeight = "max-h-48",
}) => {
  return (
    <div className="mb-4">
      <h3 className="text-[10px] font-bold text-[#0056b3] uppercase tracking-wide mb-3 flex items-center gap-2">
        <span className="text-base">{icon}</span> {title}
      </h3>
      <div className={`space-y-2 overflow-y-auto custom-scrollbar pr-2 ${maxHeight}`}>
        {items.map((item) => (
          <NeuCheckbox
            key={item}
            id={`filter-${title}-${item}`}
            label={item}
            checked={selectedItems.includes(item)}
            onChange={() => onToggle(item)}
          />
        ))}
      </div>
    </div>
  )
}

export default FilterBlock
