export const MULTIPART_OPTIONS = {
  limits: {
    fieldNameSize: 100, // Max field name size in bytes
    fieldSize: 100, // Max field value size in bytes
    fields: 10, // Max number of non-file fields
    fileSize: 1073741824, // 1 Gigabyte - 1073741824
    files: 1, // Max number of file fields
    headerPairs: 10, // Max number of header key=>value pairs
  },
};

export const FILE_NAME_REGEX = new RegExp(
  '^[.]+|[`#%^\\+\\\\/\\?\\*:|\\"\\\'<>\\s\\{\\}=,_]+',
  'g',
);

export const DEFAULT_FRAMES = 25;
export const DEFAULT_AUDIO_DIR = './uploads/audio';
export const DEFAULT_FRAMES_DIR = './uploads/frames';
export const MAX_OUTPUT_TOKENS = 500;
export const GPT_API_URL = 'https://api.openai.com/v1/chat/completions';

export enum MODELS {
  GPT_4_TURBO = 'gpt-4-turbo',
  GPT_4_OMNI = 'gpt-4o',
  GPT_WHISPER_1 = 'whisper-1',
}
