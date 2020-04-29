<template lang="pug">
	#app(:class="appClass")
		router-view
</template>

<script>
import 'vue-material/dist/vue-material.min.css';
import 'vue-material/dist/theme/default.css';
import '@/scss/layout.scss';

export default {
	name: 'App',
	computed: {
		appClass() {
			return (this.$route.meta.appClass || '');
		}
	}
};
</script>

<style lang="scss">
	html {
		margin: 0;
		padding: 0;
		height: 100%;
	}

	body {
		margin: 0;
		padding: 0;
		height: 100%;
	}

	#app {
		height: 100%;
		min-height: 100%;
		position: relative;
	}

	.ps {
		position: relative;
	}
</style>
