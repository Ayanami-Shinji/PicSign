import { ipcMain, dialog } from 'electron'
import path from 'path'
import {
  getImageInfo,
  generatePreview,
  processAndSave,
  getOutputPath,
  ProcessOptions,
} from './image-processor'
import { getSettings, updateSettings } from './store'

export function setupIPC() {
  ipcMain.handle('dialog:openFiles', async () => {
    const settings = getSettings()
    const result = await dialog.showOpenDialog({
      title: '选择照片',
      defaultPath: settings.lastDirectory || undefined,
      filters: [
        { name: '图片文件', extensions: ['jpg', 'jpeg', 'png'] },
      ],
      properties: ['openFile', 'multiSelections'],
    })

    if (!result.canceled && result.filePaths.length > 0) {
      const dir = path.dirname(result.filePaths[0])
      updateSettings({ lastDirectory: dir })
    }

    return result.canceled ? [] : result.filePaths
  })

  ipcMain.handle('dialog:saveFile', async (_event, defaultPath: string) => {
    const result = await dialog.showSaveDialog({
      title: '保存照片',
      defaultPath,
      filters: [
        { name: 'JPEG 图片', extensions: ['jpg'] },
      ],
    })

    return result.canceled ? null : result.filePath
  })

  ipcMain.handle('dialog:selectFolder', async (_event, defaultPath?: string) => {
    const result = await dialog.showOpenDialog({
      title: '选择保存文件夹',
      defaultPath: defaultPath || undefined,
      properties: ['openDirectory', 'createDirectory'],
    })

    return result.canceled ? null : result.filePaths[0]
  })

  ipcMain.handle('image:getInfo', async (_event, filePath: string) => {
    return getImageInfo(filePath)
  })

  ipcMain.handle('image:getOutputPath', async (_event, filePath: string) => {
    return getOutputPath(filePath)
  })

  ipcMain.handle(
    'image:preview',
    async (_event, filePath: string, options: Partial<ProcessOptions>, maxWidth?: number) => {
      const buffer = await generatePreview(filePath, options, maxWidth)
      return buffer.toString('base64')
    }
  )

  ipcMain.handle(
    'image:save',
    async (_event, filePath: string, options: Partial<ProcessOptions>, outputPath: string) => {
      await processAndSave(filePath, outputPath, options)
      return outputPath
    }
  )

  ipcMain.handle(
    'image:saveBatch',
    async (event, files: Array<{ filePath: string; options: Partial<ProcessOptions> }>, outputDir?: string) => {
      const results: Array<{ filePath: string; outputPath: string; success: boolean; error?: string }> = []
      const sender = event.sender

      for (let i = 0; i < files.length; i++) {
        const file = files[i]
        sender.send('batch:progress', { current: i + 1, total: files.length })
        try {
          let outputPath = getOutputPath(file.filePath)
          if (outputDir) {
            outputPath = path.join(outputDir, path.basename(outputPath))
          }
          await processAndSave(file.filePath, outputPath, file.options)
          results.push({ filePath: file.filePath, outputPath, success: true })
        } catch (err: any) {
          results.push({
            filePath: file.filePath,
            outputPath: '',
            success: false,
            error: err.message,
          })
        }
      }

      return results
    }
  )

  ipcMain.handle('settings:get', async () => {
    return getSettings()
  })

  ipcMain.handle('settings:update', async (_event, partial: Record<string, any>) => {
    updateSettings(partial)
    return getSettings()
  })
}
