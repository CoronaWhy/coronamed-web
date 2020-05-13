<template lang="pug">
	.tables-view-page(
		v-shortkey="{ 1: ['ctrl', 'v'], 2: ['meta', 'v'] }",
		@shortkey="pasteAction()"
	)
		h6.page-title.mb-4
			b(v-if="displayCategory") {{ displayCategory }} -&nbsp;
			span {{ displayName }}

		// Display table case
		slide-loader(:display="isPageLoading")

		md-table(
			v-if="!isPageLoading",
			v-model="displayList",
			:md-sort.sync="currentSort",
			:md-sort-order.sync="currentSortOrder",
			:md-sort-fn="customSort"
			md-card
		)
			// Card header
			md-table-toolbar.md-card-toolbar
				.md-toolbar-section-start
					.line.mt-2
						router-link.btn(:to="{ name: 'tables' }") Show List

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
					span(v-html="value")

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
import tableResize from '@/lib/table-resize';
import { fetchTweetCounts } from '@/lib/tweet';

import { isLink, parseNumber } from '@/utils/str';

export default {
	name: 'TableViewPage',
	components: {
	},
	mixins: [],
	data: () => ({
		displayError: null,
		sheet: null,
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
		pageTitle() {
			return this.displayTitle;
		},
		displayName() {
			return _get(this.sheet, 'name', null);
		},
		displayCategory() {
			return _get(this.sheet, 'category', null);
		},
		displayTitle() {
			const title = _get(this.sheet, 'title', null);

			switch (true) {
				case title && title.length > 0:
					return title;

				case this.isPageLoading:
					return 'Loading...';

				default:
					return 'Unknown';
			}
		},
		sheetId() {
			return this.$route.params.id;
		},
		parsedDataSet() {
			let cellCur = 0;

			const rows = _get(this.sheet, 'rows', []);
			const header = _get(this.sheet, 'header', []).map((headerName, index) => {
				if (!headerName && index === 0) {
					return 'ID';
				} else if (!headerName) {
					return `Cell ${cellCur++}`;
				}

				return headerName;
			});

			const maxTextLen = {};
			const result = rows
				// .filter(set => set.length - header.length >= 0)
				.map(row => {
					const obj = {};

					header.forEach((key, index) => {
						const rawValue = _get(row, ['cells', index, 'v']);
						const numValue = parseNumber(rawValue);

						let value = rawValue;
						let textLen = String(rawValue).length;

						if (numValue !== null && String(rawValue).indexOf('-') < 0) {
							value = numValue;
						} else if (isLink(rawValue)) {
							textLen = 4;
							value = `<a href="${value}" target="_blank">link</a>`;
						}

						obj[key] = value;

						maxTextLen[key] = Math.max(
							textLen,
							maxTextLen[key] || 0
						);
					});

					return obj;
				});

			return { maxTextLen, list: result };
		}
	},
	watch: {
		'sheetId': {
			handler: 'fetchData',
			immediate: true
		},
		'parsedDataSet': {
			handler() {
				this.computeColumnStyles();
				this.computeDisplayList();
			},
			immediate: true
		}
	},
	methods: {
		async pasteAction() {
			try {
				const text = await navigator.clipboard.readText();

				if (!text || !text.length) {
					return;
				}

				const rows = text
					.split('\n')
					.map(v => v.trim().split('\t'));

				const maxCells = Math.max(...rows.map(v => v.length));

				if (!rows || !maxCells) {
					return;
				}

				this.$swal.dialog({
					title: `Adding ${rows.length} rows with ${maxCells} columns into table?`,
					preConfirm: () => {
						const apiUrl = `v1/sheets/${this.sheetId}/rows/plain`;

						return this.$http.patch(apiUrl, { text });
					}
				}).then(() => {
					this.fetchData();
					this.$swal.success('Success', `Successfully added`);
				}).catch(err => {
					if (err === 'cancel') return;
					this.$swal.showError('Failed', err);
					this.$store.dispatch('pageLoader', false);
				});
			} catch (err) {
				this.$swal.warn('Sorry, we cannot access to clipboard data, maybe you are using old browser.');
			}
		},
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
			const apiUrl = `v1/sheets/${this.sheetId}`;

			this.$store.dispatch('pageLoader', true);
			this.sheet = null;
			this.dataSet = [];
			this.displayError = null;

			return this.$http.get(apiUrl)
				.then(result => {
					this.$store.dispatch('pageLoader', false);
					this.sheet = result;

					setTimeout(() => this.initResize(), 400);
				})
				.then(() => fetchTweetCounts(this.parsedDataSet))
				.catch(err => {
					console.warn('failed to fetch sheet:', err);

					this.$store.dispatch('pageLoader', false);
					this.displayError = err.message;
				});
		},
		computeColumnStyles() {
			const result = {};

			Object.keys(this.parsedDataSet.maxTextLen).forEach(key => {
				const maxTextSize = this.parsedDataSet.maxTextLen[key];
				let minWidth = 100 + Math.min(maxTextSize * 4, 540);

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
