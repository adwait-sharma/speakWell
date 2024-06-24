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
