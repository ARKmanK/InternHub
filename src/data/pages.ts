export const MainPages = [
	'Университет',
	'Сведения об образовательной организации',
	'Студенту',
	'Абитуриенту',
	'Специалисту',
	'Работнику',
] as const

export const ExtraPagesCol1 = ['Университет'] as const

export type TypeMainPages = keyof typeof MainPages
export type TypeUniversityCategory = keyof typeof ExtraPages
export type TypePageKey<T extends TypeUniversityCategory> = keyof (typeof ExtraPages)[T]['pages']
