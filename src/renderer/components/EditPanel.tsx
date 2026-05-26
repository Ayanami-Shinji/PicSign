import React, { useMemo } from 'react'

const FONT_OPTIONS = [
  { value: 'LXGW WenKai, PingFang SC, Microsoft YaHei, sans-serif', label: '文楷（推荐）' },
  { value: 'PingFang SC, Microsoft YaHei, Noto Sans SC, sans-serif', label: '苹方/雅黑' },
  { value: 'STSong, SimSun, serif', label: '宋体' },
  { value: 'STKaiti, KaiTi, serif', label: '楷体' },
  { value: 'STFangsong, FangSong, serif', label: '仿宋' },
]

interface EditPanelProps {
  photographer: string
  title: string
  barHeight: number | 'auto'
  fontFamily: string
  imageHeight?: number
  onPhotographerChange: (value: string) => void
  onTitleChange: (value: string) => void
  onBarHeightChange: (value: number | 'auto') => void
  onFontFamilyChange: (value: string) => void
}

function calcAutoHeight(imageHeight: number): number {
  const computed = Math.round(imageHeight * 0.06)
  return Math.max(100, Math.min(600, computed))
}

function buildBarOptions(imageHeight: number) {
  const auto = calcAutoHeight(imageHeight)
  const options = [
    { value: 'auto' as const, label: `自动 (${auto}px)`, px: auto },
    { value: Math.round(imageHeight * 0.03), label: '紧凑', px: Math.round(imageHeight * 0.03) },
    { value: Math.round(imageHeight * 0.045), label: '适中', px: Math.round(imageHeight * 0.045) },
    { value: Math.round(imageHeight * 0.06), label: '标准', px: Math.round(imageHeight * 0.06) },
    { value: Math.round(imageHeight * 0.08), label: '宽松', px: Math.round(imageHeight * 0.08) },
    { value: Math.round(imageHeight * 0.10), label: '大', px: Math.round(imageHeight * 0.10) },
  ]
  return options
}

export default function EditPanel({
  photographer,
  title,
  barHeight,
  fontFamily,
  imageHeight = 4000,
  onPhotographerChange,
  onTitleChange,
  onBarHeightChange,
  onFontFamilyChange,
}: EditPanelProps) {
  const barOptions = useMemo(() => buildBarOptions(imageHeight), [imageHeight])

  const currentValue = barHeight === 'auto' ? 'auto' : String(barHeight)

  const handleBarSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value
    if (v === 'auto') {
      onBarHeightChange('auto')
    } else {
      onBarHeightChange(parseInt(v))
    }
  }

  return (
    <div className="px-5 py-3 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 transition-colors">
      <div className="flex items-center gap-6">
        {/* 摄影者 */}
        <div className="flex items-center">
          <span className="text-sm text-gray-400 dark:text-gray-500 mr-2">摄影</span>
          <input
            type="text"
            value={photographer}
            onChange={(e) => onPhotographerChange(e.target.value)}
            placeholder="输入姓名"
            autoFocus={!photographer}
            className="w-28 px-3 py-1.5 text-sm font-medium bg-transparent border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
          />
        </div>

        {/* 作品名 */}
        <div className="flex items-center">
          <span className="text-sm text-gray-400 dark:text-gray-500 mr-2">作品</span>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="输入作品名"
            className="w-32 px-3 py-1.5 text-sm font-medium bg-transparent border-b border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 placeholder-gray-300 dark:placeholder-gray-600 focus:outline-none focus:border-blue-400 dark:focus:border-blue-500 transition-colors"
          />
        </div>

        <div className="flex-1" />

        {/* 底栏高度 - 下拉选择 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">底栏</span>
          <select
            value={currentValue}
            onChange={handleBarSelect}
            className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-300 dark:focus:ring-blue-700 cursor-pointer"
          >
            {barOptions.map((opt) => (
              <option key={String(opt.value)} value={String(opt.value)}>
                {opt.label} {opt.value !== 'auto' ? `(${opt.px}px)` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* 字体 */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 dark:text-gray-500">字体</span>
          <select
            value={fontFamily}
            onChange={(e) => onFontFamilyChange(e.target.value)}
            className="px-2 py-1 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-300 dark:focus:ring-blue-700 cursor-pointer"
          >
            {FONT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  )
}
