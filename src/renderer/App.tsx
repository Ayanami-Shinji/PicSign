import React, { useState, useEffect, useCallback, useRef } from 'react'
import { ImageFile, AppSettings, ProcessOptions } from './types'
import DropZone from './components/DropZone'
import Preview from './components/Preview'
import EditPanel from './components/EditPanel'
import FileList from './components/FileList'
import Toolbar from './components/Toolbar'
import Toast from './components/Toast'
import ProgressBar from './components/ProgressBar'

type AppState = 'empty' | 'single' | 'batch'
type DarkMode = 'system' | 'light' | 'dark'

interface ToastMessage {
  id: number
  message: string
  type: 'success' | 'error'
}

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

function applyDarkMode(mode: DarkMode) {
  const isDark = mode === 'dark' || (mode === 'system' && getSystemDark())
  document.documentElement.classList.toggle('dark', isDark)
}

export default function App() {
  const [images, setImages] = useState<ImageFile[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [settings, setSettings] = useState<AppSettings>({
    photographer: '',
    barHeight: 'auto',
    fontFamily: 'LXGW WenKai, PingFang SC, Microsoft YaHei, sans-serif',
    fontSize: 'auto',
    fontColor: '#2c2c2c',
    lastDirectory: '',
  })
  const [previewData, setPreviewData] = useState<string | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 })
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [darkMode, setDarkMode] = useState<DarkMode>('system')
  const previewTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastId = useRef(0)

  const appState: AppState = images.length === 0 ? 'empty' : images.length === 1 ? 'single' : 'batch'
  const currentImage = images[currentIndex] || null

  // Dark mode
  useEffect(() => {
    const saved = localStorage.getItem('picsign-dark-mode') as DarkMode | null
    if (saved) setDarkMode(saved)
  }, [])

  useEffect(() => {
    applyDarkMode(darkMode)
    localStorage.setItem('picsign-dark-mode', darkMode)

    if (darkMode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      const handler = () => applyDarkMode('system')
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [darkMode])

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = ++toastId.current
    setToasts((prev) => [...prev, { id, message, type }])
  }, [])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  useEffect(() => {
    window.api.getSettings().then(setSettings).catch(console.error)
    const unsubscribe = window.api.onBatchProgress(setBatchProgress)
    return unsubscribe
  }, [])

  useEffect(() => {
    if (!currentImage) {
      setPreviewData(null)
      return
    }

    if (previewTimer.current) {
      clearTimeout(previewTimer.current)
    }

    previewTimer.current = setTimeout(() => {
      setPreviewLoading(true)
      const options: Partial<ProcessOptions> = {
        photographer: settings.photographer,
        title: currentImage.customTitle ?? currentImage.titleFromName,
        barHeight: settings.barHeight,
        fontFamily: settings.fontFamily,
        fontSize: settings.fontSize,
        fontColor: settings.fontColor,
      }
      window.api.getPreview(currentImage.filePath, options).then((base64) => {
        setPreviewData(base64)
        setPreviewLoading(false)
      }).catch((err) => {
        console.error('Preview failed:', err)
        setPreviewLoading(false)
        showToast('预览生成失败', 'error')
      })
    }, 800)

    return () => {
      if (previewTimer.current) clearTimeout(previewTimer.current)
    }
  }, [currentImage, settings])

  const loadFiles = useCallback(async (filePaths: string[]) => {
    try {
      const infos = await Promise.all(filePaths.map((fp) => window.api.getImageInfo(fp)))
      setImages(infos)
      setCurrentIndex(0)
    } catch (err: any) {
      console.error('Load failed:', err)
      showToast(`加载失败：${err.message}`, 'error')
    }
  }, [showToast])

  const handleOpenFiles = useCallback(async () => {
    const paths = await window.api.openFiles()
    if (paths.length > 0) {
      await loadFiles(paths)
    }
  }, [loadFiles])

  const handleDrop = useCallback(async (filePaths: string[]) => {
    await loadFiles(filePaths)
  }, [loadFiles])

  const handleClear = useCallback(() => {
    setImages([])
    setCurrentIndex(0)
    setPreviewData(null)
  }, [])

  const handleSettingsChange = useCallback((partial: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial }
      window.api.updateSettings(partial)
      return next
    })
  }, [])

  const handleTitleChange = useCallback((title: string) => {
    setImages((prev) => {
      const next = [...prev]
      if (next[currentIndex]) {
        next[currentIndex] = { ...next[currentIndex], customTitle: title }
      }
      return next
    })
  }, [currentIndex])

  const handleSave = useCallback(async () => {
    if (images.length === 0) return

    try {
      if (appState === 'single') {
        const img = images[0]
        const defaultPath = await window.api.getOutputPath(img.filePath)
        const savePath = await window.api.showSaveDialog(defaultPath)
        if (!savePath) return

        setSaving(true)
        const options: Partial<ProcessOptions> = {
          photographer: settings.photographer,
          title: img.customTitle ?? img.titleFromName,
          barHeight: settings.barHeight,
          fontFamily: settings.fontFamily,
          fontSize: settings.fontSize,
          fontColor: settings.fontColor,
        }
        await window.api.saveImage(img.filePath, options, savePath)
        showToast(`已保存 ${savePath.split(/[/\\]/).pop()}`, 'success')
      } else {
        const defaultDir = images[0].filePath.split(/[/\\]/).slice(0, -1).join('/')
        const outputDir = await window.api.selectFolder(defaultDir)
        if (!outputDir) return

        setSaving(true)
        const files = images.map((img) => ({
          filePath: img.filePath,
          options: {
            photographer: settings.photographer,
            title: img.customTitle ?? img.titleFromName,
            barHeight: settings.barHeight,
            fontFamily: settings.fontFamily,
            fontSize: settings.fontSize,
            fontColor: settings.fontColor,
          },
        }))
        const results = await window.api.saveBatch(files, outputDir)
        const successCount = results.filter((r) => r.success).length
        const failCount = results.length - successCount
        if (failCount === 0) {
          showToast(`全部保存成功（${successCount} 张）`, 'success')
        } else {
          showToast(`${successCount} 张成功，${failCount} 张失败`, 'error')
        }
      }
    } catch (err: any) {
      showToast(`保存失败：${err.message}`, 'error')
    } finally {
      setSaving(false)
    }
  }, [images, settings, appState, showToast])

  return (
    <div className="flex flex-col h-full bg-slate-50 dark:bg-gray-950 transition-colors">
      <Toolbar
        appState={appState}
        onOpen={handleOpenFiles}
        onSave={handleSave}
        onClear={handleClear}
        saving={saving}
        darkMode={darkMode}
        onDarkModeChange={setDarkMode}
      />

      <div className="flex flex-1 min-h-0">
        {appState === 'batch' && (
          <FileList
            images={images}
            currentIndex={currentIndex}
            onSelect={setCurrentIndex}
          />
        )}

        <div className="flex-1 flex flex-col min-w-0">
          {appState === 'empty' ? (
            <DropZone onDrop={handleDrop} onClickOpen={handleOpenFiles} />
          ) : (
            <Preview previewData={previewData} loading={previewLoading} />
          )}
        </div>
      </div>

      {appState !== 'empty' && (
        <EditPanel
          photographer={settings.photographer}
          title={currentImage?.customTitle ?? currentImage?.titleFromName ?? ''}
          barHeight={settings.barHeight}
          fontFamily={settings.fontFamily}
          imageHeight={currentImage?.height}
          onPhotographerChange={(v) => handleSettingsChange({ photographer: v })}
          onTitleChange={handleTitleChange}
          onBarHeightChange={(v) => handleSettingsChange({ barHeight: v })}
          onFontFamilyChange={(v) => handleSettingsChange({ fontFamily: v })}
        />
      )}

      {saving && batchProgress.total > 1 && (
        <ProgressBar current={batchProgress.current} total={batchProgress.total} />
      )}

      {toasts.length > 0 && (
        <div className="fixed top-14 right-4 z-50 flex flex-col gap-2 items-end pointer-events-none">
          {toasts.map((t) => (
            <div key={t.id} className="pointer-events-auto">
              <Toast
                message={t.message}
                type={t.type}
                onClose={() => removeToast(t.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
