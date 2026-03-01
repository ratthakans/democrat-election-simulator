
interface TransferSliderProps {
  party: string
  value: number
  onChange: (value: number) => void
}

export default function TransferSlider({ party, value, onChange }: TransferSliderProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-32 flex-shrink-0">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
          {party}
        </label>
      </div>
      <div className="flex-grow flex items-center gap-4">
        <input
          type="range"
          min="0"
          max="100"
          step="1"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-democrat-500"
        />
        <div className="w-12 text-right font-mono text-sm text-gray-600 dark:text-gray-400">
          {value}%
        </div>
      </div>
    </div>
  )
}
