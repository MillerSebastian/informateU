<template>
  <div class="container">
    <div class="columns is-centered">
      <div class="column is-half">
        <!-- Profile Section -->
        <div class="profile-section">
          <!-- Profile Picture -->
          <figure class="image is-128x128 is-centered">
            <img
              class="is-rounded"
              :src="profileImage"
              @click="selectImage"
              style="cursor: pointer"
            />
            <input
              type="file"
              ref="fileInput"
              style="display: none"
              @change="onFileChange"
            />
          </figure>
          <p class="help is-danger">Foto de perfil</p>
        </div>

        <!-- Form Fields Section -->
        <div class="form-section">
          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label has-text-white">Username</label>
                <div class="control has-icons-left has-icons-right">
                  <input
                    class="input is-success"
                    type="text"
                    placeholder="nombre de usuario"
                    v-model="username"
                    :disabled="isDisabled"
                  />
                  <span class="icon is-small is-left">
                    <i class="fas fa-user"></i>
                  </span>
                  <span class="icon is-small is-right"> </span>
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label has-text-white">Email</label>
                <div class="control has-icons-left has-icons-right">
                  <input
                    class="input is-danger"
                    type="email"
                    placeholder="Email"
                    v-model="email"
                    :disabled="isDisabled"
                  />
                  <span class="icon is-small is-left">
                    <i class="fas fa-envelope"></i>
                  </span>
                  <span class="icon is-small is-right"> </span>
                </div>
              </div>
            </div>
          </div>
          <!-- Subject Dropdown -->
          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label has-text-white">Cuidad</label>
                <div class="control">
                  <div class="select">
                    <select v-model="city" :disabled="isDisabled">
                      <option>Barranquilla</option>
                      <option>Medellin</option>
                      <option>Bogota</option>
                      <option>Cartagena</option>
                      <option>Cali</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            <div class="column">
              <div class="field">
                <label class="label has-text-white">Programa</label>
                <div class="control">
                  <div class="select">
                    <select v-model="program" :disabled="isDisabled">
                      <option>Ing. Sistemas</option>
                      <option>Ing. Industrial</option>
                      <option>enfermeria</option>
                      <option>Logistica portuaria</option>
                      <option>Odontologia</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <!-- Message Textarea -->
          <div class="field">
            <label class="label has-text-white">Descripcion</label>
            <div class="control">
              <textarea
                class="textarea"
                v-model="description"
                :disabled="isDisabled"
              ></textarea>
            </div>
          </div>

          <!-- Submit, Cancel, and Edit Buttons -->
          <div class="field is-grouped">
            <div class="control">
              <button
                class="button"
                style="background-color: yellow; color: black"
                @click="onSubmit"
                :disabled="isDisabled"
              >
                Submit
              </button>
            </div>
            <div class="control">
              <button class="button" @click="onEdit">Edit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const profileImage = ref(
  "https://bulma.io/assets/images/placeholders/128x128.png"
);
const fileInput = ref<HTMLInputElement | null>(null);
const isDisabled = ref(false);
const username = ref("");
const email = ref("");
const city = ref("Barranquilla");
const program = ref("Ing. Sistemas");
const description = ref("");

const selectImage = () => {
  fileInput.value?.click();
};

const onFileChange = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      profileImage.value = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }
};

const onSubmit = () => {
  isDisabled.value = true;
};

const onEdit = () => {
  isDisabled.value = false;
};
</script>

<style scoped>
.image.is-centered {
  margin: 0 auto;
}

.profile-section {
  text-align: center;
  margin-bottom: 2rem;
}

.input.is-success {
  border-color: #27ae60;
}

.input.is-danger {
  border-color: #e74c3c;
}

.help.is-success {
  color: #27ae60;
}

.help.is-danger {
  color: #e74c3c;
}
</style>
