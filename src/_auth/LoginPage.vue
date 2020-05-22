<template lang="pug">
	.block
		.block-header
			h1.title {{ appTitle }}

		.block-body
			form(@submit.prevent="submit")
				// Email
				.form-group(:class="formValidationClass('email')")
					input(name="email" style="display:none;")
					// preventing chrome autofill

					input.form-control.form-control-lg(
						type = "text",
						name = "email",
						:class = "formValidationClass('email')",
						placeholder = "Email",
						autocomplete = "disablasded",
						v-model = "credits.email",
						v-validate = "'required|email'")
					.invalid-feedback {{ errors.first('email') }}

				// Password
				.from-group(:class="formValidationClass('password')")
					input.form-control.form-control-lg(
						type = "password",
						name = "password",
						:class = "formValidationClass('password')",
						placeholder = "Password",
						autocomplete = "disablasded",
						v-model = "credits.password",
						v-validate = "'required|min:4|max:28'")
					.invalid-feedback {{ errors.first('password') }}

				// Submit button
				.mt-3
					ladda.btn.btn-lg.btn-block.btn-primary(
						:loading = "isSubmit",
						data-style = 'zoom-out',
						type = "submit"
					) Login

		.block-footer
			.text-center.small v.{{ appVersion }}
</template>

<script>
import { mapGetters } from 'vuex';
import fromMixin from '@/mixins/form';

export default {
	name: 'LoginPage',
	mixins: [fromMixin],
	data: () => ({
		isSubmit: false,
		credits: {
			remember: true,
			username: '',
			password: ''
		},
		appTitle: process.env.VUE_APP_TITLE,
		appVersion: process.env.VUE_APP_VERSION
	}),
	computed: {
		...mapGetters(['isPageLoading'])
	},
	methods: {
		async submit() {
			const isValid = await this.formValidate();

			if (!isValid) {
				return;
			}

			this.isSubmit = true;
			this.$store.dispatch('user/loginByEmail', this.credits)
				.then(onComplete.bind(this))
				.catch(onError.bind(this));

			function onComplete() {
				this.$router.push('/');
			}

			function onError(err) {
				this.isSubmit = false;

				if (err.handled) return;
				if (err.statusCode === 401) {
					this.$swal.error('Error', 'Incorrect email or password.');
					return;
				}

				this.$swal.error('Error', err.message);
			}
		}
	},
	mounted() {
		this.$store.dispatch('pageLoader', false);
	}
};
</script>

<style lang="scss">
</style>
