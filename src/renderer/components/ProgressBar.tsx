import React from 'react'

interface ProgressBarProps {
  current: number
  total: number
}

export default function ProgressBar({ current, total }: ProgressBarProps) {
  const percent = total > 0 ? Math.round((current / total) * 100) : 0

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
      <div className="bg-white rounded-xl shadow-xl p-6 w-80">
        <div className="text-center text-sm text-gray-700 mb-3">
          正在保存... {current} / {total}
        </div>
        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-200"
            style={{ width: `${percent}%` }}
          />
        </div>
        <div className="text-center text-xs text-gray-400 mt-2">{percent}%</div>
      </div>
    </div>
  )
}
