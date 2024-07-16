<template>
  <div class="container">
    <h1 class="title">Registrarse</h1>
    <form @submit.prevent="register">
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
        <button class="button is-primary">Register</button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { auth } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default defineComponent({
  name: "Register",
  data() {
    return {
      email: "",
      password: "",
    };
  },
  methods: {
    async register() {
      try {
        await createUserWithEmailAndPassword(auth, this.email, this.password);
        this.$router.push("/");
      } catch (error) {
        console.error("Error al registrarse:", error);
      }
    },
  },
});
</script>
