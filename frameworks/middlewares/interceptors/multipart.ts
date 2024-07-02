import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';
import * as mimeTypes from 'mime-types';
import { VIDEO_MIMETYPE } from 'frameworks/utils/resources/mimetype';
import {
  MULTIPART_OPTIONS,
  FILE_NAME_REGEX,
} from 'frameworks/utils/resources/app.constants';

@Injectable()
export class MultipartInterceptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<any> {
    try {
      const request = context.switchToHttp().getRequest();
      const files = await request.saveRequestFiles(MULTIPART_OPTIONS);
      if (files && !this.validateFiles(files)) {
        throw this.generateError({
          name: 'Invalid File',
          message: "is required and should'nt be empty",
          fieldname: 'upload',
        });
      }

      // Prepare the body data
      let bodyData = {};

      for (const file of files) {
        if (file.mimetype && !this.isValidVideoMimeType(file.filename)) {
          const response = {
            error: {
              message: `File couldn't be processed at this moment`,
              mimetype: 'is not supported',
            },
          };
          context.switchToHttp().getResponse().status(400).send(response);
          return of(response);
        }

        bodyData = {
          type: file.type,
          originalName: file.filename.replace(FILE_NAME_REGEX, '_'),
          mimetype: file.mimetype,
          path: file.filepath,
          encoding: file.encoding,
          size: file.file.bytesRead,
        };
      }

      //assign to the body
      request.body = bodyData;
      return next.handle().pipe(tap());
    } catch (err) {
      const response = {
        error: {
          message: "File could'nt be processed at this moment",
          [err?.part?.fieldname || err?.fieldname || 'upload']: err.message,
        },
      };
      context.switchToHttp().getResponse().status(400).send(response);
      return of(response);
    }
  }

  validateFiles(files: any) {
    const isFilePresent = files.filter(
      (file) => file.type === 'file' && file.file.bytesRead > 0,
    );
    return isFilePresent[0];
  }

  generateError(data: any): Error {
    const err = new Error(data.name || 'Bad Request');
    err.message = data.message || '';
    err.stack = data.stack || {};
    err['fieldname'] = data.fieldname || '';
    return err;
  }

  getFieldnameWithoutBrackets(fieldname: string) {
    return fieldname.replace(/\[.*\]/, '');
  }

  isValidVideoMimeType(filename: string): boolean {
    const mimeType = mimeTypes.lookup(filename);
    return VIDEO_MIMETYPE.includes(mimeType);
  }
}
