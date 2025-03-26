import { createRouter, createWebHistory } from "vue-router";
import News from "@/views/News.vue";
import Sport from "@/views/Sport.vue";
import Gaming from "@/views/Gaming.vue";
import Moda from "@/views/Moda.vue";
import Login from "@/views/Login.vue";
import Register from "@/views/Register.vue";
import Tararea from "@/views/Tararea.vue";
//@ts-ignore
import Home from "@/views/Home.vue";
import profile from "@/views/profile.vue";
import RecoveryPassword from "@/views/RecoveryPassword.vue";
import Music from "@/views/music.vue";

const routes = [
  { path: "/juegos", component: Gaming },
  { path: "/moda", component: Moda },
  { path: "/noticias", component: News },
  { path: "/deportes", component: Sport },
  { path: "/login", name: "Login", component: Login },
  { path: "/register", component: Register },
  { path: "/music", component: Music },
  { path: "/tararea", component: Tararea },
  { path: "/profile", component: profile },
  { path: "/", component: Home },
  { path: "/recovery-password", component: RecoveryPassword },

  // Ruta comodín al final
  {
    path: "/:pathMatch(.*)*",
    redirect: "/",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Añade esto para depurar la redirección
router.beforeEach((to, from, next) => {
  // Desactivamos temporalmente cualquier redirección al login para diagnóstico
  if (
    to.path === "/Login" &&
    from.path !== "/" &&
    !from.path.includes("Login")
  ) {
    console.warn("⚠️ Redirección a login detectada desde", from.path);
    // No hacer `next("/Login")` aquí, ya que estamos yendo a /Login de todas formas
  }
  next();
});

export default router;
