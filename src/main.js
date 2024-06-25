import { createApp } from 'vue'
import App from './App.vue'
import './styles/index.css'

// createApp(App).mount('#app')

import { createRouter, createWebHistory } from 'vue-router';
import BrailleConverter from './components/BrailleConverter.vue';

const routes = [
  { path: '/:textInput?', component: BrailleConverter }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const app = createApp(App);
app.use(router);
app.mount('#app');