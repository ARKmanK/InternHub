type TypeSaveAnswerData = {
	zip: File[]
	url: string
	images: File[]
	comment: string
}

export const saveAnswerData = ({ zip, url, images, comment }: TypeSaveAnswerData): void => {
	console.log(zip, url, images, comment)
}
