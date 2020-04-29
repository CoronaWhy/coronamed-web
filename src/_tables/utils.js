export function trimExt(str) {
	const parts = str.split('.');

	if (parts.length > 1) {
		return parts.slice(0, -1).join('.');
	}

	return str;
}

export function frendlyString(str) {
	str = trimExt(str);

	const result = str
		.replace(/\\/g, ' ')
		.replace(/\//g, ' ')
		.replace(/[^0-9a-zA-Z ]/gi, '')
		.replace(/ +(?= )/g, '')
		.trim();

	return result;
}
