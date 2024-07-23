<template>
  <div
    class="container is-flex is-justify-content-center is-align-items-center"
    style="height: 100vh"
  >
    <div style="width: 50%">
      <img src="/Logo americana 2.png" alt="Logo" class="logo-image" />
      <h1 class="title has-text-centered">Iniciar Sesión</h1>
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
        <div class="control has-text-centered">
          <button
            class="button is-fullwidth"
            style="background-color: yellow; color: black"
          >
            Iniciar Sesión
          </button>
        </div>
      </form>
    </div>
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
        // Consider adding user-friendly error handling here
      }
    },
  },
});
</script>

<style scoped>
.container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.box {
  width: 50%;
}

.logo-image {
  display: block;
  margin: 0 auto 20px;
  max-width: 70%;
  height: auto;
}
</style>
