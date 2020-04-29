<template>
	<div class="loader">
		<transition name="slide" v-on:after-enter="afterEnter" v-on:before-leave="beforeLeave">
			<div :class="loaderClass" v-if="state"></div>
		</transition>
	</div>
</template>

<script>
export default {
	name: 'SlideLoader',
	props: ['display'],
	data: () => ({
		state: false,
		animEnd: false
	}),
	computed: {
		loaderClass() {
			return 'loader__progress' + (this.animEnd ? ' slide-wait' : '');
		}
	},
	watch: {
		display(newValue) {
			if (newValue) {
				this.state = true;
			} else {
				setTimeout(() => (this.state = false), 300);
			}
		}
	},
	methods: {
		afterEnter() {
			this.animEnd = true;
		},
		beforeLeave() {
			this.animEnd = false;
		}
	},
	mounted() {
		this.state = !!this.display;
	}
};
</script>

<style lang="scss">
	.loader .slide-enter-active {
		transition: transform 3s, opacity .3s;
		transform: translateX(-100%); opacity: 0;
	}

	.loader .slide-leave-active {
		transition: transform 1s, opacity 1.3s;
		transform: translateX(-50%); opacity: 0;
	}

	.loader .slide-enter-to, .slide-wait {
		transform: translateX(-50%); opacity: 1;
	}

	.loader .slide-leave-to {
		transform: translateX(0%); opacity: 0;
	}

	.loader {
		min-width: 100%;
		height: 1px;
		margin-top: -1px;
		overflow-x: hidden;
		display: flex;
	}

	.loader__progress {
		min-height: 100%;
		min-width: 100%;
		background-color: #496FA9;
	}
</style>
