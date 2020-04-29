<template lang="pug">
	// Navigation
	ul.nav.app-sidebar__nav
		li(v-for="item in navItems", :key="item.title")
			router-link(:to="item.to", tag="a", exact, v-if="item.to") {{ item.title }}
			a(v-else, @click="toggleDropdown(item)") {{ item.title }}

			transition(name="slide-right")
				div(v-if="item.children && activeSubmenu === item.title")
					li(v-for="el in item.children", :key="item.title + el.title", class="ml-4")
						router-link(:to="el.to", tag="a", exact, v-if="el.to") {{ el.title }}
						span(v-else) {{ el.title }}
</template>

<script>
import navItems from '@/nav';

export default {
	name: 'SidebarNav',
	data: () => ({
		navItems
	}),
	methods: {
	}
};
</script>
