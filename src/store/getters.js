export function isPageLoading(state) {
	return !!state.pageLoader;
}

export function scheduledMessagesRefreshCount(state) {
	return state.scheduledMessagesRefreshCount;
}
