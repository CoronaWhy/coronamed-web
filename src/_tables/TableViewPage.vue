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
						router-link.btn(:to="{ name: 'tables' }") SHOW LIST
						a.btn(:href="exportUrl", target="_blank") EXPORT (CSV)

				md-field.md-toolbar-section-end(md-clearable)
					md-input(placeholder="Search" v-model="searchTerm", @input="computeDisplayList")

			// Card content
			md-table-row(slot="md-table-row", slot-scope="{ item, index }")
				md-table-cell(
					v-for="(value, cellIndex) in item.cells",
					:style="columnStyle[cellIndex]",
					:key="index + ':' + cellIndex",
					:md-label="parsedDataSet.header[cellIndex]",
					:md-sort-by="String(cellIndex)",
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

		// Display paste dialog
		md-dialog(
			:md-active.sync="showPasteDialog",
			:md-click-outside-to-close="!isPageLoading",
			:md-close-on-esc="!isPageLoading",
			:md-fullscreen="true"
		)
			md-dialog-title Paste {{ pasteDataSet.length -1 }} rows into table?

			md-dialog-content(v-if="pasteDataSetNative")
				md-field
					label Paste copied table
					md-textarea(@input="onPasteDataSetNativeInput")

			md-dialog-content(v-if="pasteDataSet.length < 2")
				.text-danger Your data-set has less than two rows, make sure that you copied the headers too.
			md-dialog-content(v-else)
				table.table__log.full-width
					tr
						th(v-for="header in pasteDataSet[0]") {{ header }}
					tr(v-for="row in pasteDataSet.slice(1)")
						td(v-for="cell in row") {{ cell }}

			md-dialog-actions(v-if="isPageLoading")
				md-button(:disabled="true") SENDING...
			md-dialog-actions(v-else-if="pasteDataSet.length >= 2")
				md-button(@click="showPasteDialog = false") CLOSE
				md-button(class="md-accent", @click="sendPasteAction(true)") REPLACE ALL
				md-button(class="md-primary", @click="sendPasteAction()") INSERT +
			md-dialog-actions(v-else)
				md-button(@click="showPasteDialog = false") CLOSE
</template>

<script>
import _get from 'lodash/get';
import _sortBy from 'lodash/sortBy';

import { mapGetters } from 'vuex';
import tableResize from '@/lib/table-resize';
import sheetclip from '@/lib/sheetclip';
import { fetchTweetCounts, initialPatch } from '@/lib/tweet';

import { isLink, parseNumber } from '@/utils/str';

export default {
	name: 'TableViewPage',
	components: {
	},
	mixins: [],
	data: () => ({
		displayError: null,
		showPasteDialog: false,
		pasteDataSet: [],
		pasteDataSetNative: false,
		sheet: null,
		displayList: [],
		dataSet: [],
		searchTerm: '',
		currentSort: '0',
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
				.map((row) => {
					const allValues = [];
					const cells = header.map((header, cellIndex) => {
						const rawValue = _get(row, ['cells', cellIndex, 'v']);
						const numValue = parseNumber(rawValue);

						let value = rawValue;
						let textLen = String(rawValue).length;

						if (numValue !== null && String(rawValue).indexOf('-') < 0) {
							value = numValue;
						} else if (isLink(rawValue)) {
							textLen = 4;
							value = `<a href="${value}" target="_blank">link</a>`;
						}

						maxTextLen[cellIndex] = Math.max(
							textLen,
							maxTextLen[cellIndex] || 0
						);

						allValues.push(String(value).toLowerCase());

						return value;
					});

					return { cells, fullText: allValues.join(' ') };
				});

			return { maxTextLen, header, rows: result };
		},
		exportUrl() {
			const baseUrl = process.env.VUE_APP_API_ENDPOINT;
			return `${baseUrl}/v1/sheets/${this.sheetId}/export/csv`;
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
		async sendPasteAction(withReplace = false) {
			const apiUrl = `v1/sheets/${this.sheetId}/rows/plain`;
			const rows = this.pasteDataSet;

			this.$store.dispatch('pageLoader', true);

			try {
				if (withReplace) {
					await this.$http.put(apiUrl, rows);
				} else {
					await this.$http.patch(apiUrl, rows);
				}

				this.showPasteDialog = false;
				this.pasteDataSet = [];

				this.fetchData();
			} catch (err) {
				this.$swal.showError('Failed', err);
			}

			this.$store.dispatch('pageLoader', false);
		},
		async pasteAction() {
			this.pasteDataSetNative = false;
			this.showPasteDialog = true;
			this.pasteDataSet = [];

			try {
				const text = await navigator.clipboard.readText();
				this.onPasteDataSetNativeInput(text);
			} catch (err) {
				this.pasteDataSetNative = true;
			}
		},
		onPasteDataSetNativeInput(value) {
			try {
				const rows = sheetclip.parse(value);
				this.pasteDataSet = rows;
				this.pasteDataSetNative = false;
			} catch (err) {
				console.warn('failed to parse pasted text.');
			}

			return value;
		},
		customSort(value) {
			const list = _sortBy(value, v => _get(v, `cells.${this.currentSort}`));

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
					this.sheet = initialPatch(result);

					setTimeout(() => this.initResize(), 400);
				})
				.then(() => fetchTweetCounts(this.sheet))
				.then(result => { this.sheet = result })
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
			const searchTerm = this.searchTerm.toLowerCase();

			this.displayList = this.parsedDataSet.rows.filter(row => {
				return row.fullText.indexOf(searchTerm) > -1;
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
