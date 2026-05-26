import React from 'react'
import { ImageFile } from '../types'

interface FileListProps {
  images: ImageFile[]
  currentIndex: number
  onSelect: (index: number) => void
}

export default function FileList({ images, currentIndex, onSelect }: FileListProps) {
  return (
    <div className="w-44 bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 overflow-y-auto flex flex-col transition-colors">
      <div className="px-3 py-2 text-[11px] text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider border-b border-gray-50 dark:border-gray-800 sticky top-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm">
        {images.length} 张照片
      </div>
      <div className="flex-1 py-1">
        {images.map((img, idx) => (
          <button
            key={img.filePath}
            onClick={() => onSelect(idx)}
            className={`w-full text-left px-3 py-2 text-sm transition-all rounded-lg mx-1 ${
              idx === currentIndex
                ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300'
                : 'hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400'
            }`}
            style={{ width: 'calc(100% - 8px)' }}
          >
            <div className={`truncate text-[13px] ${idx === currentIndex ? 'font-medium' : ''}`}>
              {img.fileName}
            </div>
            <div className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
              {img.width}×{img.height}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
