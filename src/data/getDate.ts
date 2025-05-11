
const getDate = (): [string, string, string] => {
	const today = new Date()

	const dd = String(today.getDate()).padStart(2, '0')
	const mm = String(today.getMonth() + 1).padStart(2, '0')
	const yyyy = today.getFullYear()
	const dmy = `${dd}.${mm}.${yyyy}, `

	const formatter = new Intl.DateTimeFormat('ru', {
		weekday: 'long',
	})
	const weekday = formatter.format(today)
	const curWeek = getWeek2(today)
	const weekText = curWeek % 2 === 0 ? ', нижняя неделя' : ', верхняя неделя'

	return [dmy, weekday, weekText]
}

function getWeek2(date: Date): number {
	const onejan = new Date(date.getFullYear(), 0, 1)
	return Math.ceil(((date.getTime() - onejan.getTime()) / 86400000 + onejan.getDay() - 1) / 7)
}

export default getDate
