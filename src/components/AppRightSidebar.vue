<template lang="pug">
	.app-sidebar.app-sidebar--right
		// display custom component
		component(:is="customComponent", v-if="customComponent")
</template>

<script>
export default {
	name: 'AppRightSidebar',
	computed: {
		customComponent() {
			return this.$route.meta.sidebarRightComponent || null;
		}
	}
};
</script>
