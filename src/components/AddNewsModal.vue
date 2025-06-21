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
              <span class="file-label">Elige un archivo…</span>
            </span>
            <span class="file-name">{{
              fileName || "No se ha elegido archivo"
            }}</span>
          </label>
        </div>
      </section>
      <footer class="modal-card-foot">
        <button
          class="button is-success"
          style="background-color: yellow; color: black"
          @click="addNews"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Añadiendo...</span>
          <span v-else>Añadir</span>
        </button>
        <button class="button ml-2" @click="closeModal" :disabled="isLoading">
          Cancelar
        </button>
      </footer>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  storage,
  ref as storageRef,
  uploadBytes,
  db,
  addDoc,
  collection,
  Timestamp,
  getDownloadURL,
  doc,
  getDoc,
} from "@/firebase";
import { getAuth } from "firebase/auth";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

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
const fileType = ref<string>("");
const file = ref<File | null>(null);
const fileName = ref<string>("");
const isLoading = ref(false);
let notyf: Notyf;

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    file.value = target.files[0];
    fileName.value = target.files[0].name;
    fileType.value = target.files[0].type.startsWith("video")
      ? "video"
      : "image";
  }
};

onMounted(() => {
  notyf = new Notyf({
    duration: 3000,
    position: { x: "right", y: "bottom" },
    types: [
      {
        type: "success",
        background: "green",
        icon: {
          className: "fas fa-check-circle",
          tagName: "i",
          color: "white",
        },
      },
      {
        type: "error",
        background: "red",
        icon: {
          className: "fas fa-times-circle",
          tagName: "i",
          color: "white",
        },
      },
    ],
  });
});

const addNews = async () => {
  if (!title.value.trim()) {
    notyf.error("Por favor, ingresa un título para la noticia");
    return;
  }

  if (!description.value.trim()) {
    notyf.error("Por favor, ingresa una descripción para la noticia");
    return;
  }

  isLoading.value = true;

  try {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      notyf.error("Usuario no autenticado");
      isLoading.value = false;
      return;
    }

    // Obtener la imagen de perfil del usuario
    let userProfileImage = "";
    try {
      const userDoc = doc(db, "users", user.uid);
      const userSnap = await getDoc(userDoc);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        userProfileImage = userData.perfilImg || "";
      }
    } catch (error) {
      console.error("Error al obtener imagen de perfil:", error);
    }

    if (file.value) {
      const storageReference = storageRef(
        storage,
        `uploads/${Date.now()}_${file.value.name}`
      );
      await uploadBytes(storageReference, file.value);
      mediaUrl.value = await getDownloadURL(storageReference);
    }

    await addDoc(collection(db, props.category), {
      title: title.value,
      description: description.value,
      mediaUrl: mediaUrl.value,
      fileType: fileType.value,
      author: user.displayName || user.email,
      userId: user.uid,
      perfilImg: userProfileImage,
      timestamp: Timestamp.now(),
    });

    notyf.success("Noticia añadida exitosamente");

    title.value = "";
    description.value = "";
    mediaUrl.value = "";
    fileType.value = "";
    file.value = null;
    fileName.value = "";

    props.closeModal();
  } catch (error) {
    console.error("Error al añadir noticia:", error);
    notyf.error("Error al añadir la noticia. Inténtalo de nuevo.");
  } finally {
    isLoading.value = false;
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

button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}
</style>
