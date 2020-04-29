import Vue from 'vue';
import VueAxios from 'vue-axios';
import VueMaterial from 'vue-material';

import VueSweetAlert from '@/lib/swal';
import VeeValidate from '@/lib/validator';
import axios from '@/lib/axios';
import '@/lib/data';

import PaginationMore from '@/components/PaginationMore';
import LocalPagination from '@/components/LocalPagination';
import SlideLoader from '@/components/SlideLoader';

import App from './App.vue';
import router from './router';
import store from './store';

Vue.config.productionTip = false;

Vue.use(VueMaterial);
Vue.use(VeeValidate, { locale: 'en', events: 'input' });
Vue.use(VueSweetAlert, { heightAuto: false });
Vue.use(VueAxios, axios);

Vue.component('LocalPagination', LocalPagination);
Vue.component('PaginationMore', PaginationMore);
Vue.component('SlideLoader', SlideLoader);

new Vue({
	router,
	store,
	render: h => h(App)
}).$mount('#app');
