<template lang="pug">
	form.form-st.user__form
		.section.mt-2
			h5.ml-4 Credentials

		// Email
		.section.md
			.label.md
				span Email
			.input
				input.form-control(
					placeholder="Type email address",
					name="email",
					autocomplete="disablasded",
					v-model="model.email",
					v-validate="'required|email'")
			.feedback.danger(v-if="errors.has('email')")
				span {{ errors.first('email') }}

		// Password
		.section.md
			.label.md
				span Password
			.input
				input.form-control(
					placeholder="Type password to renew",
					name="password",
					autocomplete="disablasded",
					v-model="model.password")
			.col-auto.mt-md-0.mt-3
				button.btn.btn-info(@click="refreshPassword", type="button")
					i.fa.fa-refresh
			.feedback.danger(v-if="errors.has('password')")
				span {{ errors.first('password') }}

		.section.mt-2
			h5.ml-4 Info

		// Name
		.section.md
			.label.md
				span Name
			.input
				input.form-control(
					placeholder="Type account name",
					name="name",
					autocomplete="disablasded",
					v-model="model.name",
					v-validate="'required|min:3'")
			.feedback.danger(v-if="errors.has('name')")
				span {{ errors.first('name') }}

		.section.mt-2
			h5.ml-4 Account Roles

		// Account Type
		.section.md(v-for="role in rolesOptions")
			.label
				span(:class="{ 'text-primary': modelRolesMap[role.value] }") Role {{ role.text }}
			.input
				InputSimpleCheckbox(
					:value="modelRolesMap[role.value]",
					labelTrue="Yes",
					labelFalse="No",
					@click="toggleRole(role.value)"
				)

		.section.mt-2
			h5.ml-4 Account Attributes

		// Disabled flag
		.section.md
			.label.md.has-desc
				span(:class="{ 'text-primary': model.disabled }") Disabled
				.small While Yes user cannot be able to login into dashboard and all active sessions will be stopped.
			.input
				input-simple-checkbox(v-model="model.disabled", labelTrue="Yes", labelFalse="No")
</template>

<script>
import _pick from 'lodash/pick';
import _defaultsDeep from 'lodash/defaultsDeep';

import { BASE_MODEL, ROLE_OPTIONS } from './constants';

import InputSimpleCheckbox from '@/components/InputSimpleCheckbox.vue';

export default {
	name: 'UserForm',
	components: { InputSimpleCheckbox },
	props: {
		value: {
			type: Object,
			default: () => ({})
		}
	},
	data: () => ({
		model: null,
		rolesOptions: ROLE_OPTIONS
	}),
	computed: {
		modelRolesMap() {
			const result = {};

			this.model.roles
				.forEach(roleName => result[roleName] = true);

			return result;
		}
	},
	watch: {
		value: {
			immediate: true,
			handler: 'parseInput'
		}
	},
	methods: {
		hasRole(roleName) {
			return (this.model.roles || []).indexOf(roleName) > -1;
		},
		toggleRole(roleName) {
			const idx = this.model.roles.indexOf(roleName);

			if (idx > -1) {
				this.model.roles.splice(idx, 1);
			} else {
				this.model.roles.push(roleName);
			}
		},
		parseInput() {
			this.model = _defaultsDeep({}, this.value, BASE_MODEL);

			if (!this.model.managerOf) {
				this.model.managerOf = [];
			}
		},
		refreshPassword() {
			this.model.password = Math.random().toString(36).slice(-8);
		},
		validate() {
			return this.$validator.validateAll()
				.then((valid) => valid ? this.model : false)
				.catch(console.warn)
				.then(model => {
					if (!model) return;

					const obj = _pick(
						_defaultsDeep({}, model),
						Object.keys(BASE_MODEL)
					);

					obj.managerOf = (obj.managerOf || [])
						.map(v => v._id)
						.filter(v => !!v);

					if (!obj.password || !obj.password.length) {
						delete obj.password;
					}

					return obj;
				});
		}
	}
};
</script>

<style scoped>
</style>
