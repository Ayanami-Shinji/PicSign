import { contextBridge, ipcRenderer, webUtils } from 'electron'

const api = {
  openFiles: () => ipcRenderer.invoke('dialog:openFiles'),
  showSaveDialog: (defaultPath: string) => ipcRenderer.invoke('dialog:saveFile', defaultPath),
  selectFolder: (defaultPath?: string) => ipcRenderer.invoke('dialog:selectFolder', defaultPath),

  getFilePath: (file: File) => webUtils.getPathForFile(file),

  getImageInfo: (filePath: string) => ipcRenderer.invoke('image:getInfo', filePath),
  getOutputPath: (filePath: string) => ipcRenderer.invoke('image:getOutputPath', filePath),

  getPreview: (filePath: string, options: any, maxWidth?: number) =>
    ipcRenderer.invoke('image:preview', filePath, options, maxWidth),

  saveImage: (filePath: string, options: any, outputPath: string) =>
    ipcRenderer.invoke('image:save', filePath, options, outputPath),

  saveBatch: (files: Array<{ filePath: string; options: any }>, outputDir?: string) =>
    ipcRenderer.invoke('image:saveBatch', files, outputDir),

  onBatchProgress: (callback: (progress: { current: number; total: number }) => void) => {
    const handler = (_event: any, progress: { current: number; total: number }) => callback(progress)
    ipcRenderer.on('batch:progress', handler)
    return () => ipcRenderer.removeListener('batch:progress', handler)
  },

  getSettings: () => ipcRenderer.invoke('settings:get'),
  updateSettings: (partial: Record<string, any>) => ipcRenderer.invoke('settings:update', partial),
}

contextBridge.exposeInMainWorld('api', api)

export type ApiType = typeof api
