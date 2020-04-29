<template lang="pug">
	#panel(:class="panelClass")
		app-header

		#content
			app-left-sidebar
			app-right-sidebar

			.container-fluid(:class="containerClass")
				transition(name="slide-fade")
					router-view
			app-footer
</template>

<script>
import '@/scss/containers/panel.scss';

import { mapGetters } from 'vuex';
import BootstrapVue from 'bootstrap-vue';
import Vue from 'vue';

import AppHeader from '@/components/AppHeader.vue';
import AppLeftSidebar from '@/components/AppLeftSidebar.vue';
import AppRightSidebar from '@/components/AppRightSidebar.vue';
import AppFooter from '@/components/AppFooter.vue';

Vue.use(BootstrapVue);

const SIDEBAR_MOBILE_TRASHHOLD = 768;

export default {
	name: 'PanelContainer',
	components: {
		AppHeader,
		AppLeftSidebar,
		AppRightSidebar,
		AppFooter
	},
	data: () => ({
		isSidebarShow: {
			left: true,
			right: false
		}
	}),
	computed: {
		...mapGetters(['isPageLoading']),
		panelClass() {
			return {
				'app-sidebar--left--show': this.isSidebarShow['left'],
				'app-sidebar--right--show': this.isSidebarShow['right']
			};
		},
		containerClass() {
			return (this.$route.meta.containerClass || '');
		},
		isLoading() {
			return this.$store.state.loader;
		}
	},
	watch: {
		isPageLoading(newValue) {
			if (newValue && this.isMobileView()) {
				this.hideSidebar('left');
			}
		}
	},
	methods: {
		isMobileView() {
			return window.innerWidth < SIDEBAR_MOBILE_TRASHHOLD;
		},
		toggleSidebar(side = 'left') {
			this.isSidebarShow[side] = !this.isSidebarShow[side];

			if (this.isSidebarShow[side] && this.isMobileView()) {
				Object.keys(this.isSidebarShow).forEach(sideOf => {
					if (sideOf === side) return;
					this.isSidebarShow[sideOf] = false;
				});
			}
		},
		showSidebar(side = 'left') {
			this.isSidebarShow[side] = true;
		},
		hideSidebar(side = 'left') {
			this.isSidebarShow[side] = false;
		}
	},
	created() {
		this.$root.$on('sidebar:toggle', this.toggleSidebar);
		this.$root.$on('sidebar:show', this.showSidebar);
		this.$root.$on('sidebar:hide', this.hideSidebar);
	}
};
</script>
