<template lang="pug">
	header.app-header
		.app-header__container
			.row.no-gutters.justify-content-between
				.col-auto.align-self-start.align-self-center
					.sandwich-button(@click="toogleSidebar")
						i.fa.fa-bars
				.col-auto.align-self-end.align-self-center
					img(src="/img/logo.png")

		slide-loader(:display="isPageLoading")
</template>

<script>
import { mapGetters } from 'vuex';

export default {
	name: 'AppHeader',
	data: () => ({}),
	computed: {
		...mapGetters(['isPageLoading']),
	},
	methods: {
		toogleSidebar() {
			this.$root.$emit('sidebar:toggle', 'left');
		}
	},
	mounted() {}
};
</script>

<style lang="scss">
	.app-header {
		.loader {
			display: block;
			position: absolute;
			top: 0;
			left: 0;
			height: 3px;
			width: 100%;
		}

		.loader .loader__progress {
			background-color: #A8A3FF;
		}

		.sandwich-button {
			font-size: 30px;
			height: 40px;
			width: 40px;
			line-height: 40px;
			text-align: center;
			cursor: pointer;
			color: #38456C;
		}
	}
</style>
