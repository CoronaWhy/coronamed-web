<template lang="pug">
	div(v-if="hasMore")
		ladda(
			:disabled="!hasMore"
			:loading="isLoading"
			class="btn btn-primary btn-block"
			data-style="zoom-out"
			@click="more"
		) Load more
	div(v-else-if="!hideTotal") Total: {{ total }}
</template>

<script>
export default {
	name: 'PaginationMore',
	props: {
		prePage: {
			type: Number,
			default: 10
		},
		pipe: {
			type: Function,
			required: true
		},
		disableScroll: {
			type: Boolean,
			default: false
		},
		hideTotal: {
			type: Boolean,
			default: false
		}
	},
	data: () => ({
		uid: 'pagin_' + Date.now(),
		list: [],
		hasMore: true,
		isLoading: false,
		curPage: 1
	}),
	computed: {
		total() {
			return this.list.length;
		}
	},
	watch: {
		list(newValue) {
			this.$emit('input', newValue);
		}
	},
	methods: {
		reset() {
			this.curPage = 1;
			this.hasMore = true;
			this.isLoading = false;
		},
		more() {
			if (!this.hasMore || this.isLoading) return;

			this.curPage++;
			this.fetch();
		},
		fetch() {
			const args = {
				_page: this.curPage,
				_offset: (this.curPage - 1) * this.prePage,
				_limit: this.prePage
			};

			const promise = this.pipe(args);

			if (!promise || !promise.then) return;

			this.isLoading = true;

			return promise.then(result => {
				if (!result.length || result.length < this.prePage) {
					this.hasMore = false;
				}

				if (args['_page'] === 1) {
					this.list = result;
				} else {
					this.list = this.list.concat(result);
				}

				this.isLoading = false;
			}).catch(err => {
				this.isLoading = false;
				throw err;
			});
		},
		handleScroll() {
			if (this.disableScroll) return;

			const limit = document.body.scrollHeight - 15;
			const curScroll = window.innerHeight + window.scrollY;

			if (curScroll > limit) {
				console.debug('scroll down detected for:', this.uid);
				this.more();
			}
		}
	},
	created() {
		window.addEventListener(`scroll`, this.handleScroll);
	},
	destroyed() {
		window.removeEventListener(`scroll`, this.handleScroll);
	},
	mounted() {
		this.fetch();
	}
};
</script>

<style scoped lang="scss">
	.paginate {
		min-height: 35px;
		position: relative;
	}
</style>
