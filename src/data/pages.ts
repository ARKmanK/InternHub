type PageLink = {
	label: string
	url: string
	isDisabled?: boolean
}

type TypeExtraPages = {
	[key: string]: PageLink[] | { [key: string]: PageLink[] }
}

type TypeMainPages = {
	[key: string]: {
		url: string
		width: number
	}
}

// Убираем isExternal из MainPages и ExtraPages
export const MainPages: TypeMainPages = {
	Университет: { url: 'https://www.brstu.ru', width: 800 },
	'Сведения об образовательной организации': { url: 'https://www.brstu.ru/sveden', width: 350 },
	Студенту: { url: 'https://www.brstu.ru/studentu', width: 200 },
	Абитуриенту: { url: 'https://www.brstu.ru/abitur', width: 200 },
	Специалисту: { url: 'https://www.brstu.ru/spetsialistu', width: 200 },
	Работнику: { url: 'https://www.brstu.ru/rabotniku', width: 200 },
}

export const ExtraPages: TypeExtraPages = {
	'Сведения об образовательной организации': [
		{ label: 'Основные сведения', url: 'https://www.brstu.ru/sveden/common' },
		{
			label: 'Структура и органы управления образовательной организацией',
			url: 'https://www.brstu.ru/sveden/struct',
		},
		{ label: 'Документы', url: 'https://www.brstu.ru/sveden/document' },
		{ label: 'Образование', url: 'https://www.brstu.ru/sveden/education' },
		{
			label: 'Образовательные стандарты и требования',
			url: 'https://www.brstu.ru/sveden/edustandarts',
		},
		{ label: 'Руководство', url: 'https://www.brstu.ru/sveden/managers' },
		{ label: 'Педагогический состав', url: 'https://www.brstu.ru/sveden/employees' },
		{
			label:
				'Материально-техническое обеспечение и оснащенность образовательного процесса. Доступная среда',
			url: 'https://www.brstu.ru/sveden/objects',
		},
		{ label: 'Стипендии и меры поддержки обучающихся', url: 'https://www.brstu.ru/sveden/grants' },
		{ label: 'Платные образовательные услуги', url: 'https://www.brstu.ru/sveden/paid-edu' },
		{ label: 'Финансово-хозяйственная деятельность', url: 'https://www.brstu.ru/sveden/budget' },
		{
			label: 'Вакантные места для приема (перевода) обучающихся',
			url: 'https://www.brstu.ru/sveden/vacant',
		},
		{ label: 'Международное сотрудничество', url: 'https://www.brstu.ru/sveden/inter' },
		{
			label: 'Организация питания в образовательной организации',
			url: 'https://www.brstu.ru/sveden/catering',
		},
	],
	Студенту: [
		{ label: 'Расписание', url: 'https://www.brstu.ru/studentu/raspisanie' },
		{
			label: 'Электронная информационно-образовательная среда',
			url: 'https://www.brstu.ru/studentu/elektronnaya-informatsionno-obrazovatelnaya-sreda-brgu',
		},
		{
			label: 'Дистанционное обучение',
			url: 'https://www.brstu.ru/studentu/distantsionnoe-obuchenie',
		},
		{
			label: 'Первичная профсоюзная организация студентов',
			url: 'https://www.brstu.ru/studentu/profkom-studentov',
		},
		{ label: 'Доступ к сети Wi-Fi', url: 'https://www.brstu.ru/studentu/wi-fi' },
		{ label: 'Студенческий совет', url: 'https://www.brstu.ru/studentu/studencheskij-sovet' },
		{
			label: 'Оздоровление студентов',
			url: 'https://www.brstu.ru/studentu/ozdorovlenie-studentov',
		},
		{ label: 'Доска почета', url: 'https://www.brstu.ru/studentu/doska-pocheta' },
		{
			label: 'Обучение инвалидов и лиц с ограниченными возможностями здоровья',
			url: 'https://www.brstu.ru/studentu/obuchenie-invalidov-i-lits-s-ogranichennymi-vozmozhnostyami-zdorovya',
		},
		{ label: 'Конкурсы, конференции', url: 'https://www.brstu.ru/studentu/konkursy-konferentsii' },
		{ label: 'Трудоустройство', url: 'https://www.brstu.ru/studentu/trudoustrojstvo' },
		{ label: 'Общежития БрГУ', url: 'https://www.brstu.ru/studentu/obshchezhitiya-brgu-2' },
		{ label: 'КУИЦ "ЕвроСибЭнерго-ИРНИТУ"', url: 'https://www.brstu.ru/studentu/kuic' },
		{
			label: 'Студенческое научное объединение',
			url: 'https://www.brstu.ru/studentu/studencheskoe-nauchnoe-obedinenie',
		},
		{ label: 'Практика', url: './', isDisabled: true },
	],
	Специалисту: [
		{
			label: 'Центр коллективного пользования',
			url: 'https://www.brstu.ru/spetsialistu/tsentr-kollektivnogo-polzovaniya',
		},
		{
			label: 'Испытательный центр "Братскстройцентр"',
			url: 'https://www.brstu.ru/spetsialistu/ispytatelnyj-tsentr-bratskstrojekspert',
		},
		{ label: 'Техцентр БрГУ', url: 'https://www.brstu.ru/spetsialistu/techcenter-brgu' },
		{
			label: 'Повышение квалификации',
			url: 'https://www.brstu.ru/spetsialistu/povyshenie-kvalifikatsii',
		},
		{ label: 'Центр развития компетенций', url: 'https://www.brstu.ru/spetsialistu/crk' },
		{
			label: 'Испытательная лаборатория (центр)',
			url: 'https://www.brstu.ru/spetsialistu/ispytatelnaya-laboratoriya-tsentr',
		},
	],
	Абитуриенту: [
		{ label: 'Анкета абитуриента', url: 'https://www.brstu.ru/abitur/anketa' },
		{
			label: 'Образовательные программы ФГБОУ ВО "БрГУ"',
			url: 'https://www.brstu.ru/abitur/obrazovatelnye-programmy-fgbou-vo-brgu',
		},
		{
			label: 'Информация о зачислении',
			url: 'https://priem.brstu.ru/screen#form=1',
		},
		{ label: 'Бакалавриат', url: 'https://www.brstu.ru/abitur/bachelor' },
		{ label: 'Специалитет', url: 'https://www.brstu.ru/abitur/special' },
		{ label: 'Магистратура', url: 'https://www.brstu.ru/abitur/magistr' },
		{ label: 'Аспирантура', url: 'https://www.brstu.ru/abitur/aspirant' },
		{ label: 'Среднее профессиональное образование', url: 'https://www.brstu.ru/abitur/spo' },
		{ label: 'Стоимость обучения', url: 'https://www.brstu.ru/abitur/stoimost-obucheniya' },
		{
			label: 'Вступительные испытания',
			url: 'https://www.brstu.ru/abitur/vstupitelnye-ispytaniya',
		},
		{ label: 'Целевое обучение', url: 'https://www.brstu.ru/abitur/tselevoe-obuchenie' },
		{ label: 'Общежития БрГУ', url: 'https://www.brstu.ru/abitur/obshchezhitiya-brgu' },
		{ label: 'Центральная приемная комиссия', url: 'https://www.brstu.ru/abitur/cpk' },
		{ label: 'Довузовская подготовка', url: 'https://www.brstu.ru/abitur/cdp' },
		{
			label: 'Подготовка иностранных граждан',
			url: 'https://www.brstu.ru/abitur/podgotovka-inostrannykh-grazhdan',
		},
	],
	Работнику: [
		{ label: 'Интранет-сайт', url: 'https://intranet.brgu.ru', isDisabled: true },
		{
			label: 'Повышение квалификации',
			url: 'https://www.brstu.ru/rabotniku/povyshenie-kvalifikatsii',
		},
		{
			label: 'Первичная профсоюзная организация работников',
			url: 'https://www.brstu.ru/rabotniku/pervichnaya-profsoyuznaya-organizatsiya-rabotnikov',
		},
		{
			label: 'Телефонный справочник',
			url: 'https://www.brstu.ru/rabotniku/telefonnyj-spravochnik',
		},
	],
	Университет: {
		'Университет сегодня': [
			{
				label: 'Приветствие ректора',
				url: 'https://www.brstu.ru/universitetskij-kompleks/universitet-segodnya/privetstvie-rektora',
			},
			{
				label: 'Независимая оценка качества условий оказания услуг',
				url: 'https://www.brstu.ru/universitetskij-kompleks/universitet-segodnya/nezavisimaya-otsenka-kachestva-uslovij-okazaniya-uslug',
			},
			{
				label: 'Внутренняя система оценки качества образования',
				url: 'https://www.brstu.ru/universitetskij-kompleks/universitet-segodnya/otsenka-kachestva',
			},
			{
				label: 'Миссия и стратегия развития БрГУ',
				url: 'https://www.brstu.ru/universitetskij-kompleks/universitet-segodnya/missiya-brgu',
			},
			{
				label: 'История университета',
				url: 'https://www.brstu.ru/universitetskij-kompleks/universitet-segodnya/istoriya-universiteta',
			},
			{
				label: 'Рейтинги',
				url: 'https://www.brstu.ru/universitetskij-kompleks/universitet-segodnya/rekvizity',
			},
			{
				label: 'Часто задаваемые вопросы',
				url: 'https://www.brstu.ru/universitetskij-kompleks/universitet-segodnya/chasto-zadavaemye-voprosy',
			},
			{
				label: 'Обратная связь',
				url: 'https://www.brstu.ru/universitetskij-kompleks/universitet-segodnya/obratnaya-svyaz',
			},
			{
				label: 'Телефонный справочник',
				url: 'https://www.brstu.ru/universitetskij-kompleks/universitet-segodnya/telefonnyj-spravochnik',
			},
			{
				label: 'Схема проезда',
				url: 'https://www.brstu.ru/universitetskij-kompleks/universitet-segodnya/skhema-proezda',
			},
			{
				label: 'Карта сайта',
				url: 'https://www.brstu.ru/universitetskij-kompleks/universitet-segodnya/sitemap',
			},
		],
		Деятельность: [
			{
				label: 'Международная деятельность',
				url: 'https://www.brstu.ru/universitetskij-kompleks/deyatelnost/mezhdunarodnaya',
			},
			{
				label: 'Учебно-методическая деятельность',
				url: 'https://www.brstu.ru/universitetskij-kompleks/deyatelnost/umu',
			},
			{
				label: 'Издательская деятельность',
				url: 'https://www.brstu.ru/universitetskij-kompleks/deyatelnost/izdatelskaya',
			},
			{
				label: 'Научно-инновационная деятельность',
				url: 'https://www.brstu.ru/universitetskij-kompleks/deyatelnost/nauchno-innovatsionnaya',
			},
			{
				label: 'Национальный проект "Наука и Университеты"',
				url: 'https://www.brstu.ru/universitetskij-kompleks/deyatelnost/natsionalnyj-proekt-nauka-i-universitety',
			},
			{
				label: 'Научные издания БрГУ',
				url: 'https://www.brstu.ru/universitetskij-kompleks/deyatelnost/nauchnye-izdaniya-brgu',
			},
		],
		Структура: [
			{
				label: 'Ректорат',
				url: 'https://www.brstu.ru/universitetskij-kompleks/struktura/rektorat',
			},
			{
				label: 'Ученый совет',
				url: 'https://www.brstu.ru/universitetskij-kompleks/struktura/uchenyj-sovet',
			},
			{
				label: 'Советы ФГБОУ ВО "БрГУ"',
				url: 'https://www.brstu.ru/universitetskij-kompleks/struktura/sovety-fgbou-vo-brgu',
			},
			{
				label: 'Факультеты',
				url: 'https://www.brstu.ru/universitetskij-kompleks/struktura/fakultety',
			},
			{
				label: 'Подразделения',
				url: 'https://www.brstu.ru/universitetskij-kompleks/struktura/podrazdeleniya',
			},
			{
				label: 'Профсоюзные организации',
				url: 'https://www.brstu.ru/universitetskij-kompleks/struktura/profsoyuznye-organizatsii-fgbou-vo-brgu',
			},
		],
	},
}

export type TypeMainPagesExport = keyof typeof MainPages
export type TypeExtraPagesExport = keyof typeof ExtraPages
