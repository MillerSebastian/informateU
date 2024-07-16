<template>
  <div class="container">
    <h1 class="title">Iniciar Sesión</h1>
    <form @submit.prevent="login">
      <div class="field">
        <label class="label">Email</label>
        <div class="control">
          <input class="input" type="email" v-model="email" required />
        </div>
      </div>
      <div class="field">
        <label class="label">Contraseña</label>
        <div class="control">
          <input class="input" type="password" v-model="password" required />
        </div>
      </div>
      <div class="control">
        <button class="button is-primary">Iniciar Sesión</button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export default defineComponent({
  name: "Login",
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    async login() {
      try {
        await signInWithEmailAndPassword(auth, this.email, this.password);
        this.$router.push("/");
      } catch (error) {
        console.error("Error al iniciar sesión:", error);
      }
    },
  },
});
</script>

<style scoped>
/* Añade tus estilos personalizados aquí */
</style>
