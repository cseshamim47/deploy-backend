import { Injectable } from '@nestjs/common';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Injectable()
export class FileUploadService {
  static getStorage(destination: string) {
    return diskStorage({
      destination: `./public/${destination}`,
      filename: (req, file, callback) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        callback(null, `${uniqueSuffix}${extname(file.originalname)}`);
      },
    });
  }

  static imageFileFilter(req: any, file: any, callback: any) {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  }

  getImageUrl(folder: string, filename: string): string {
    return `${folder}/${filename}`;
  }
}
