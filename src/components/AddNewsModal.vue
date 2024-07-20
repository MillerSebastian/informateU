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
        <div class="file is-primary">
          <label class="file-label">
            <input
              class="file-input"
              type="file"
              @change="getFile"
              id="fileInput"
            />
            <span class="file-cta">
              <span class="file-icon">
                <i class="fas fa-upload"></i>
              </span>
              <span class="file-label"> Subir foto </span>
            </span>
          </label>
          <pre>{{ imgFile?.name }}</pre>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button class="button is-success" @click="addNews">Añadir</button>
        <button class="button is-primary" @click="closeModal">Cancelar</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineComponent, ref } from "vue";
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

const props = defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
  closeModal: {
    type: Function,
    required: true,
  },
});

const title = ref("");
const description = ref("");
const mediaUrl = ref("");
const imgFile = ref();

// Manejador de cambio de archivo
const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    imgFile.value = target.files[0];
  }
};

const addNews = async () => {
  try {
    if (imgFile.value) {
      const storageReference = storageRef(
        storage,
        `uploads/${imgFile.value.name}`
      );
      await uploadBytes(storageReference, imgFile.value);
      mediaUrl.value = await getDownloadURL(storageReference);
    }

    await addDoc(collection(db, "news"), {
      title: title.value,
      description: description.value,
      imageUrl: mediaUrl.value,
      author: "John Smith",
      timestamp: Timestamp.now(),
    });
    props.closeModal();
  } catch (e) {
    console.error("Error adding document: ", e);
  }
};

const getFile = (value: any) => {
  imgFile.value = value.target.files[0];
};
</script>
