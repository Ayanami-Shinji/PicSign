import React, { useState, useCallback } from 'react'

interface DropZoneProps {
  onDrop: (filePaths: string[]) => void
  onClickOpen: () => void
}

export default function DropZone({ onDrop, onClickOpen }: DropZoneProps) {
  const [dragOver, setDragOver] = useState(false)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragOver(false)

      const files = Array.from(e.dataTransfer.files)
      const validFiles = files.filter((f) =>
        /\.(jpe?g|png)$/i.test(f.name)
      )
      if (validFiles.length > 0) {
        const paths = validFiles.map((f) => window.api.getFilePath(f))
        onDrop(paths)
      }
    },
    [onDrop]
  )

  return (
    <div
      className="flex-1 flex items-center justify-center p-10"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        onClick={onClickOpen}
        className={`
          w-full max-w-md aspect-[3/2] rounded-3xl border-2 border-dashed
          flex flex-col items-center justify-center gap-5 cursor-pointer
          transition-all duration-300 ease-out
          ${dragOver
            ? 'border-blue-400 bg-blue-50/80 dark:bg-blue-950/30 scale-[1.02] shadow-xl shadow-blue-100 dark:shadow-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg hover:shadow-gray-100 dark:hover:shadow-gray-900/50 hover:scale-[1.01]'
          }
        `}
      >
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
          dragOver ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-gray-50 dark:bg-gray-800'
        }`}>
          <svg
            className={`w-10 h-10 transition-colors duration-300 ${dragOver ? 'text-blue-500' : 'text-gray-300 dark:text-gray-600'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>

        <div className="text-center space-y-1.5">
          <p className={`text-base font-medium transition-colors duration-300 ${dragOver ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
            {dragOver ? '松开即可添加' : '拖放照片到这里'}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            点击选择文件 · 支持 JPG / PNG
          </p>
        </div>
      </div>
    </div>
  )
}
