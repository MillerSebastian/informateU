import { createRouter, createWebHistory } from "vue-router";
import News from "@/views/News.vue";
import Sport from "@/views/Sport.vue";
import Gaming from "@/views/Gaming.vue";
import Moda from "@/views/Moda.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import Productos from "@/views/Productos.vue";
import Tareas from "@/views/Tararea.vue";

const routes = [
  { path: "/juegos", component: Gaming },
  { path: "/moda", component: Moda },
  { path: "/noticias", component: News },
  { path: "/deportes", component: Sport },
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/productos", component: Productos },
  { path: "/tareas", component: Tareas },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
