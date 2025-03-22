import { createRouter, createWebHistory } from "vue-router";
import News from "@/views/News.vue";
import Sport from "@/views/Sport.vue";
import Gaming from "@/views/Gaming.vue";
import Moda from "@/views/Moda.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import Productos from "@/views/Productos.vue";
import Tararea from "@/views/Tararea.vue";
//@ts-ignore
import Home from "@/views/Home.vue";
import profile from "@/views/profile.vue";
import RecoveryPassword from "@/views/RecoveryPassword.vue";

const routes = [
  { path: "/juegos", component: Gaming },
  { path: "/moda", component: Moda },
  { path: "/noticias", component: News },
  { path: "/deportes", component: Sport },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", component: Register },
  { path: "/productos", component: Productos },
  { path: "/tararea", component: Tararea },
  { path: "/profile", component: profile },
  { path: "/", component: Home },
  {
    path: '/recovery-password',
    name: 'RecoveryPassword',
    component: RecoveryPassword
  },
  // Ruta comodín al final
  { 
    path: '/:pathMatch(.*)*', 
    redirect: '/' 
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Añade esto para depurar la redirección
router.beforeEach((to, from, next) => {
  console.log('Navegando de', from.path, 'a', to.path);
  
  // Desactivamos temporalmente cualquier redirección al login
  // para diagnóstico
  if (to.path === '/login' && from.path !== '/' && !from.path.includes('login')) {
    console.warn('⚠️ Detectada redirección a login desde', from.path);
    console.trace('Traza de la redirección');
    // Comentamos esta línea para evitar la redirección a login
    // next('/login');
    next(false); // Mantiene al usuario en la página actual
  } else {
    next();
  }
});

export default router;