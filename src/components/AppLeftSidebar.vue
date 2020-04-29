<template lang="pug">
	.app-sidebar.app-sidebar--left
		// display custom component
		component(:is="customComponent", v-if="customComponent")

		// display nav
		.scrollbar-wrapper.scrollbar-wrapper--sp(v-else)
			.app-sidebar__body
				sidebar-nav

			.app-sidebar__footer v. {{ appVersion }}
</template>

<script>
import SidebarNav from '@/components/SidebarNav.vue';

export default {
	name: 'AppLeftSidebar',
	data: () => ({
		appTitle: process.env.VUE_APP_TITLE,
		appVersion: process.env.VUE_APP_VERSION
	}),
	components: {
		SidebarNav
	},
	computed: {
		customComponent() {
			return this.$route.meta.sidebarLeftComponent || null;
		}
	}
};
</script>
