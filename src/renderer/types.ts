export interface ImageFile {
  filePath: string
  fileName: string
  titleFromName: string
  width: number
  height: number
  size: number
  customTitle?: string
}

export interface AppSettings {
  photographer: string
  barHeight: number | 'auto'
  fontFamily: string
  fontSize: number | 'auto'
  fontColor: string
  lastDirectory: string
}

export interface ProcessOptions {
  photographer: string
  title: string
  barHeight: number | 'auto'
  fontFamily: string
  fontSize: number | 'auto'
  fontColor: string
}

declare global {
  interface Window {
    api: {
      openFiles: () => Promise<string[]>
      showSaveDialog: (defaultPath: string) => Promise<string | null>
      selectFolder: (defaultPath?: string) => Promise<string | null>
      getFilePath: (file: File) => string
      getImageInfo: (filePath: string) => Promise<ImageFile>
      getOutputPath: (filePath: string) => Promise<string>
      getPreview: (filePath: string, options: Partial<ProcessOptions>, maxWidth?: number) => Promise<string>
      saveImage: (filePath: string, options: Partial<ProcessOptions>, outputPath: string) => Promise<string>
      saveBatch: (files: Array<{ filePath: string; options: Partial<ProcessOptions> }>, outputDir?: string) => Promise<Array<{ filePath: string; outputPath: string; success: boolean; error?: string }>>
      onBatchProgress: (callback: (progress: { current: number; total: number }) => void) => () => void
      getSettings: () => Promise<AppSettings>
      updateSettings: (partial: Partial<AppSettings>) => Promise<AppSettings>
    }
  }
}
