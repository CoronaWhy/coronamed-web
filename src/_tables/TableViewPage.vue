<template lang="pug">
	.tables-view-page
		slide-loader(:display="isPageLoading")

		// Display table case
		md-table(
			v-model="displayList",
			:md-sort.sync="currentSort",
			:md-sort-order.sync="currentSortOrder"
			md-card
		)
			// Card header
			md-table-toolbar.md-card-toolbar
				.md-toolbar-section-start
					.line.mt-2
						router-link.btn(:to="{ name: 'tables' }") Show List
						.md-title.mr-4(style="font-size: 12px;")
							.text-break {{ frendlyFileName }}

				md-field.md-toolbar-section-end(md-clearable, v-if="!displayError")
					md-input(placeholder="Search" v-model="searchTerm", @input="computeDisplayList")

			// Card content
			md-table-row(slot="md-table-row", slot-scope="{ item, index }")
				md-table-cell(
					v-for="(value, key) in item",
					:style="columnStyle[key.toLowerCase()]",
					:key="key + index",
					:md-label="key",
					:md-sort-by="key",
				)
					template(v-if="isLink(value)")
						a(:href="value", target="_blank") link
					template(v-else)
						span {{ value }}

			// Card footer
			template(v-slot:md-table-pagination)
				// Display error case
				md-empty-state.md-accent(
					v-if="displayError",
					md-icon="error_outline",
					md-label="Error",
					:md-description="displayError"
				)

			// Card footer
			template(v-slot:md-table-pagination)
				md-card-content
					.line Records: {{ displayList.length }}
</template>

<script>
import _get from 'lodash/get';
import _sortBy from 'lodash/sortBy';

import { mapGetters } from 'vuex';
import { loadData } from '@/lib/data';
import tableResize from '@/lib/table-resize';

import { isLink, parseNumber } from '@/utils/str';
import { frendlyString } from './utils';

export default {
	name: 'TableViewPage',
	components: {
	},
	mixins: [],
	data: () => ({
		displayError: null,
		displayList: [],
		dataSet: [],
		searchTerm: '',
		currentSort: 'ID',
		currentSortOrder: 'asc',
		columnStyle: {
			'id': 'min-width: 100px',
			'date': 'min-width: 110px'
		}
	}),
	computed: {
		...mapGetters(['isPageLoading']),
		baseTitle() {
			return [process.env.VUE_APP_TITLE, _get(this.$route, 'meta.title')]
				.filter(v => v && v.length)
				.join(' - ');
		},
		pageTitle() {
			return [this.baseTitle, this.frendlyFileName]
				.filter(v => v && v.length)
				.join(' / ');
		},
		filePath() {
			return this.$route.params.id;
		},
		frendlyFileName() {
			return frendlyString(this.filePath || '');
		},
		parsedDataSet() {
			let cellCur = 0;

			const list = this.dataSet.slice(1);
			const header = (this.dataSet[0] || []).map((headerName, index) => {
				if (!headerName && index === 0) {
					return 'ID';
				} else if (!headerName) {
					return `Cell ${cellCur++}`;
				}

				return headerName;
			});

			const maxTextLen = {};
			const result = list
				.filter(set => set.length - header.length >= 0)
				.map(set => {
					const obj = {};

					header.forEach((key, index) => {
						const rawValue = set[index];
						const numValue = parseNumber(rawValue);

						if (numValue !== null) {
							obj[key] = numValue;
						} else {
							obj[key] = set[index];
						}

						maxTextLen[key] = Math.max(
							String(obj[key]).length,
							maxTextLen[key] || 0
						);
					});

					return obj;
				});

				return { maxTextLen, list: result };
		}
	},
	watch: {
		'id': {
			handler: 'fetchData',
			immediate: true
		},
		'parsedDataSet': {
			handler() {
				this.computeColumnStyles();
				this.computeDisplayList();
			},
			immediate: true
		},
		pageTitle: {
			handler(newValue) {
				document.title = newValue;
			},
			immediate: true
		}
	},
	methods: {
		isLink,
		customSort(value) {
			const list = _sortBy(value, this.currentSort);

			if (this.currentSortOrder === 'desc') {
				return list.reverse();
			}

			return list;
		},
		initResize() {
			const thead = this.$el.querySelector('thead');
			tableResize(thead);

			// flush column styles to give ability change size
			this.$nextTick(() => {
				this.columnStyle = {};
			});
		},
		fetchData() {
			const loader = loadData(`tables/${this.filePath}`);

			this.$store.dispatch('pageLoader', true);
			this.dataSet = [];
			this.displayError = null;

			loader().then(result => {
				this.dataSet = result.default;
				this.$nextTick(() => {
					this.initResize();
				});
			}).catch(err => {
				this.displayError = err.message;
			}).then(() => {
				this.$store.dispatch('pageLoader', false);
			});
		},
		computeColumnStyles() {
			const result = {};

			Object.keys(this.parsedDataSet.maxTextLen).forEach(key => {
				const maxTextSize = this.parsedDataSet.maxTextLen[key];
				let minWidth = Math.min(maxTextSize * 5, 540);

				minWidth = Math.max(minWidth, 100);

				result[key.toLowerCase()] = {
					'min-width': Math.floor(minWidth) + 'px'
				};
			});

			this.columnStyle = result;
		},
		computeDisplayList() {
			this.displayList = this.parsedDataSet.list.filter(v => {
				const searchbleText = Object.keys(v)
				.map(key => String(v[key]).toLowerCase())
				.join(' ');

				return searchbleText.indexOf(this.searchTerm) > -1;
			});
		}
	}
};
</script>

<style lang="scss">
	.tables-view-page {
		.md-table-content {
			max-height: calc(100vh - 195px) !important;
		}

		.md-table-cell {
			vertical-align: top;
		}

		.md-table-cell-container {
			font-size: 11px;
			word-break: break-all;
		}
	}
</style>
