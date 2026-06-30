import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class UploadService {
  constructor(private config: ConfigService) {
    cloudinary.config({
      cloud_name: this.config.get('CLOUDINARY_CLOUD_NAME'),
      api_key: this.config.get('CLOUDINARY_API_KEY'),
      api_secret: this.config.get('CLOUDINARY_API_SECRET'),
    });
  }

  async uploadFile(
    buffer: Buffer,
    mimetype: string,
    folder = 'twitter-clone',
  ): Promise<string> {
    const isVideo = mimetype.startsWith('video/');
    const isImage = mimetype.startsWith('image/');

    if (!isImage && !isVideo) {
      throw new BadRequestException('Seules les images et vidéos sont acceptées');
    }

    return new Promise((resolve, reject) => {
      const upload = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: isVideo ? 'video' : 'image',
          transformation: isImage
            ? [{ width: 1200, height: 900, crop: 'limit', quality: 'auto' }]
            : [],
        },
        (error, result: UploadApiResponse | undefined) => {
          if (error || !result) return reject(error ?? new Error('Upload échoué'));
          resolve(result.secure_url);
        },
      );
      upload.end(buffer);
    });
  }
}
