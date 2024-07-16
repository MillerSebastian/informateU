<template>
  <nav class="navbar" role="navigation" aria-label="main navigation">
    <div class="navbar-brand">
      <router-link class="navbar-item" to="/">
        <span class="is-size-4 has-text-weight-bold">InformateU</span>
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
      <div class="navbar-start">
        <router-link class="navbar-item" to="/juegos">Juegos</router-link>
        <router-link class="navbar-item" to="/moda">Moda</router-link>
        <router-link class="navbar-item" to="/noticias">Noticias</router-link>
        <router-link class="navbar-item" to="/deportes">Deportes</router-link>

        <div class="navbar-item has-dropdown is-hoverable">
          <a class="navbar-link">Más</a>

          <div class="navbar-dropdown">
            <router-link class="navbar-item" to="/productos"
              >Productos</router-link
            >
            <router-link class="navbar-item" to="/tareas">Tareas</router-link>
          </div>
        </div>
      </div>

      <div class="navbar-end">
        <div class="navbar-item">
          <div class="buttons">
            <router-link class="button is-primary" to="/register">
              <strong>Sign up</strong>
            </router-link>
            <router-link class="button is-light" to="/login"
              >Log in</router-link
            >
          </div>
        </div>
      </div>
    </div>
  </nav>
</template>

<script lang="ts">
import { defineComponent, ref } from "vue";

export default defineComponent({
  name: "Navbar",
  setup() {
    const isActive = ref(false);

    function toggleBurger() {
      isActive.value = !isActive.value;
    }

    return {
      isActive,
      toggleBurger,
    };
  },
});
</script>

<style scoped>
/* Añade tus estilos específicos para el componente Navbar aquí */
</style>
