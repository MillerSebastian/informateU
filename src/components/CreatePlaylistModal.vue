<template>
  <div class="modal" :class="{ 'is-active': isActive }">
    <div class="modal-background" @click="closeModal"></div>
    <div class="modal-card">
      <header class="modal-card-head">
        <p class="modal-card-title">Crear nueva playlist</p>
        <button class="delete" @click="closeModal" aria-label="close"></button>
      </header>
      <section class="modal-card-body">
        <div class="field">
          <label class="label">Nombre de la playlist</label>
          <div class="control">
            <input
              class="input"
              type="text"
              v-model="playlistName"
              placeholder="Mi playlist favorita"
            />
          </div>
        </div>

        <div class="field">
          <label class="label">Descripción (opcional)</label>
          <div class="control">
            <textarea
              class="textarea"
              v-model="playlistDescription"
              placeholder="Una breve descripción de la playlist"
            ></textarea>
          </div>
        </div>

        <div class="field" v-if="initialSong">
          <label class="label">La playlist incluirá inicialmente:</label>
          <div class="box initial-song">
            <strong>{{ initialSong.title }}</strong> - {{ initialSong.artist }}
          </div>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button
          class="button is-button-modal"
          @click="createPlaylist"
          :disabled="!playlistName || isCreating"
          :class="{ 'is-loading': isCreating }"
        >
          Crear playlist
        </button>
        <button class="button" @click="closeModal">Cancelar</button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { getFirestore, collection, addDoc } from "firebase/firestore";

const props = defineProps({
  isActive: {
    type: Boolean,
    required: true,
  },
  closeModal: {
    type: Function,
    required: true,
  },
  initialSong: {
    type: Object,
    default: null,
  },
});

const emit = defineEmits(["playlist-created"]);

const db = getFirestore();
const playlistName = ref("");
const playlistDescription = ref("");
const isCreating = ref(false);

const createPlaylist = async () => {
  if (!playlistName.value) return;

  isCreating.value = true;

  try {
    // Preparar los datos de la playlist
    const playlistData = {
      name: playlistName.value,
      description: playlistDescription.value || "",
      createdAt: new Date(),
      updatedAt: new Date(),
      songs: props.initialSong ? [props.initialSong] : [],
    };

    // Guardar en Firestore
    const playlistRef = await addDoc(collection(db, "playlists"), playlistData);

    // Emitir evento con los datos de la playlist creada
    emit("playlist-created", {
      id: playlistRef.id,
      ...playlistData,
    });

    // Limpiar formulario
    resetForm();

    // Cerrar modal
    props.closeModal();
  } catch (error) {
    console.error("Error al crear la playlist:", error);
    alert("Error al crear la playlist. Inténtalo de nuevo.");
  } finally {
    isCreating.value = false;
  }
};

const resetForm = () => {
  playlistName.value = "";
  playlistDescription.value = "";
};
</script>

<style scoped>
.initial-song {
  background-color: #f9f9f9;
  border-left: 3px solid rgb(233, 18, 204);
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
