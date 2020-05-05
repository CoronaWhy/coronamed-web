<template lang="pug">
	.tables-page
		// Display nested view
		router-view

		// Display table case
		template(v-if="showList")
			md-table(
				v-model="displayList",
				:md-sort.sync="currentSort",
				:md-sort-order.sync="currentSortOrder",
				md-card
			)
				// Card header
				md-table-toolbar.md-card-toolbar
					.md-toolbar-section-start
						.md-title Questions ({{displayList.length}} questions)

					md-field.md-toolbar-section-end(md-clearable)
						md-input(placeholder="Search by title..." v-model="searchTerm", @input="computeDisplayList")

				// Card content
				md-table-row.md-has-selection(
					slot="md-table-row",
					slot-scope="{ item }",
					@click="onSelect(item)"
				)
					md-table-cell(md-label="File Name",  md-sort-by="filePath")
						template(v-if="item.folderName")
							span {{ frendlyString(item.folderName) }}
							span &nbsp;
							b {{ frendlyString(item.fileName) }}
						template(v-else)
							span {{ item.displayName }}

				// Card footer
				template(v-slot:md-table-pagination)
					md-card-content
						.line Files: {{ displayList.length }}
</template>

<script>
import path from 'path';
import { mapGetters } from 'vuex';
import { frendlyString } from './utils';

export default {
	name: 'TablesPage',
	components: {
	},
	mixins: [],
	data: () => ({
		currentSort: 'filePath',
		currentSortOrder: 'asc',
		displayList: [],
		searchTerm: ''
	}),
	computed: {
		...mapGetters(['isPageLoading', 'appDataList']),
		showList() {
			return this.$route.name === 'tables';
		}
	},
	watch: {
		'appDataList': {
			handler: 'computeDisplayList',
			immediate: true
		},
		showList(newValue) {
			if (newValue) {
				this.$store.dispatch('pageLoader', false);
			}
		}
	},
	mounted() {
		this.$store.dispatch('pageLoader', false);
		this.$root.$emit('sidebar:hide', 'left');
		this.$root.$emit('sidebar:hide', 'right');
	},
	methods: {
		frendlyString,
		onSelect(item) {
			this.$router.push({
				name: 'tables.view',
				params: { id: item.filePath }
			});
		},
		computeDisplayList() {
			this.displayList = this.appDataList
				.map(v => v.substring(12))
				.map(v => ({
					filePath: v,
					fileName: path.basename(v),
					folderName: path.dirname(v),
					displayName: frendlyString(v)
				}))
				.filter(v => v.displayName.toLowerCase().indexOf(this.searchTerm) > -1);
		}
	}
};
</script>
