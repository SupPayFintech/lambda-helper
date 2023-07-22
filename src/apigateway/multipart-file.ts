/* eslint-disable @typescript-eslint/no-var-requires */
const Busboy = require('busboy');
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Writable } from 'stream';

interface UploadFile {
  filename?: string;
  content?: Buffer;
  contentType?: string;
  encoding?: string;
  fieldname?: string;
}

interface ParsedForm {
  files: UploadFile[];
  [key: string]: any;
}

const parse = (event: APIGatewayProxyEvent): Promise<ParsedForm> =>
  new Promise((resolve, reject) => {
    const busboy = Busboy({
      headers: {
        'content-type': event.headers['content-type'] || event.headers['Content-Type'],
      },
    });
    const result: ParsedForm = {
      files: [],
    };

    busboy.on(
      'file',
      (
        fieldname: string,
        file: NodeJS.ReadableStream,
        { filename, encoding, mimetype }: { filename: string; encoding: string; mimetype: string },
      ) => {
        const uploadFile: UploadFile = {};
        const chunks: Buffer[] = [];

        file.on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });

        file.on('end', () => {
          uploadFile.filename = filename;
          uploadFile.contentType = mimetype;
          uploadFile.encoding = encoding;
          uploadFile.fieldname = fieldname;
          uploadFile.content = Buffer.concat(chunks);
          result.files.push(uploadFile);
        });
      },
    );

    busboy.on('field', (fieldname: string, value: string) => {
      result[fieldname] = value;
    });

    busboy.on('error', (error: Error) => {
      reject(error);
    });

    busboy.on('finish', () => {
      resolve(result);
    });

    const encoding = event.isBase64Encoded ? 'base64' : 'utf8';

    const writer = new Writable({
      write(chunk: Buffer | string | any[], encoding: BufferEncoding, callback: (error?: Error | null) => void) {
        busboy.write(chunk, encoding, callback);
      },
    });

    writer.on('finish', () => busboy.end());

    writer.write(event.body, encoding);
    writer.end();
  });

export default parse;
