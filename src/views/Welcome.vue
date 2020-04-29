<template>
	<div class="home">Welcome</div>
</template>

<script>
// import { loadData } from '@/lib/data';

export default {
	name: 'Welcome',
	mounted() {
		this.$store.dispatch('pageLoader', false);
		this.$router.push({ name: 'tables' });
		// console.log('process.env.VUE_APP_DATA_FIELS', this.$store.getters.appDataList);

		// this.$store.getters.appDataList.forEach(filePath => {
		// 	const file = filePath.substring(5);
		// 	const loader = loadData(file);

		// 	const data = loader().then(result => {
		// 		console.log(file, result);
		// 	});
		// });
	}
};
</script>
