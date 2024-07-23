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

<script lang="ts">
import { defineComponent, ref } from "vue";
import { auth, db } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { addDoc, collection } from "firebase/firestore";

export default defineComponent({
  name: "Register",
  data() {
    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      program: "",
      city: "",
      documentType: "",
      birthDate: "",
      termsAccepted: false,
      isDisabled: ref(false),
    };
  },
  methods: {
    async register() {
      if (!this.termsAccepted) {
        alert("Debes aceptar los términos y condiciones.");
        return;
      }

      try {
        // Crear un usuario en Firebase Authentication
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          this.email,
          this.password
        );
        const user = userCredential.user;

        // Guardar datos del usuario en Firestore
        await addDoc(collection(db, "users"), {
          uid: user.uid,
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          program: this.program,
          city: this.city,
          documentType: this.documentType,
          birthDate: this.birthDate,
        });

        this.$router.push("/");
      } catch (error) {
        console.error("Error al registrarse:", error);
        // Consider adding user-friendly error handling here
      }
    },
  },
});
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
