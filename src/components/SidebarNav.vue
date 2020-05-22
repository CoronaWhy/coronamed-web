<template lang="pug">
	// Navigation
	ul.nav.app-sidebar__nav
		li(v-for="item in displayNavItems", :key="item.title")
			router-link(:to="item.to", tag="a", exact, v-if="item.to") {{ item.title }}
			a(v-else, @click="toggleDropdown(item)") {{ item.title }}

			transition(name="slide-right")
				div(v-if="item.children && activeSubmenu === item.title")
					li(v-for="el in item.children", :key="item.title + el.title", class="ml-4")
						router-link(:to="el.to", tag="a", exact, v-if="el.to") {{ el.title }}
						span(v-else) {{ el.title }}

		li(@click="logout", v-if="isAuth")
			a.link
				.line Log out
				<small>{{ account.email }}</small>
</template>

<script>
import _includes from 'lodash/includes';
import { mapGetters } from 'vuex';
import navItems from '@/nav';

export default {
	name: 'SidebarNav',
	data: () => ({}),
	computed: {
		...mapGetters({
			accountRoles: 'user/roles',
			account: 'user/account',
			isAuth: 'user/isAuth'
		}),
		displayNavItems() {
			return navItems.filter((v) => {
				if (
					v.roles &&
					!v.roles.find((role) => _includes(this.accountRoles, role))
				) {
					return false;
				}

				return true;
			});
		},
	},
	methods: {
		logout() {
			this.$store.dispatch('user/logout');
		}
	},
};
</script>
