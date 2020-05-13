<template lang="pug">
	.tables-page
		// Display nested view
		router-view

		// Display table case
		template(v-if="showList ")
			md-card
				// Card header
				md-toolbar(md-elevation="0").md-card-toolbar.md-toolbar.md-table-toolbar.md-transparent.md-card-toolbar.md-theme-default.md-elevation-0
					.md-toolbar-section-start
						.md-title Questions ({{ displayList.length }} questions)

					md-field.md-toolbar-section-end(md-clearable)
						md-input(placeholder="Search by title..." v-model="filter.q")

				teamplte(v-if="displayError")
					.text-danger.p-4 {{ displayError }}

				md-table(
					v-else,
					v-model="displayList",
					:md-sort.sync="currentSort",
					:md-sort-order.sync="currentSortOrder"
				)
					// Card content
					md-table-row.md-has-selection(
						slot="md-table-row",
						slot-scope="{ item }",
						@click="onSelect(item)"
					)
						md-table-cell(md-label="File Name",  md-sort-by="title")
							template(v-if="item.category")
								span {{ item.category }}&nbsp;
								b {{ item.name }}
							template(v-else)
								span {{ item.title }}

					// Card footer
					template(v-slot:md-table-pagination)
						md-card-content
							.line Files: {{ displayList.length }}
</template>

<script>
import { mapGetters } from 'vuex';
import searchMixin from '@/mixins/search';

export default {
	name: 'TablesPage',
	components: {
	},
	mixins: [searchMixin],
	data: () => ({
		currentSort: 'title',
		currentSortOrder: 'asc',
		displayList: [],
		displayError: null,
		filter: {
			q: '',
			sort: 'title:asc'
		},
	}),
	computed: {
		...mapGetters(['isPageLoading']),
		pageTitle() {
			if (this.showList) {
				return 'Table';
			}

			return null;
		},
		showList() {
			return this.$route.name === 'tables';
		}
	},
	watch: {
		'currentSort': 'updateSortFilter',
		'currentSortOrder': 'updateSortFilter',
		'showList': 'refresh'
	},
	mounted() {
		this.$root.$emit('sidebar:hide', 'left');
		this.$root.$emit('sidebar:hide', 'right');
		this.refresh();
	},
	methods: {
		refresh() {
			console.log('refresh sheets list');

			const apiUrl = 'v1/sheets';

			this.$store.dispatch('pageLoader', true);
			this.displayError = null;

			const params = Object.assign({},
				this.filterCriteria
			);

			return this.$http.get(apiUrl, { params }).then(result => {
				this.displayList = result;
				this.$store.dispatch('pageLoader', false);
			}).catch(err => {
				console.warn('failed to load data:', err);
				this.displayError = err.message;
				this.$store.dispatch('pageLoader', false);
			});
		},
		updateSortFilter() {
			if (!this.currentSort) {
				this.filter.sort = '';
			} else {
				this.filter.sort = `${this.currentSort}:${this.currentSortOrder}`;
			}
		},
		onSelect(item) {
			this.$router.push({
				name: 'tables.view',
				params: { id: item._id }
			});
		}
	}
};
</script>
