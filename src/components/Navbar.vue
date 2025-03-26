<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link class="navbar-item" to="/">
        <span class="is-size-4 has-text-weight-bold">
          Informate<span style="color: yellow">Ü</span>
        </span>
      </router-link>

      <a
        role="button"
        class="navbar-burger"
        aria-label="menu"
        aria-expanded="false"
        data-target="navbarBasicExample"
        @click="toggleBurger"
      >
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
        <span aria-hidden="true"></span>
      </a>
    </div>

    <div
      id="navbarBasicExample"
      :class="{ 'navbar-menu': true, 'is-active': isActive }"
    >
      <div class="navbar-start" v-if="user">
        <router-link class="navbar-item juegos" to="/juegos"
          >Juegos</router-link
        >
        <router-link class="navbar-item moda" to="/moda">Moda</router-link>
        <router-link class="navbar-item noticias" to="/noticias"
          >Noticias</router-link
        >
        <router-link class="navbar-item deportes" to="/deportes"
          >Deportes</router-link
        >
        <router-link class="navbar-item perfil" to="/profile"
          >Perfil</router-link
        >

        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">Más</a>
          <div class="navbar-dropdown">
            <router-link class="navbar-item" to="/music">Rolitas</router-link>
            <router-link class="navbar-item" to="/tararea">Tararea</router-link>
          </div>
        </div>
        <div class="navbar-item">
          <button class="button" @click="showNotifications = true">🔔</button>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item" v-if="!user">
          <div class="buttons">
            <router-link class="button" to="/register">
              <strong>Registrate</strong>
            </router-link>
            <router-link
              style="background-color: yellow; color: black"
              class="button"
              to="/login"
              >Inicia session</router-link
            >
          </div>
        </div>
        <div class="navbar-item" v-if="user">
          <div class="buttons">
            <button @click="logout" class="button">Cerrar session</button>
          </div>
        </div>
      </div>
    </div>
  </nav>

  <div class="modal" :class="{ 'is-active': showNotifications }">
    <div class="modal-background" @click="showNotifications = false"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Notificaciones</p>
        <button class="delete" @click="showNotifications = false"></button>
      </header>
      <section class="modal-card-body">
        <p>Aquí aparecerán tus notificaciones...</p>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-danger" @click="showNotifications = false">
          Cerrar
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { auth } from "../firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { useRouter } from "vue-router";

const router = useRouter();
const isActive = ref(false);
const user = ref(null);
const showNotifications = ref(false);

onMounted(() => {
  onAuthStateChanged(auth, (currentUser) => {
    //@ts-ignore
    user.value = currentUser;
  });
});

const toggleBurger = () => {
  isActive.value = !isActive.value;
};

const logout = async () => {
  try {
    await signOut(auth);
    user.value = null;
    router.push("/");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};
</script>

<style scoped>
ß .navbar-item {
  transition: color 0.3s ease;
}

.juegos:hover {
  color: yellow;
}

.moda:hover {
  color: purple;
}

.noticias:hover {
  color: red;
}

.deportes:hover {
  color: green;
}

.perfil:hover {
  color: blue;
}
.modal-card {
  max-width: 400px;
}
</style>
