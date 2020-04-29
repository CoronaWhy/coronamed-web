<template>
	<div class="text-right" style="min-height: 35px">
		<div class="pull-left text-left">
			Page: {{ curPage }} / {{ maxPages }}<br>
			Total: {{ list.length }}
		</div>
		<div class="btn-group btn-group-responsive">
			<button class="btn btn-default" v-show="hasPrev()" @click="prev()">
				Prev
			</button>
			<button class="btn" v-for="pageNum in displayNavs" :key="pageNum" @click="go(pageNum)" :class="{'btn-default': pageNum !== curPage, 'btn-primary': pageNum === curPage}">
				{{ pageNum }}
			</button>
			<button class="btn btn-default" v-show="hasNext()" @click="next()">
				Next
			</button>
		</div>
	</div>
</template>

<script>
export default {
	name: 'LocalPagination',
	props: {
		prePage: {
			type: Number,
			default: 10
		},
		navElements: {
			type: Number,
			default: 4
		},
		sourceList: {
			type: Array,
			required: true
		}
	},
	data: () => ({
		maxPages: 1,
		curPage: 1,
		list: []
	}),
	watch: {
		sourceList(newList) {
			this.list = newList;
		},
		filtredList(list) {
			this.maxPages = Math.ceil(this.list.length / this.prePage);
			this.$emit('input', list);
		}
	},
	computed: {
		/**
		 * Return navs array list
		 * @return {Array}
		 */
		displayNavs() {
			const result = [];

			let start = this.curPage - this.navElements;
			let end = this.curPage + this.navElements;

			if (start < 1) {
				end += (start * -1) + 1;
				start = 1;
			}

			if (end > this.maxPages) end = this.maxPages;

			for (let i = start; i <= end; i++) {
				result.push(i);
			}

			return result;
		},

		/**
		 * Return items list to display
		 * @return {Array}
		 */
		filtredList() {
			if (!this.list) return [];

			this.go(this.curPage); // Normalize current page

			const end = this.curPage * this.prePage;
			const start = end - this.prePage;

			return this.list.slice(start, end);
		}
	},
	methods: {
		/**
		 * Return true if prev page available
		 * @return {Boolean}
		 */
		hasPrev() {
			return this.curPage > 1;
		},

		/**
		 * Return true if next page available
		 * @return {Boolean}
		 */
		hasNext() {
			return this.curPage < this.maxPages;
		},

		/**
		 * Swith to next page
		 */
		next() {
			this.hasNext() && this.curPage++;
		},

		/**
		 * Swith to prev page
		 */
		prev() {
			this.hasPrev() && this.curPage--;
		},

		/**
		 * Go to spec. page
		 * @param  {Number} pageNum
		 */
		go(pageNum) {
			this.curPage = Math.max(Math.min(pageNum, this.maxPages), 1);
		}
	},
	mounted() {
		this.list = this.sourceList || [];
	}
};
</script>
