<template>
  <div class="modal" :class="{ 'is-active': isActive }">
    <div class="modal-background"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Añadir Noticia</p>
        <button class="delete" aria-label="close" @click="closeModal"></button>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">Título</label>
          <div class="control">
            <input
              class="input"
              type="text"
              v-model="title"
              placeholder="Título de la noticia"
            />
          </div>
        </div>
        <div class="field">
          <label class="label">Descripción</label>
          <div class="control">
            <textarea
              class="textarea"
              v-model="description"
              placeholder="Descripción de la noticia"
            ></textarea>
          </div>
        </div>
        <div class="file has-name is-fullwidth">
          <label class="file-label">
            <input
              class="file-input"
              type="file"
              name="resume"
              id="file-input"
              @change="handleFileChange"
            />
            <span class="file-cta">
              <span class="file-icon">
                <i class="fas fa-upload"></i>
              </span>
              <span class="file-label">Choose a file…</span>
            </span>
            <span class="file-name">{{ fileName || "No file chosen" }}</span>
          </label>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button
          class="button is-success"
          style="background-color: yellow; color: black"
          @click="addNews"
        >
          Añadir
        </button>
        <button class="button ml-2" @click="closeModal">Cancelar</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import {
  storage,
  ref as storageRef,
  uploadBytes,
  db,
  addDoc,
  collection,
  Timestamp,
  getDownloadURL,
} from "@/firebase";
import { getAuth } from "firebase/auth";

const props = defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
  closeModal: {
    type: Function,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
});

const title = ref("");
const description = ref("");
const mediaUrl = ref("");
const imgFile = ref<File | null>(null);
const fileName = ref<string>("");

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    imgFile.value = target.files[0];
    fileName.value = target.files[0].name;
  }
};

const addNews = async () => {
  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      console.error("Usuario no autenticado");
      return;
    }

    if (imgFile.value) {
      const storageReference = storageRef(
        storage,
        `uploads/${imgFile.value.name}`
      );
      await uploadBytes(storageReference, imgFile.value);
      mediaUrl.value = await getDownloadURL(storageReference);
    }

    await addDoc(collection(db, props.category), {
      title: title.value,
      description: description.value,
      imageUrl: mediaUrl.value,
      videoUrl: mediaUrl.value,
      author: user.displayName || user.email,
      timestamp: Timestamp.now(),
    });

    props.closeModal();
  } catch (error) {
    console.error("Error al añadir noticia:", error);
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

.select {
  width: 100%;
}
</style>
