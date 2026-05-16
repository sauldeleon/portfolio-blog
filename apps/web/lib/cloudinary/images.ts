import { v2 as cloudinary } from 'cloudinary'

export interface CloudinaryImage {
  publicId: string
  url: string
  width: number
  height: number
  format: string
  createdAt: string
  bytes: number
}

export async function listImages(
  nextCursor?: string,
  maxResults = 20,
): Promise<{ images: CloudinaryImage[]; nextCursor?: string }> {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  const result = await cloudinary.api.resources({
    type: 'upload',
    resource_type: 'image',
    prefix: 'sawl.dev - blog/',
    max_results: maxResults,
    ...(nextCursor ? { next_cursor: nextCursor } : {}),
  })

  const images = (
    result.resources as {
      public_id: string
      secure_url: string
      width: number
      height: number
      format: string
      created_at: string
      bytes: number
    }[]
  ).map((r) => ({
    publicId: r.public_id,
    url: r.secure_url,
    width: r.width,
    height: r.height,
    format: r.format,
    createdAt: r.created_at,
    bytes: r.bytes,
  }))

  return {
    images,
    ...(result.next_cursor ? { nextCursor: result.next_cursor as string } : {}),
  }
}

export async function destroyImage(publicId: string): Promise<void> {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  await cloudinary.uploader.destroy(publicId)
}

export async function renameImage(
  publicId: string,
  newName: string,
): Promise<CloudinaryImage> {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  const folder = publicId.split('/').slice(0, -1).join('/')
  const newPublicId = folder ? `${folder}/${newName}` : newName

  const result = await cloudinary.uploader.rename(publicId, newPublicId)

  return {
    publicId: result.public_id,
    url: result.secure_url,
    width: result.width,
    height: result.height,
    format: result.format,
    createdAt: result.created_at,
    bytes: result.bytes,
  }
}
