<template>
  <div class="video-container">
    <!-- Fullscreen background video -->
    <video autoplay muted loop id="background-video">
      <source src="/info.mp4" type="video/mp4" />
    </video>

    <div class="registration-form-container">
      <div class="registration-form">
        <h1 class="form-title">Registrarse</h1>
        <form @submit.prevent="register">
          <!-- Two columns layout for personal info -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Nombre</label>
              <input
                class="form-input"
                type="text"
                v-model="firstName"
                required
              />
            </div>
            <div class="form-group">
              <label class="form-label">Apellido</label>
              <input
                class="form-input"
                type="text"
                v-model="lastName"
                required
              />
            </div>
          </div>

          <!-- More compact layout for credential fields -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Email</label>
              <input class="form-input" type="email" v-model="email" required />
            </div>
            <div class="form-group">
              <label class="form-label">Contraseña</label>
              <input
                class="form-input"
                type="password"
                v-model="password"
                required
              />
            </div>
          </div>

          <!-- Three columns for select fields -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Programa</label>
              <div class="custom-select">
                <select v-model="program" :disabled="isDisabled">
                  <option>Ing. Sistemas</option>
                  <option>Ing. Industrial</option>
                  <option>Enfermería</option>
                  <option>Logística Portuaria</option>
                  <option>Odontología</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Ciudad</label>
              <div class="custom-select">
                <select v-model="city" :disabled="isDisabled">
                  <option>Barranquilla</option>
                  <option>Cali</option>
                  <option>Bogotá</option>
                  <option>Cartagena de Indias</option>
                  <option>Medellín</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Tipo de Documento</label>
              <div class="custom-select">
                <select v-model="documentType" :disabled="isDisabled">
                  <option>Cédula de Ciudadanía</option>
                  <option>Tarjeta de Identidad</option>
                  <option>Extranjera</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Date field in its own row -->
          <div class="form-group">
            <label class="form-label">Fecha de Nacimiento</label>
            <input
              class="form-input date-input"
              type="date"
              v-model="birthDate"
              required
            />
          </div>

          <!-- Terms and conditions in its own row -->
          <div class="form-group terms-container">
            <label class="checkbox-label">
              <input type="checkbox" v-model="termsAccepted" required />
              <span class="checkmark"></span>
              <span class="terms-text"
                >Acepto los
                <a href="#" class="terms-link">términos y condiciones</a>
              </span>
            </label>
          </div>

          <div class="form-group">
            <button class="submit-button" type="submit">Registrarse</button>
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
html,
body {
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
  z-index: 1;
  padding: 10px;
}

/* Styling for the registration form */
.registration-form {
  width: 450px;
  max-width: 90%;
  padding: 1.5rem;
  background-color: rgba(30, 33, 43, 0.85);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.form-title {
  margin: 0 0 1rem 0;
  color: #ffffff;
  font-size: 1.5rem;
  text-align: center;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.form-row {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.form-group {
  margin-bottom: 10px;
  width: 100%;
}

.form-label {
  display: block;
  margin-bottom: 4px;
  font-size: 0.8rem;
  color: #e0e0e0;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 8px 10px;
  font-size: 0.9rem;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #ffffff;
  transition: all 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: rgba(255, 223, 0, 0.7);
  box-shadow: 0 0 0 2px rgba(255, 223, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.15);
}

.date-input {
  color-scheme: dark;
}

.custom-select {
  position: relative;
  width: 100%;
}

.custom-select select {
  appearance: none;
  width: 100%;
  padding: 8px 10px;
  font-size: 0.9rem;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  color: #ffffff;
  cursor: pointer;
  transition: all 0.3s;
}

.custom-select select:focus {
  outline: none;
  border-color: rgba(255, 223, 0, 0.7);
  box-shadow: 0 0 0 2px rgba(255, 223, 0, 0.2);
  background-color: rgba(255, 255, 255, 0.15);
}

.custom-select::after {
  content: "▼";
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
  pointer-events: none;
  font-size: 0.7rem;
}

.terms-container {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: 5px;
  margin-bottom: 15px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  position: relative;
  padding-left: 24px;
  cursor: pointer;
  font-size: 0.8rem;
  color: #e0e0e0;
}

.checkbox-label input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  left: 0;
  height: 16px;
  width: 16px;
  background-color: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.checkbox-label input:checked ~ .checkmark {
  background-color: rgba(255, 223, 0, 0.9);
  border-color: rgba(255, 223, 0, 0.9);
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-label input:checked ~ .checkmark:after {
  display: block;
  left: 5px;
  top: 2px;
  width: 3px;
  height: 8px;
  border: solid #000;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.terms-text {
  font-size: 0.8rem;
}

.terms-link {
  color: rgb(255, 223, 0);
  text-decoration: none;
  border-bottom: 1px solid rgba(255, 223, 0, 0.3);
  transition: all 0.3s;
}

.terms-link:hover {
  border-bottom: 1px solid rgba(255, 223, 0, 0.8);
}

.submit-button {
  width: 100%;
  padding: 10px;
  background-color: rgb(255, 223, 0);
  color: #000;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 5px;
}

.submit-button:hover {
  background-color: rgb(255, 230, 50);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(255, 223, 0, 0.25);
}

.submit-button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .form-row {
    flex-direction: column;
    gap: 5px;
    margin-bottom: 5px;
  }

  .registration-form {
    padding: 1.25rem;
  }

  .form-group {
    margin-bottom: 8px;
  }

  .submit-button {
    margin-top: 3px;
  }
}

@media (max-width: 480px) {
  .registration-form {
    padding: 1rem;
  }

  .form-title {
    font-size: 1.3rem;
    margin-bottom: 0.75rem;
  }

  .form-input,
  .custom-select select {
    padding: 7px 10px;
  }
}
</style>
