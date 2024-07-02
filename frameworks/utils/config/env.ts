import { ConfigModuleOptions } from '@nestjs/config/dist/interfaces';
import * as path from 'path';

/* This code snippet is exporting a constant named `moduleConfig` of type `ConfigModuleOptions`. It is
setting up configuration options for a module, specifically for loading environment variables from a
`.env` file. */
export const moduleConfig: ConfigModuleOptions = {
  envFilePath: path.join(
    __dirname,
    '../../../..',
    (process.env.NODE_ENV || 'development') + '.env',
  ),
  load: [],
  isGlobal: true,
};
