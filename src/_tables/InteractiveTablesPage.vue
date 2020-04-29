<template lang="pug">
	.interactive-tables-page
		iframe(src="https://app.powerbi.com/view?r=eyJrIjoiN2VmMDI3MzYtNzQyZC00NGFhLWFhOGYtY2IwMzgzNGNkNzVmIiwidCI6ImRjMWYwNGY1LWMxZTUtNDQyOS1hODEyLTU3OTNiZTQ1YmY5ZCIsImMiOjEwfQ%3D%3D")
</template>

<script>
export default {
	name: 'InteractiveTablesPage',
	components: {
	},
	mixins: [],
	data: () => ({
	}),
	computed: {
	},
	watch: {
	},
	mounted() {
	},
	methods: {
	}
};
</script>

<style lang="scss">
	.interactive-tables-page iframe {
		width: 100%;
		height: calc(100vh - 100px);
		border: none;
	}
</style>
