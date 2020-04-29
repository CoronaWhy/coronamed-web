import _debounce from 'lodash/debounce';

export default {
	data() {
		const result = {
			filter: {},
			debounceRefresh: _debounce(() => {
				if (typeof this.refresh !== 'function') {
					console.warn('this.refresh is not a function.');
					return;
				}

				this.refresh();
			}, 500),
			searchAlias: {},
			searchInit: false
		};

		return result;
	},
	computed: {
		filterCriteria() {
			const result = {};

			for (let key in this.filter) {
				if (this.filter[key] === '') continue;
				result[key] = this.filter[key];
			}

			return result;
		}
	},
	watch: {
		filter: {
			handler() {
				if (!this.searchInit) return;
				this.debounceRefresh();
			},
			deep: true
		}
	},
	methods: {
		// Default refresh
		refresh() {
			const pagin = this.$refs.pagin;
			console.debug('default refresh');

			if (pagin) {
				pagin.reset();
				pagin.fetch();
			}
		},
		clearFilters() {
			const result = {};

			Object.keys(this.filter).forEach(key => {
				this.$set(result, key, '');
			});

			this.filter = result;
		},
		setFilter(name, value, single = true) {
			if (single) this.clearFilters();

			const key = this.searchAlias[name] || name;
			this.filter = Object.assign({}, this.filter, { [key]: value });
		},
		toggleFilter(name, value, single) {
			if (this.filter[name] === value) value = '';
			this.setFilter(name, value, single);
		}
	},
	mounted() {
		// this.clearFilters();
		this.$on('filter:set', this.setFilter.bind(this));

		setInterval(() => (this.searchInit = true), 1000);
	}
};
