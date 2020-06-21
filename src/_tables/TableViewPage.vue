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
			v-model="displayRows",
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
						router-link.btn(:to="{ name: 'tables.view.public', params: { id: sheetId } }", v-if="isShowPublicUrl") PUBLIC VERSION
						a.btn(:href="exportUrl", target="_blank") EXPORT (CSV)

				md-field.md-toolbar-section-end(md-clearable)
					md-input(placeholder="Search" v-model="searchTerm", @input="computeDisplayRowsDebounce")

				.col-12(v-if="!isShowPublicUrl")
					img(src="@/assets/public-sheets-helper.png", style="max-height: 120px")

			// Card content
			md-table-row(slot="md-table-row", slot-scope="{ item, index }")
				md-table-cell(
					v-for="(cellData, cellIndex) in item.cells",
					:key="index + ':' + cellIndex",
					:md-label="sheetDataSet.header[cellIndex]",
					:md-tooltip="getHint(sheetDataSet.header[cellIndex])",
					:md-sort-by="String(cellIndex)",
				)
					TableCell(
						:cellValue="cellData.v",
						:cellType="cellData.t",
						:cellData="cellData"
					)

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
					.line Records: {{ displayRows.length }}

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
import _debounce from 'lodash/debounce';

import { mapGetters } from 'vuex';
import tableResize from '@/lib/table-resize';
import sheetclip from '@/lib/sheetclip';
// import { fetchTweetCounts } from '@/lib/tweet';
import hints from './hints.json';

import TableCell from './TableCell.vue';

export default {
	name: 'TableViewPage',
	components: {
		TableCell
	},
	mixins: [],
	data: () => ({
		displayError: null,
		displayRows: [],
		showPasteDialog: false,
		pasteDataSet: [],
		pasteDataSetNative: false,
		sheet: null,
		sheetDataSet: null,
		searchTerm: '',
		currentSort: '0',
		currentSortOrder: 'asc'
	}),
	computed: {
		...mapGetters({
			isPageLoading: 'isPageLoading',
			isAuth: 'user/isAuth',
			accountRoles: 'user/roles'
		}),
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
		isShowPublicUrl() {
			return _get(this.$route, 'meta.showPublicUrl', false);
		},
		sheetFetchParams() {
			const result = {};
			const tableTransform = _get(this.$route, 'meta.tableTransform');

			if (tableTransform) {
				result.transform = tableTransform;
			}

			return result;
		},
		exportUrl() {
			const baseUrl = process.env.VUE_APP_API_ENDPOINT;

			let finalUrl = `${baseUrl}/v1/sheets/${this.sheetId}/export/csv`;

			const queryParams = Object.keys(this.sheetFetchParams)
				.map(key => `${key}=${this.sheetFetchParams[key]}`)
				.join('&');

			if (queryParams) {
				finalUrl += `?${queryParams}`;
			}

			return finalUrl;
		},
		accessScope() {
			return {
				'read': true,
				'write': (
					this.accountRoles.indexOf('ROLE_ADMIN') > -1 ||
					this.accountRoles.indexOf('ROLE_SHEET_EDIT') > -1
				)
			};
		},
	},
	watch: {
		'sheetId': {
			handler: 'fetchData',
			immediate: true
		},
		'sheetFetchParams': 'fetchData',
		'sheetDataSet': 'computeDisplayRows'
	},
	created() {
		this.computeDisplayRowsDebounce = _debounce(this.computeDisplayRows, 400);
	},
	methods: {
		computeDisplayRows() {
			console.warn('computing display rows');

			if (!this.sheetDataSet) {
				this.displayRows = [];
				return;
			}

			const searchTerm = this.searchTerm.toLowerCase();

			if (!searchTerm) {
				this.displayRows = this.sheetDataSet.rows;
				return;
			}

			this.displayRows = this.sheetDataSet.rows
				.filter(row => row.fullText.indexOf(searchTerm) > -1);
		},
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
				this.$store.dispatch('pageLoader', false);
			}
		},
		async pasteAction() {
			if (!this.isAuth) {
				return this.$swal.warn(null, 'You need to signin to modify this table.');
			} else if (!this.accessScope.write) {
				return this.$swal.warn(null, 'Sorry you have no permission to edit this table.');
			}

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
			const list = _sortBy(value, v => _get(v, `cells.${this.currentSort}.v`));

			if (this.currentSortOrder === 'desc') {
				return list.reverse();
			}

			return list;
		},
		initResize() {
			const thead = this.$el.querySelector('thead');
			tableResize(thead);

			// flush current cell min width
			this.$nextTick(() => {
				const list = this.$el.querySelectorAll('.md-table-cell');

				list.forEach(cell => {
					cell.style.minWidth = null;
				});
			});
		},
		async fetchData() {
			this.sheet        = null;
			this.sheetDataSet = null;
			this.displayError = null;
			this.displayRows = [];

			this.$store.dispatch('pageLoader', true);

			try {
				const sheet = await this.$http.get(`v1/sheets/${this.sheetId}`);

				const rows = await this.$http.get(`v1/sheets/${this.sheetId}/rows`, {
					params: this.sheetFetchParams
				});

				sheet.rows = rows;

				// redefine header by transformed rows result
				if (rows._payload && rows._payload.header) {
					sheet.header = rows._payload.header;
				}

				this.sheet = sheet;
				this.sheetDataSet = this.parseSheetData(sheet);

				setTimeout(() => this.initResize(), 400);
			} catch (err) {
				console.warn('failed to fetch sheet:', err);
				this.displayError = err.message;
			}

			this.$store.dispatch('pageLoader', false);
		},
		parseSheetData(sheet) {
			let cellCur = 0;

			const sheetRows = _get(sheet, 'rows', []);
			const sheetHeader = _get(sheet, 'header', []).map((headerName, index) => {
				if (!headerName && index === 0) {
					return 'ID';
				} else if (!headerName) {
					return `Cell ${cellCur++}`;
				}

				return headerName;
			});

			const rows = sheetRows.map(row => {
				const allValues = [];
				const cells = sheetHeader.map((header, cellIndex) => {
					const cellData = _get(row, ['cells', cellIndex], {
						v: '',
						t: 'string'
					});

					allValues.push(String(cellData.v).toLowerCase());

					return cellData;
				});

				return { cells, fullText: allValues.join(' ') };
			});

			return { header: sheetHeader, rows };
		},
		getHint(columnName) {
			const col = hints.find(({ column }) => column === columnName);
			if (!col) {
				return null;
			}
			return col.definition;
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
