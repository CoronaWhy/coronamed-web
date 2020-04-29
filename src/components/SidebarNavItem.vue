<template lang="pug">
	li.app-sidebar__nav_item
		router-link(:to="item.to", tag="a", exact, v-if="item.to") {{ item.title }}
		a(v-else, @click="toggleDropdown(item)") {{ item.title }}

		transition(name="slide-right")
			div(v-if="isOpen")
				SidebarNavItem.ml-4(
					v-for="el in item.children",
					:item="item",
					:key="item.title + el.title"
				)
</template>

<script>
export default {
	name: 'SidebarNavItem',
	props: ['item'],
	data: () => ({
		isOpen: false
	}),
	computed: {
		isFolder() {
			return this.item.children && this.item.children.length;
		}
	},
	methods: {
		toggleDropdown() {
			this.isOpen = !this.isOpen;
		}
	}
};
</script>
