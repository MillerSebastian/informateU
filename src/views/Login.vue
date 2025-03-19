<template>
  <div
    class="container is-flex is-justify-content-center is-align-items-center"
    style="height: 100vh"
  >
    <div style="width: 50%">
      <img src="/logo2.png" alt="Logo" class="logo-image" />
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

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

const email = ref("");
const password = ref("");
const router = useRouter();

const login = async () => {
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    router.push("/");
  } catch (error) {}
};
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
  max-width: 80%;
  height: auto;
}
</style>
