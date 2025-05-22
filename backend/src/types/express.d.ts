import { Multer as MulterNamespace } from 'multer';

declare global {
  namespace Express {
    namespace Multer {
      interface File extends MulterNamespace.File {
        path: string;
      }
    }
  }
}

export {};
