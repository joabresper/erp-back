export const ProductType = {
  RAW_MATERIAL: 'RAW_MATERIAL',
  FINISHED_GOOD: 'FINISHED_GOOD',
  RESALE: 'RESALE',
  GENERIC: 'GENERIC'
} as const;

export type ProductType = typeof ProductType[keyof typeof ProductType];