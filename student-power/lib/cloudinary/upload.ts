import cloudinary from './config';

export interface CloudinaryUploadResult {
  public_id: string;
  url: string;
  secure_url: string;
  format: string;
  bytes: number;
}

export async function uploadPDFToCloudinary(
  fileBuffer: Buffer,
  fileName: string
): Promise<CloudinaryUploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'student-power/pdfs',
        resource_type: 'raw',
        format: 'pdf',
        public_id: fileName.replace(/\.[^/.]+$/, ''),
        use_filename: true,
        flags: 'attachment',
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve(result as CloudinaryUploadResult);
        } else {
          reject(new Error('Upload failed'));
        }
      }
    );

    uploadStream.end(fileBuffer);
  });
}

export async function deletePDFFromCloudinary(publicId: string): Promise<void> {
  try {
    // use raw resource type for PDFs
    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
  } catch (error) {
    console.error('Error deleting from Cloudinary:', error);
    throw error;
  }
}
