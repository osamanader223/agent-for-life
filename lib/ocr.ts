import vision from '@google-cloud/vision'

const client = new vision.ImageAnnotatorClient({
  keyFilename: 'google-key.json'
})

export async function extractText(filePath: string) {
  const [result] = await client.textDetection(filePath)
  return result.fullTextAnnotation?.text
}