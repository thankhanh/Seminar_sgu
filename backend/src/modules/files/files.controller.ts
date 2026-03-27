import { Controller, Post, UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator, UseGuards } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';

@ApiTags('Files')
@Controller('files')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
export class FilesController {
  @Post('upload')
  @ApiOperation({ summary: 'Tải ảnh lên (Max 5MB, format: jpg, jpeg, png, webp)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, callback) => {
          console.log('Multer destination check:', file.originalname);
          callback(null, './uploads');
        },
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          console.log('Multer filename generated:', filename);
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
  )
  uploadFile(
    @UploadedFile()
    file: Express.Multer.File,
  ) {
    if (!file) {
      console.error('File is UNDEFINED in controller!');
      return { success: false, message: 'Kiểm tra lại định dạng file (Hỗ trợ: jpg, png, webp, gif...)' };
    }
    console.log('--- File Upload Request Success ---');
    console.log('File Name:', file.filename);
    console.log('File Mimetype:', file.mimetype);
    console.log('File Size:', file.size);
    // Trả về URL của file để frontend sử dụng
    // Lưu ý: Cần thêm static folder trong main.ts
    const fileUrl = `${process.env.BACKEND_URL || 'http://localhost:3000'}/uploads/${file.filename}`;
    return {
      success: true,
      data: {
        url: fileUrl,
        filename: file.filename,
      },
    };
  }
}
