<template>
  <div
    class="container is-flex is-justify-content-center is-align-items-center"
    style="height: 100vh"
  >
    <div style="width: 53%">
      <h1 class="title has-text-centered">Registrarse</h1>
      <form @submit.prevent="register">
        <div class="field">
          <label class="label">Nombre</label>
          <div class="control">
            <input class="input" type="text" v-model="firstName" required />
          </div>
        </div>
        <div class="field">
          <label class="label">Apellido</label>
          <div class="control">
            <input class="input" type="text" v-model="lastName" required />
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
        <div class="columns is-multiline">
          <div class="column is-one-quarter">
            <div class="field">
              <label class="label">Programa</label>
              <div class="control">
                <div class="select">
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
          <div class="column is-one-quarter">
            <div class="field">
              <label class="label">Ciudad</label>
              <div class="control">
                <div class="select">
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
          <div class="column is-one-quarter">
            <div class="field">
              <label class="label">Tipo de Documento</label>
              <div class="control">
                <div class="select">
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
        <div class="field">
          <div class="control">
            <label class="checkbox">
              <input type="checkbox" v-model="termsAccepted" required />
              Acepto los
              <a href="#" style="color: yellow">términos y condiciones</a>
            </label>
          </div>
        </div>
        <div class="control has-text-centered">
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
.container {
  height: 100vh;
}

.box {
  width: 50%;
}

.title {
  margin-bottom: 1.5rem;
}

.field {
  margin-bottom: 0.75rem;
}

.button {
  background-color: yellow;
  color: black;
}

.select {
  width: 100%;
}
</style>
