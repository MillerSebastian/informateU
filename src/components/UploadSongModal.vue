<template>
  <div class="modal" :class="{ 'is-active': isActive }">
    <div class="modal-background" @click="closeModal"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Subir nueva canción</p>
        <button class="delete" @click="closeModal" aria-label="close"></button>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">Título</label>
          <div class="control">
            <input
              class="input"
              type="text"
              v-model="songData.title"
              placeholder="Título de la canción"
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Artista</label>
          <div class="control">
            <input
              class="input"
              type="text"
              v-model="songData.artist"
              placeholder="Nombre del artista"
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Archivo de audio</label>
          <div class="file has-name">
            <label class="file-label">
              <input
                class="file-input"
                type="file"
                accept="audio/*"
                @change="handleFileChange"
              />
              <span class="file-cta">
                <span class="file-icon">
                  <i class="fas fa-upload"></i>
                </span>
                <span class="file-label"> Seleccionar archivo </span>
              </span>
              <span class="file-name" v-if="selectedFile">
                {{ selectedFile.name }}
              </span>
            </label>
          </div>
        </div>

        <div class="field">
          <label class="label">Portada (opcional)</label>
          <div class="file has-name">
            <label class="file-label">
              <input
                class="file-input"
                type="file"
                accept="image/*"
                @change="handleCoverChange"
              />
              <span class="file-cta">
                <span class="file-icon">
                  <i class="fas fa-upload"></i>
                </span>
                <span class="file-label"> Seleccionar imagen </span>
              </span>
              <span class="file-name" v-if="selectedCover">
                {{ selectedCover.name }}
              </span>
            </label>
          </div>
          <div class="cover-preview" v-if="coverPreview">
            <img :src="coverPreview" alt="Vista previa de portada" />
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button
          class="button is-button-modal"
          @click="uploadSong"
          :class="{ 'is-loading': isUploading }"
          :disabled="!isFormValid || isUploading"
        >
          Subir canción
        </button>
        <button class="button" @click="closeModal">Cancelar</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";

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

const emit = defineEmits(["song-uploaded"]);

const db = getFirestore();
const storage = getStorage();

const songData = ref({
  title: "",
  artist: "",
  genre: "",
  uploadedAt: null,
  audioUrl: "",
  coverUrl: "",
});

const selectedFile = ref(null);
const selectedCover = ref(null);
const coverPreview = ref("");
const isUploading = ref(false);

const isFormValid = computed(() => {
  return songData.value.title && songData.value.artist && selectedFile.value;
});

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
  }
};

const handleCoverChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedCover.value = file;

    // Crear preview
    const reader = new FileReader();
    reader.onload = (e) => {
      coverPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

const uploadSong = async () => {
  if (!isFormValid.value) return;

  isUploading.value = true;

  try {
    // Subir archivo de audio
    const audioFileName = `songs/${Date.now()}_${selectedFile.value.name}`;
    const audioFileRef = storageRef(storage, audioFileName);
    const audioSnapshot = await uploadBytes(audioFileRef, selectedFile.value);
    const audioUrl = await getDownloadURL(audioSnapshot.ref);

    let coverUrl = "";

    // Subir imagen de portada si existe
    if (selectedCover.value) {
      const coverFileName = `covers/${Date.now()}_${selectedCover.value.name}`;
      const coverFileRef = storageRef(storage, coverFileName);
      const coverSnapshot = await uploadBytes(
        coverFileRef,
        selectedCover.value
      );
      coverUrl = await getDownloadURL(coverSnapshot.ref);
    }

    // Guardar datos en Firestore
    const songRef = await addDoc(collection(db, "songs"), {
      title: songData.value.title,
      artist: songData.value.artist,
      genre: songData.value.genre || "",
      uploadedAt: new Date(),
      audioUrl,
      coverUrl,
    });

    // Emitir evento con los datos de la canción creada
    emit("song-uploaded", {
      id: songRef.id,
      title: songData.value.title,
      artist: songData.value.artist,
      genre: songData.value.genre || "",
      uploadedAt: new Date(),
      audioUrl,
      coverUrl,
    });

    // Limpiar formulario
    resetForm();

    // Cerrar modal
    props.closeModal();
  } catch (error) {
    console.error("Error al subir la canción:", error);
    alert("Error al subir la canción. Inténtalo de nuevo.");
  } finally {
    isUploading.value = false;
  }
};

const resetForm = () => {
  songData.value = {
    title: "",
    artist: "",
    genre: "",
    uploadedAt: null,
    audioUrl: "",
    coverUrl: "",
  };
  selectedFile.value = null;
  selectedCover.value = null;
  coverPreview.value = "";
};
</script>

<style scoped>
.cover-preview {
  margin-top: 1rem;
  max-width: 200px;
}

.cover-preview img {
  width: 100%;
  height: auto;
  border-radius: 4px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.is-button-modal {
  background-color: rgb(233, 18, 204);
  color: white;
  border: none;
}

.is-button-modal:hover {
  background-color: rgb(207, 16, 181);
  color: white;
}
</style>
