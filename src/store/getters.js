const APP_DATA_LIST = (process.env.VUE_APP_DATA_FIELS || '')
	.split('|_|')
	.filter(v => v && v.length);

export function isPageLoading(state) {
	return !!state.pageLoader;
}

export function appDataList() {
	return [...APP_DATA_LIST];
}
