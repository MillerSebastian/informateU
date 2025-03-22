<template>
  <div class="video-container">
    <!-- Fullscreen background video -->
    <video autoplay muted loop id="background-video">
      <source src="/video1.mp4" type="video/mp4">    
    </video>
    
    <div class="registration-form-container">
      <div class="registration-form">
        <h1 class="title has-text-centered">Registrarse</h1>
        <form @submit.prevent="register">
          <!-- Personal information section -->
          <div class="columns is-multiline">
            <div class="column is-half">
              <div class="field">
                <label class="label">Nombre</label>
                <div class="control">
                  <input class="input" type="text" v-model="firstName" required />
                </div>
              </div>
            </div>
            <div class="column is-half">
              <div class="field">
                <label class="label">Apellido</label>
                <div class="control">
                  <input class="input" type="text" v-model="lastName" required />
                </div>
              </div>
            </div>
          </div>

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
          
          <!-- Aligned select fields in equal columns -->
          <div class="columns is-multiline">
            <div class="column is-one-third">
              <div class="field">
                <label class="label">Programa</label>
                <div class="control">
                  <div class="select is-fullwidth">
                    <select v-model="program" :disabled="isDisabled">
                      <option>Ing. Sistemas</option>
                      <option>Ing. Industrial</option>
                      <option>Enfermería</option>
                      <option>Logística Portuaria</option>
                      <option>Odontología</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="column is-one-third">
              <div class="field">
                <label class="label">Ciudad</label>
                <div class="control">
                  <div class="select is-fullwidth">
                    <select v-model="city" :disabled="isDisabled">
                      <option>Barranquilla</option>
                      <option>Cali</option>
                      <option>Bogotá</option>
                      <option>Cartagena de Indias</option>
                      <option>Medellín</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="column is-one-third">
              <div class="field">
                <label class="label">Tipo de Documento</label>
                <div class="control">
                  <div class="select is-fullwidth">
                    <select v-model="documentType" :disabled="isDisabled">
                      <option>Cédula de Ciudadanía</option>
                      <option>Tarjeta de Identidad</option>
                      <option>Extranjera</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="field">
            <label class="label">Fecha de Nacimiento</label>
            <div class="control">
              <input class="input" type="date" v-model="birthDate" required />
            </div>
          </div>
          
          <div class="field mt-4">
            <div class="control">
              <label class="checkbox">
                <input type="checkbox" v-model="termsAccepted" required />
                Acepto los
                <a href="#" style="color: yellow">términos y condiciones</a>
              </label>
            </div>
          </div>
          
          <div class="control has-text-centered mt-4">
            <button
              class="button is-fullwidth"
              style="background-color: yellow; color: black"
            >
              Registrarse
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
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const router = useRouter();

const firstName = ref("");
const lastName = ref("");
const email = ref("");
const password = ref("");
const program = ref("");
const city = ref("");
const documentType = ref("");
const birthDate = ref("");
const termsAccepted = ref(false);
const isDisabled = ref(false);

const register = async () => {
  if (!termsAccepted.value) {
    alert("Debes aceptar los términos y condiciones.");
    return;
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email.value,
      password.value
    );
    const user = userCredential.user;

    await setDoc(doc(db, "users", user.uid), {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      program: program.value,
      city: city.value,
      documentType: documentType.value,
      birthDate: birthDate.value,
    });

    router.push("/");
  } catch (error) {
    console.error("Error al registrarse:", error);
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

/* Container for the registration form */
.registration-form-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1; /* Position above the video */
  padding: 20px;
  overflow-y: auto; /* Allow scrolling if form is tall */
}

/* Styling for the registration form */
.registration-form {
  width: 60%;
  max-width: 800px;
  padding: 2rem;
  background-color: rgba(97, 93, 93, 0.9); /* Semi-transparent background */
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.title {
  margin-bottom: 1.5rem;
  color: #333;
}

.field {
  margin-bottom: 1rem;
}

/* Make selects full width */
.select {
  width: 100%;
}

.select select {
  width: 100%;
}

/* Style for focused inputs */
.input:focus, .select select:focus {
  border-color: gold;
  box-shadow: 0 0 0 0.125em rgba(255, 215, 0, 0.25);
}

/* Button styling */
.button {
  background-color: yellow;
  color: black;
  font-weight: bold;
  transition: all 0.3s ease;
}

.button:hover {
  background-color: gold;
  transform: translateY(-2px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .registration-form {
    width: 90%;
    padding: 1.5rem;
  }
  
  .columns {
    margin-left: 0;
    margin-right: 0;
  }
  
  .column {
    padding: 0.5rem;
  }
}

@media (max-width: 500px) {
  .registration-form {
    width: 95%;
    padding: 1rem;
  }
}
</style>