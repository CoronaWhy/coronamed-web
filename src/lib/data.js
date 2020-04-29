export function loadData(filePath) {
	return () => import(/* webpackChunkName: "app-data-[request]" */ `@/data/${filePath}`);
}
