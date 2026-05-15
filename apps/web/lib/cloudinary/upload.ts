import { v2 as cloudinary } from 'cloudinary'

export interface UploadResult {
  url: string
  publicId: string
  width: number
  height: number
  format: string
  createdAt: string
  bytes: number
  altText: string
}

export async function uploadImage(
  buffer: Buffer,
  mimeType: string,
  altText: string,
  name?: string,
): Promise<UploadResult> {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  const dataUri = `data:${mimeType};base64,${buffer.toString('base64')}`
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: 'sawl.dev - blog',
    context: { alt: altText },
    ...(name ? { public_id: name } : {}),
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    createdAt: result.created_at,
    bytes: result.bytes,
    altText,
  }
}
