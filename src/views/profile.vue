<template>
  <div class="container">
    <div class="columns">
      <!-- Profile Section -->
      <div class="column is-one-third">
        <div class="profile-section">
          <figure class="image is-128x128 is-centered">
            <img
              class="is-rounded"
              :src="perfilImg"
              alt="Imagen de perfil"
              :disabled="isDisabled"
            />
          </figure>
          <div class="field">
            <div class="control">
              <button
                class="button is-link"
                @click="selectImage"
                :disabled="isDisabled"
              >
                Cambiar Imagen de Perfil
              </button>
              <input
                type="file"
                ref="fileInput"
                style="display: none"
                @change="onFileChange"
              />
            </div>
          </div>
          <p class="help is-danger">Foto de perfil</p>
        </div>
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
                </div>
              </div>
            </div>
          </div>
          <div class="columns">
            <div class="column">
              <div class="field">
                <label class="label has-text-white">Ciudad</label>
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
                      <option>Enfermería</option>
                      <option>Logística Portuaria</option>
                      <option>Odontología</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="field">
            <label class="label has-text-white">Descripción</label>
            <div class="control">
              <textarea
                class="textarea"
                v-model="description"
                :disabled="isDisabled"
              ></textarea>
            </div>
          </div>
          <div class="field is-grouped">
            <div class="control">
              <button
                class="button"
                style="background-color: yellow; color: black"
                @click="onSubmit"
                :disabled="isLoading || isDisabled"
              >
                <span v-if="isLoading" class="loader-container">
                  <span class="spinner"></span>
                  <span class="ml-2">Guardando...</span>
                </span>
                <span v-else>Guardar</span>
              </button>
            </div>
            <div class="control">
              <button class="button" @click="onEdit" :disabled="isLoading">
                Edit
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Noticias del Usuario -->
      <div class="column is-two-thirds">
        <div class="section-header mb-4">
          <h2 class="title is-4">Mis Noticias</h2>
          <p class="subtitle is-6">Publicaciones que has compartido</p>
        </div>

        <div v-if="isLoadingNews" class="has-text-centered my-5">
          <div class="spinner-large"></div>
          <p class="mt-3">Cargando tus noticias...</p>
        </div>

        <div
          v-else-if="userNews.length === 0"
          class="no-news-message has-text-centered"
          style="background-color: hsl(220deg 13.04% 9.02%)"
        >
          <i class="fas fa-newspaper fa-3x mb-3"></i>
          <p>No has publicado ninguna noticia todavía.</p>
          <button
            class="button mt-3"
            style="background-color: yellow; color: black"
            @click="goToAddNews"
          >
            Crear mi primera noticia
          </button>
        </div>

        <div v-else class="columns is-multiline">
          <div
            class="column is-one-third"
            v-for="news in userNews"
            :key="news.id"
          >
            <div class="card">
              <div class="card-image">
                <figure class="image is-4by3">
                  <img
                    v-if="news.fileType === 'image'"
                    :src="news.mediaUrl"
                    alt="Imagen de noticia"
                  />
                  <video v-else-if="news.fileType === 'video'" controls>
                    <source :src="news.mediaUrl" type="video/mp4" />
                  </video>
                  <div v-else class="no-media-placeholder">
                    <i class="fas fa-image fa-3x"></i>
                  </div>
                </figure>
              </div>
              <div class="card-content">
                <div class="media">
                  <div class="media-content">
                    <p class="title is-4">{{ news.title }}</p>
                    <p class="subtitle is-6">
                      <span
                        class="tag"
                        :class="getCategoryClass(news.category)"
                      >
                        {{ getCategoryName(news.category) }}
                      </span>
                    </p>
                  </div>
                </div>
                <div class="content">
                  {{ news.description }}
                  <br />
                  <time
                    :datetime="formatDateTime(news.timestamp)"
                    class="is-size-7 has-text-grey"
                  >
                    {{ formatDate(news.timestamp) }}
                  </time>
                </div>
              </div>
              <footer class="card-footer">
                <a class="card-footer-item" @click="editNews(news)">
                  <i class="fas fa-edit mr-2"></i> Editar
                </a>
                <a
                  class="card-footer-item has-text-danger"
                  @click="deleteNews(news)"
                >
                  <i class="fas fa-trash mr-2"></i> Eliminar
                </a>
              </footer>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";
import { auth, storage, db } from "../firebase";
import { getAuth } from "firebase/auth";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

interface News {
  id: string;
  mediaUrl: string;
  title: string;
  author: string;
  description: string;
  timestamp: any;
  category: string;
  fileType: string;
}

const router = useRouter();
const profileImage = ref("/default-profile.png"); // Imagen por defecto
const fileInput = ref<HTMLInputElement | null>(null);
const isDisabled = ref(true);
const isLoading = ref(false);
const isLoadingNews = ref(true);
const username = ref("");
const email = ref("");
const city = ref("");
const program = ref("");
const description = ref("");
const userNews = ref<News[]>([]);
const perfilImg = ref(profileImage.value);
let notyf: Notyf;

// Inicializar Notyf
onMounted(() => {
  notyf = new Notyf({
    duration: 3000,
    position: { x: "right", y: "top" },
    types: [
      {
        type: "success",
        background: "green",
        icon: {
          className: "fas fa-check-circle",
          tagName: "i",
        },
      },
      {
        type: "error",
        background: "red",
        icon: {
          className: "fas fa-times-circle",
          tagName: "i",
        },
      },
    ],
  });
});

const selectImage = () => {
  fileInput.value?.click();
};

const onFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (file && userId) {
    try {
      const storageReference = storageRef(
        storage,
        `profile_images/${userId}/${file.name}`
      );
      await uploadBytes(storageReference, file);
      const downloadURL = await getDownloadURL(storageReference);
      perfilImg.value = downloadURL;
      await updateProfileImage(downloadURL);
      notyf.success("Imagen de perfil actualizada");
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      notyf.error("Error al actualizar la imagen de perfil");
    }
  }
};

const updateProfileImage = async (downloadURL: string) => {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  if (!userId) return;

  try {
    const userDoc = doc(getFirestore(), "users", userId);
    await updateDoc(userDoc, {
      perfilImg: downloadURL,
    });
  } catch (error) {
    console.error("Error al actualizar la imagen de perfil:", error);
    throw error;
  }
};

const onSubmit = async () => {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  if (!userId) {
    notyf.error("Usuario no autenticado");
    return;
  }

  isLoading.value = true;

  try {
    const userDoc = doc(getFirestore(), "users", userId);
    await updateDoc(userDoc, {
      username: username.value,
      email: email.value,
      city: city.value,
      program: program.value,
      description: description.value,
    });
    isDisabled.value = true;
    notyf.success("Perfil actualizado correctamente");
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
    notyf.error("Error al actualizar el perfil");
  } finally {
    isLoading.value = false;
  }
};

const onEdit = () => {
  isDisabled.value = false;
};

const fetchUserNews = async () => {
  const auth = getAuth();
  const user = auth.currentUser;

  if (!user) {
    isLoadingNews.value = false;
    return;
  }

  isLoadingNews.value = true;

  try {
    const categories = ["news", "moda", "sport", "gaming"];
    let newsData: News[] = [];

    for (const category of categories) {
      const q = query(
        collection(db, category),
        where("author", "==", user.displayName || user.email)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        newsData.push({
          id: doc.id,
          ...(doc.data() as News),
          category: category,
        });
      });
    }

    // Ordenar por fecha (más reciente primero)
    userNews.value = newsData.sort((a, b) => {
      return b.timestamp?.toMillis() - a.timestamp?.toMillis();
    });
  } catch (error) {
    console.error("Error al recuperar las noticias del usuario:", error);
    notyf.error("Error al cargar tus noticias");
  } finally {
    isLoadingNews.value = false;
  }
};

const formatDate = (timestamp: any) => {
  if (!timestamp) return "Fecha desconocida";

  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);

  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDateTime = (timestamp: any) => {
  if (!timestamp) return "";

  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);

  return date.toISOString();
};

const getCategoryName = (category: string) => {
  const categories = {
    news: "Noticias",
    moda: "Moda",
    sport: "Deportes",
    gaming: "Gaming",
  };
  return categories[category as keyof typeof categories] || category;
};

const getCategoryClass = (category: string) => {
  const classes = {
    news: "is-info",
    moda: "is-primary",
    sport: "is-success",
    gaming: "is-warning",
  };
  return classes[category as keyof typeof classes] || "is-light";
};

const editNews = (news: News) => {
  sessionStorage.setItem("editingNews", JSON.stringify(news));
  router.push(`/${news.category}/`);
};

const deleteNews = async (news: News) => {
  if (!confirm(`¿Estás seguro de eliminar la noticia "${news.title}"?`)) {
    return;
  }

  try {
    await deleteDoc(doc(db, news.category, news.id));
    userNews.value = userNews.value.filter((item) => item.id !== news.id);
    notyf.success("Noticia eliminada correctamente");
  } catch (error) {
    console.error("Error al eliminar la noticia:", error);
    notyf.error("Error al eliminar la noticia");
  }
};

const goToAddNews = () => {
  router.push("/noticias");
};

onMounted(async () => {
  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  if (!userId) {
    router.push("/login");
    return;
  }

  try {
    const userDoc = doc(getFirestore(), "users", userId);
    const docSnap = await getDoc(userDoc);

    if (docSnap.exists()) {
      const data = docSnap.data();
      username.value = data.username || "";
      email.value = data.email || "";
      city.value = data.city || "";
      program.value = data.program || "";
      description.value = data.description || "";
      perfilImg.value = data.perfilImg || profileImage.value;
    }

    await fetchUserNews();
  } catch (error) {
    console.error("Error al obtener los datos del perfil:", error);
    notyf.error("Error al cargar los datos del perfil");
  }
});
</script>

<style scoped>
.container {
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 2rem;
}

.image.is-centered {
  margin: 0 auto;
  margin-bottom: 1rem;
}

.card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  margin-bottom: 1rem;
}

.card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.card-image img,
.card-image video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  flex-grow: 1;
}

.no-media-placeholder {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  background-color: #f5f5f5;
  color: #aaa;
}

.no-news-message {
  padding: 3rem;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #666;
}

/* Estilos para el estado de carga */
button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Estilos para el spinner de carga */
.loader-container {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.spinner {
  display: inline-block;
  width: 1rem;
  height: 1rem;
  border: 2px solid rgba(0, 0, 0, 0.2);
  border-left-color: #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.spinner-large {
  display: inline-block;
  width: 3rem;
  height: 3rem;
  border: 3px solid rgba(0, 0, 0, 0.1);
  border-left-color: #ffe08a;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.tag {
  font-size: 0.75rem;
  margin-top: 0.5rem;
}

.section-header {
  border-bottom: 2px solid #f5f5f5;
  padding-bottom: 1rem;
}

.card-footer-item {
  cursor: pointer;
}

.card-footer-item:hover {
  background-color: #f9f9f9;
}

.card-footer-item.has-text-danger:hover {
  background-color: #feecf0;
}
</style>
