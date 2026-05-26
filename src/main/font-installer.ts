import { app } from 'electron'
import path from 'path'
import fs from 'fs'

function getUserFontsDir(): string {
  if (process.platform === 'darwin') {
    return path.join(app.getPath('home'), 'Library', 'Fonts')
  } else if (process.platform === 'win32') {
    return path.join(app.getPath('home'), 'AppData', 'Local', 'Microsoft', 'Windows', 'Fonts')
  }
  // Linux: ~/.local/share/fonts
  return path.join(app.getPath('home'), '.local', 'share', 'fonts')
}

function getBundledFontsDir(): string {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'assets', 'fonts')
  }
  return path.join(app.getAppPath(), 'assets', 'fonts')
}

export function installBundledFonts(): void {
  const bundledDir = getBundledFontsDir()
  const userFontsDir = getUserFontsDir()

  if (!fs.existsSync(bundledDir)) return

  if (!fs.existsSync(userFontsDir)) {
    fs.mkdirSync(userFontsDir, { recursive: true })
  }

  const fontFiles = fs.readdirSync(bundledDir).filter((f) => /\.(ttf|otf|woff2?)$/i.test(f))

  for (const fontFile of fontFiles) {
    const src = path.join(bundledDir, fontFile)
    const dest = path.join(userFontsDir, fontFile)

    if (!fs.existsSync(dest)) {
      try {
        fs.copyFileSync(src, dest)
        console.log(`[PicSign] Font installed: ${fontFile}`)
      } catch (err) {
        console.warn(`[PicSign] Failed to install font ${fontFile}:`, err)
      }
    }
  }
}
