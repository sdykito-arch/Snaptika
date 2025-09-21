import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import * as ffmpeg from 'fluent-ffmpeg';
import { v4 as uuidv4 } from 'uuid';
import { Readable } from 'stream';

@Injectable()
export class MediaService {
  private s3: AWS.S3;
  private cloudFrontDomain: string;

  constructor(private configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get('AWS_REGION'),
    });
    
    this.cloudFrontDomain = this.configService.get('CLOUDFRONT_DOMAIN');
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads',
  ): Promise<string> {
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folder}/${uuidv4()}.${fileExtension}`;
    
    const uploadParams = {
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: fileName,
      Body: file.buffer,
      ContentType: file.mimetype,
      ACL: 'public-read',
    };

    const result = await this.s3.upload(uploadParams).promise();
    
    // Return CloudFront URL if available, otherwise S3 URL
    if (this.cloudFrontDomain) {
      return `https://${this.cloudFrontDomain}/${fileName}`;
    }
    
    return result.Location;
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads',
  ): Promise<string[]> {
    const uploadPromises = files.map((file) => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async processVideo(
    file: Express.Multer.File,
    options: {
      maxDuration?: number;
      maxWidth?: number;
      maxHeight?: number;
    } = {},
  ): Promise<Buffer> {
    const { maxDuration = 600, maxWidth = 1080, maxHeight = 1920 } = options;

    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = new Readable();
      stream.push(file.buffer);
      stream.push(null);

      let ffmpegCommand = ffmpeg(stream)
        .videoCodec('libx264')
        .audioCodec('aac')
        .format('mp4')
        .size(`${maxWidth}x${maxHeight}`)
        .aspect('9:16')
        .autopad()
        .duration(maxDuration);

      const outputStream = ffmpegCommand
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject(err);
        })
        .on('end', () => {
          resolve(Buffer.concat(chunks));
        })
        .pipe();

      outputStream.on('data', (chunk) => {
        chunks.push(chunk);
      });
    });
  }

  async generateThumbnail(
    videoFile: Express.Multer.File,
    timestamp: string = '00:00:01',
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const stream = new Readable();
      stream.push(videoFile.buffer);
      stream.push(null);

      const outputStream = ffmpeg(stream)
        .seekInput(timestamp)
        .frames(1)
        .format('png')
        .size('720x1280')
        .on('error', (err) => {
          console.error('Thumbnail generation error:', err);
          reject(err);
        })
        .on('end', () => {
          resolve(Buffer.concat(chunks));
        })
        .pipe();

      outputStream.on('data', (chunk) => {
        chunks.push(chunk);
      });
    });
  }

  async deleteFile(url: string): Promise<void> {
    try {
      // Extract key from URL
      let key: string;
      
      if (url.includes(this.cloudFrontDomain)) {
        key = url.split(`${this.cloudFrontDomain}/`)[1];
      } else {
        const urlParts = url.split('/');
        key = urlParts.slice(-2).join('/'); // folder/filename
      }

      await this.s3
        .deleteObject({
          Bucket: this.configService.get('AWS_S3_BUCKET'),
          Key: key,
        })
        .promise();
    } catch (error) {
      console.error('Error deleting file from S3:', error);
    }
  }

  async getPresignedUrl(
    fileName: string,
    fileType: string,
    folder: string = 'uploads',
  ): Promise<{ uploadUrl: string; fileUrl: string }> {
    const key = `${folder}/${uuidv4()}-${fileName}`;
    
    const uploadUrl = await this.s3.getSignedUrlPromise('putObject', {
      Bucket: this.configService.get('AWS_S3_BUCKET'),
      Key: key,
      ContentType: fileType,
      Expires: 3600, // 1 hour
      ACL: 'public-read',
    });

    const fileUrl = this.cloudFrontDomain
      ? `https://${this.cloudFrontDomain}/${key}`
      : `https://${this.configService.get('AWS_S3_BUCKET')}.s3.${this.configService.get('AWS_REGION')}.amazonaws.com/${key}`;

    return { uploadUrl, fileUrl };
  }
}
