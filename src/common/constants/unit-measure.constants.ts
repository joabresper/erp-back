export const UnitMeasure = {
	UNIT: 'UNIT',
	KG: 'KG'
} as const;

export type UnitMeasure = typeof UnitMeasure[keyof typeof UnitMeasure];