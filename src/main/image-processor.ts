import sharp from 'sharp'
import path from 'path'
import fs from 'fs'

export interface ProcessOptions {
  photographer: string
  title: string
  barHeight: number | 'auto'
  fontFamily: string
  fontSize: number | 'auto'
  fontColor: string
}

export interface ImageInfo {
  filePath: string
  fileName: string
  titleFromName: string
  width: number
  height: number
  size: number
}

const DEFAULT_OPTIONS: ProcessOptions = {
  photographer: '',
  title: '',
  barHeight: 'auto',
  fontFamily: 'LXGW WenKai, PingFang SC, Microsoft YaHei, sans-serif',
  fontSize: 'auto',
  fontColor: '#2c2c2c',
}

function calcBarHeight(imageHeight: number, barHeight: number | 'auto'): number {
  if (barHeight !== 'auto') return barHeight
  const computed = Math.round(imageHeight * 0.06)
  return Math.max(100, Math.min(600, computed))
}

function calcFontSize(barHeight: number, fontSize: number | 'auto'): number {
  if (fontSize !== 'auto') return fontSize
  return Math.round(barHeight * 0.32)
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function buildTextSvg(
  width: number,
  barHeight: number,
  photographer: string,
  title: string,
  fontFamily: string,
  fontSize: number,
  fontColor: string
): Buffer {
  const escapedFont = escapeXml(fontFamily)
  const centerY = Math.round(barHeight * 0.55)
  const labelSize = Math.round(fontSize * 0.7)
  const titleSize = Math.round(fontSize * 1.05)
  const padX = Math.round(width * 0.04)

  const leftGroup = photographer ? `
    <text x="${padX}" y="${centerY}" font-family="${escapedFont}" font-size="${labelSize}" fill="#999" letter-spacing="2">摄影</text>
    <text x="${padX + labelSize * 3}" y="${centerY}" font-family="${escapedFont}" font-size="${fontSize}" fill="${fontColor}" font-weight="400" letter-spacing="1">${escapeXml(photographer)}</text>
  ` : ''

  const rightGroup = title ? `
    <text x="${width - padX}" y="${centerY}" font-family="${escapedFont}" font-size="${titleSize}" fill="${fontColor}" text-anchor="end" font-weight="400" letter-spacing="3">《${escapeXml(title)}》</text>
  ` : ''

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${barHeight}">
  <rect width="100%" height="100%" fill="white"/>
  ${leftGroup}
  ${rightGroup}
</svg>`

  return Buffer.from(svg)
}

export async function getImageInfo(filePath: string): Promise<ImageInfo> {
  const metadata = await sharp(filePath).metadata()
  const stats = fs.statSync(filePath)
  const fileName = path.basename(filePath)
  const ext = path.extname(fileName)
  const titleFromName = path.basename(fileName, ext)

  return {
    filePath,
    fileName,
    titleFromName,
    width: metadata.width || 0,
    height: metadata.height || 0,
    size: stats.size,
  }
}

export async function generatePreview(
  filePath: string,
  options: Partial<ProcessOptions>,
  maxWidth: number = 1200
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const metadata = await sharp(filePath).metadata()
  const imgWidth = metadata.width || 0
  const imgHeight = metadata.height || 0

  const barHeight = calcBarHeight(imgHeight, opts.barHeight)
  const fontSize = calcFontSize(barHeight, opts.fontSize)

  const scale = Math.min(1, maxWidth / imgWidth)
  const previewWidth = Math.round(imgWidth * scale)
  const previewBarHeight = Math.round(barHeight * scale)
  const previewFontSize = Math.round(fontSize * scale)

  const svgBuffer = buildTextSvg(
    previewWidth,
    previewBarHeight,
    opts.photographer,
    opts.title,
    opts.fontFamily,
    previewFontSize,
    opts.fontColor
  )

  const resizedBuf = await sharp(filePath)
    .resize(previewWidth, undefined, { withoutEnlargement: true })
    .png() // lossless intermediate
    .toBuffer()

  const result = await sharp(resizedBuf)
    .extend({
      bottom: previewBarHeight,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .composite([{ input: svgBuffer, gravity: 'south' }])
    .jpeg({ quality: 85 })
    .toBuffer()

  return result
}

export async function processAndSave(
  filePath: string,
  outputPath: string,
  options: Partial<ProcessOptions>
): Promise<string> {
  const opts = { ...DEFAULT_OPTIONS, ...options }
  const metadata = await sharp(filePath).metadata()
  const imgWidth = metadata.width || 0
  const imgHeight = metadata.height || 0

  const barHeight = calcBarHeight(imgHeight, opts.barHeight)
  const fontSize = calcFontSize(barHeight, opts.fontSize)

  const svgBuffer = buildTextSvg(
    imgWidth,
    barHeight,
    opts.photographer,
    opts.title,
    opts.fontFamily,
    fontSize,
    opts.fontColor
  )

  await sharp(filePath)
    .extend({
      bottom: barHeight,
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .composite([{ input: svgBuffer, gravity: 'south' }])
    .withMetadata()
    .jpeg({
      quality: 100,
      chromaSubsampling: '4:4:4',
      mozjpeg: false,
      force: true,
    })
    .toFile(outputPath)

  return outputPath
}

export function getOutputPath(inputPath: string): string {
  const dir = path.dirname(inputPath)
  const ext = path.extname(inputPath)
  const base = path.basename(inputPath, ext)
  return path.join(dir, `${base}_签名.jpg`)
}
