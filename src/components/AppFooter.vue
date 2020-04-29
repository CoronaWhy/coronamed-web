<template lang="pug">
	footer.app-footer
		//- span {{ appTitle }} &copy; {{ currentYear }}.
		//- span.ml-auto.smal v.{{ appVersion }}
</template>

<script>
export default {
	name: 'AppFooter',
	data: () => ({
		appTitle: process.env.VUE_APP_TITLE,
		appVersion: process.env.VUE_APP_VERSION
	}),
	computed: {
		currentYear() {
			return new Date().getFullYear();
		}
	}
};
</script>
