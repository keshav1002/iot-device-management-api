export enum CONSTANTS {
  KEY_DELIM = '#',
  PARTITION_KEY = 'PK',
  SORT_KEY = 'SK',
  PK_PREFIX = 'DEVICE',
  SK_DETAILS_PREFIX = '#DETAILS',
  SK_READING_PREFIX = 'READING',
  GSI_READINGS_BY_ERROR = 'ReadingsByError',
  GSI_RE_PK = 'ErrorStatus',
  LSI_ERRORS_BY_DEVICE = 'ErrorsByDevice',
}
