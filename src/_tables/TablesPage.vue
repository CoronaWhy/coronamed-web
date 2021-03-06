<template lang="pug">
	.tables-page
		// Display nested view
		router-view

		// Display table case
		template(v-if="showList")
			md-card.mb-4
				md-card-content
					h5 Literature Review
					p
						.line Using publications from the CORD-19 dataset <a href="https://www.kaggle.com/allen-institute-for-ai/CORD-19-research-challenge/discussion/137474" target="_blank">(Last updated: 2020-05-12)</a>
						.line Covers <a href="https://www.kaggle.com/antgoldbloom/literature-review-coverage/" target="_blank">10.1%</a> of the studies published since February 1 (834 of the 8221 papers)

					h5 About This Review
					p These findings have been extracted from the CORD-19 papers by machine learning algorithms with a human curation overlay (process described in <a href="https://www.kaggle.com/allen-institute-for-ai/CORD-19-research-challenge/discussion/142298" target="_blank">this thread</a>). The results and quotes on this page should not be relied on without reading and assessing the validity of the underlying research. If you see a conclusion that is misrepresented, please use the <a href="https://www.kaggle.com/covid-19-contributions#feedback" target="_blank">feedback section</a> of this page to report it.
					p This project is a part of the White House Office of Science and Technology Policy’s <a href="https://www.whitehouse.gov/briefings-statements/call-action-tech-community-new-machine-readable-covid-19-dataset/" target="_blank">call to action</a> for the technology community and addresses research priorities defined by the National Academies and the World Health Organization.
					p This review can be useful for those wanting a quick overview of what the latest literature is saying on the topics we cover. It might also help those writing local guides, expert opinions or systematic reviews. Click on the topic in the table of contents below to see the results table for that topic.
			md-card
				// Card header
				md-toolbar(md-elevation="0").md-card-toolbar.md-toolbar.md-table-toolbar.md-transparent.md-card-toolbar.md-theme-default.md-elevation-0
					.md-toolbar-section-start
						.md-title
							.pt-2 Key Scientific Questions about COVID-19 <small>({{ displayList.length }} questions)</small>
							a.btn.btn-link(:href="exportUrl", target="_blank") EXPORT ALL

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
							span {{ item.name }}

						md-table-cell(md-label="Records",  md-sort-by="recordsAmount")
							span {{ item.recordsAmount }}

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
		},
		exportUrl() {
			const baseUrl = process.env.VUE_APP_API_ENDPOINT;
			return `${baseUrl}/v1/sheets/export`;
		}
	},
	watch: {
		'currentSort': 'updateSortFilter',
		'currentSortOrder': 'updateSortFilter',
		'showList'() {
			this.$nextTick(() => this.refresh());
		}
	},
	mounted() {
		this.$root.$emit('sidebar:hide', 'left');
		this.$root.$emit('sidebar:hide', 'right');

		this.$nextTick(() => this.refresh());
	},
	methods: {
		refresh() {
			if (!this.showList) return;

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
