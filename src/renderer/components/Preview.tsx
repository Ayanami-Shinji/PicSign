import React from 'react'

interface PreviewProps {
  previewData: string | null
  loading?: boolean
}

export default function Preview({ previewData, loading }: PreviewProps) {
  if (!previewData) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-400 dark:text-gray-500">正在生成预览...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100/50 dark:from-gray-900 dark:to-gray-950 p-5 overflow-hidden relative">
      <img
        src={`data:image/jpeg;base64,${previewData}`}
        alt="预览"
        className={`max-w-full max-h-full object-contain rounded-lg shadow-2xl shadow-gray-300/50 dark:shadow-black/40 transition-opacity duration-200 ${loading ? 'opacity-50' : 'opacity-100'}`}
      />
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-7 h-7 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  )
}
