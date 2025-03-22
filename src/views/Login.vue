<template>
  <div class="video-container">
    <!-- The video element should be positioned outside the container to allow fullscreen -->
    <video autoplay muted loop id="background-video">
      <source src="/video2.mp4" type="video/mp4">    
    </video>
    
    <div class="login-form-container">
      <div class="login-form">
        <h1 class="title has-text-centered">Iniciar Sesión</h1>
        <form @submit.prevent="login">
          <div class="field">
            <label class="label">Email</label>
            <div class="control">
              <input
                class="input"
                type="email"
                v-model="email"
                required
                :disabled="isLoading"
                placeholder="Ingresa tu email"
              />
            </div>
          </div>
          <div class="field">
            <label class="label" >Contraseña</label>
            <div class="control">
              <input
                class="input"
                type="password"
                v-model="password"
                required
                :disabled="isLoading"
                placeholder="ingresa tu contraseña"
              />
            </div>
          </div>
          <div class="control has-text-centered">
            <button
              class="button is-fullwidth"
              :disabled="isLoading"
              style="background-color: yellow; color: black"
            >
              <span v-if="isLoading" class="loader-container">
                <span class="spinner"></span>
                <span class="ml-2">Iniciando sesión...</span>
              </span>
              <span v-else>Iniciar Sesión</span>
            </button>
          </div>
        </form>
        <div class="mt-4 has-text-centered">
          <p class="help">¿Olvidaste tu contraseña? Contacta al administrador</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { auth } from "../firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

const email = ref("");
const password = ref("");
const router = useRouter();
const isLoading = ref(false);
let notyf: Notyf;

onMounted(() => {
  notyf = new Notyf({
    duration: 3000,
    position: { x: "right", y: "bottom" },
    types: [
      {
        type: "success",
        background: "green",
        icon: {
          className: "fas fa-check-circle",
          tagName: "i",
          color: "white",
        },
      },
      {
        type: "error",
        background: "red",
        icon: {
          className: "fas fa-times-circle",
          tagName: "i",
          color: "white",
        },
      },
    ],
  });
});

const login = async () => {
  if (!email.value.trim()) {
    notyf.error("Por favor, ingresa tu email");
    return;
  }

  if (!password.value) {
    notyf.error("Por favor, ingresa tu contraseña");
    return;
  }

  isLoading.value = true;

  try {
    await signInWithEmailAndPassword(auth, email.value, password.value);
    notyf.success("Inicio de sesión exitoso");

    setTimeout(() => {
      router.push("/");
    }, 500);
  } catch (error: any) {
    let errorMessage = "Error al iniciar sesión";

    if (error.code === "auth/invalid-email") {
      errorMessage = "El formato del email no es válido";
    } else if (error.code === "auth/user-not-found") {
      errorMessage = "No existe una cuenta con este email";
    } else if (error.code === "auth/wrong-password") {
      errorMessage = "Contraseña incorrecta";
    } else if (error.code === "auth/too-many-requests") {
      errorMessage = "Demasiados intentos fallidos. Inténtalo más tarde";
    }

    notyf.error(errorMessage);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* Ensure the page has no margins or padding */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
}

/* Video container takes up the full viewport */
.video-container {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
}

/* Fullscreen video styling */
#background-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* This ensures the video covers the entire container */
  z-index: 0; /* Keep the video in the background */
}

/* Container for the login form */
.login-form-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1; /* Position above the video */
}

/* Styling for the login form */
.login-form {
  width: 50%;
  max-width: 500px;
  padding: 2rem;
  background-color: #2c3e50; /* Semi-transparent background */
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.logo-image {
  display: block;
  margin: 0 auto 20px;
  max-width: 80%;
  height: auto;
}

button:disabled,
input:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.loader-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-left-color: #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.input:focus {
  border-color: gold;
  box-shadow: 0 0 0 0.125em rgba(255, 215, 0, 0.25);
}

/* Add media queries for responsive design */
@media (max-width: 768px) {
  .login-form {
    width: 80%;
  }
}
</style>