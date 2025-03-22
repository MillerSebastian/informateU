<template>
    <div class="video-container">
      <!-- Fullscreen background video -->
      <video autoplay muted loop id="background-video">
        <source src="/video1.mp4" type="video/mp4">    
      </video>
      
      <div class="recovery-form-container">
        <div class="recovery-form">
          <h1 class="form-title">Recuperar Contraseña</h1>
          <p class="form-description">
            Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
          </p>
          
          <form @submit.prevent="recoverPassword">
            <div class="form-group">
              <label class="form-label">Correo Electrónico</label>
              <input 
                class="form-input" 
                type="email" 
                v-model="email" 
                placeholder="ejemplo@correo.com"
                required 
              />
            </div>
            
            <div v-if="message" :class="['message', messageType]">
              {{ message }}
            </div>
            
            <div class="form-group buttons-container">
              <button class="back-button" type="button" @click="goBack">
                Volver
              </button>
              <button 
                class="submit-button" 
                type="submit"
                :disabled="isLoading"
              >
                <span v-if="isLoading">Enviando...</span>
                <span v-else>Enviar Enlace</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref } from "vue";
  import { useRouter } from "vue-router";
  import { auth } from "../firebase";
  import { sendPasswordResetEmail } from "firebase/auth";
  
  const router = useRouter();
  const email = ref("");
  const isLoading = ref(false);
  const message = ref("");
  const messageType = ref("");
  
  const recoverPassword = async () => {
    if (!email.value) {
      message.value = "Por favor, ingresa tu correo electrónico";
      messageType.value = "error";
      return;
    }
    
    isLoading.value = true;
    message.value = "";
    
    try {
      // Intenta enviar el correo de restablecimiento
      await sendPasswordResetEmail(auth, email.value);
      
      // Si no hay error, el correo se envió correctamente
      message.value = "Se ha enviado un enlace de recuperación a tu correo electrónico";
      messageType.value = "success";
      
      // Opcional: limpiar el campo de correo después del éxito
      email.value = "";
    } catch (error: any) {
      console.error("Error al enviar correo de recuperación:", error);
      
      // Manejar diferentes tipos de errores
      if (error.code === "auth/user-not-found") {
        message.value = "No existe ningún usuario con ese correo electrónico";
      } else if (error.code === "auth/invalid-email") {
        message.value = "El formato del correo electrónico no es válido";
      } else {
        message.value = "Ha ocurrido un error. Por favor, intenta más tarde";
      }
      
      messageType.value = "error";
    } finally {
      isLoading.value = false;
    }
  };
  
  const goBack = () => {
    router.push("/login"); // Ajusta esta ruta según tu estructura de navegación
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
    object-fit: cover;
    z-index: 0;
    filter: blur(5px);
  }
  
  /* Container for the recovery form */
  .recovery-form-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
    padding: 10px;
  }
  
  /* Styling for the recovery form */
  .recovery-form {
    width: 400px;
    max-width: 90%;
    padding: 1.75rem;
    background-color: rgba(30, 33, 43, 0.85);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(8px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  .form-title {
    margin: 0 0 0.75rem 0;
    color: #ffffff;
    font-size: 1.5rem;
    text-align: center;
    font-weight: 600;
    letter-spacing: 0.5px;
  }
  
  .form-description {
    margin-bottom: 1.5rem;
    color: #e0e0e0;
    text-align: center;
    font-size: 0.9rem;
    line-height: 1.4;
  }
  
  .form-group {
    margin-bottom: 1.25rem;
    width: 100%;
  }
  
  .form-label {
    display: block;
    margin-bottom: 6px;
    font-size: 0.8rem;
    color: #e0e0e0;
    font-weight: 500;
  }
  
  .form-input {
    width: 100%;
    padding: 10px 12px;
    font-size: 0.95rem;
    background-color: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    color: #ffffff;
    transition: all 0.3s;
  }
  
  .form-input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
  
  .form-input:focus {
    outline: none;
    border-color: rgba(255, 223, 0, 0.7);
    box-shadow: 0 0 0 2px rgba(255, 223, 0, 0.2);
    background-color: rgba(255, 255, 255, 0.15);
  }
  
  .buttons-container {
    display: flex;
    gap: 12px;
  }
  
  .back-button {
    flex: 1;
    padding: 10px;
    background-color: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 6px;
    font-size: 0.9rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .back-button:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }
  
  .submit-button {
    flex: 2;
    padding: 10px;
    background-color: rgb(255, 223, 0);
    color: #000;
    border: none;
    border-radius: 6px;
    font-size: 0.95rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .submit-button:hover:not(:disabled) {
    background-color: rgb(255, 230, 50);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(255, 223, 0, 0.25);
  }
  
  .submit-button:active:not(:disabled) {
    transform: translateY(0);
  }
  
  .submit-button:disabled {
    background-color: rgba(255, 223, 0, 0.5);
    cursor: not-allowed;
  }
  
  .message {
    padding: 10px;
    margin-bottom: 1.25rem;
    border-radius: 6px;
    font-size: 0.9rem;
    text-align: center;
  }
  
  .success {
    background-color: rgba(46, 125, 50, 0.25);
    color: #81c784;
    border: 1px solid rgba(46, 125, 50, 0.5);
  }
  
  .error {
    background-color: rgba(183, 28, 28, 0.25);
    color: #e57373;
    border: 1px solid rgba(183, 28, 28, 0.5);
  }
  
  @media (max-width: 480px) {
    .recovery-form {
      padding: 1.25rem;
    }
    
    .form-title {
      font-size: 1.3rem;
    }
    
    .form-description {
      font-size: 0.85rem;
      margin-bottom: 1.25rem;
    }
    
    .form-input {
      padding: 8px 10px;
    }
    
    .buttons-container {
      flex-direction: column;
      gap: 8px;
    }
    
    .back-button, .submit-button {
      width: 100%;
    }
  }
  </style>