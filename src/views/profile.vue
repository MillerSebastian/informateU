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
                      <option>enfermería</option>
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

      <!-- noticias -->
      <div class="column is-two-thirds">
        <div class="news-container">
          <div v-for="news in userNews" :key="news.id" class="news-card">
            <div class="card">
              <div class="card-image">
                <figure class="image is-4by3">
                  <img
                    v-if="isImage(news.mediaUrl)"
                    :src="news.mediaUrl"
                    alt="Imagen de la noticia"
                  />
                </figure>
              </div>
              <div class="card-content">
                <p class="title">{{ news.title }}</p>
                <p class="subtitle">{{ news.author }}</p>
                <div class="content">{{ news.description }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { auth } from "../firebase";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";

interface News {
  id: string;
  mediaUrl: string;
  title: string;
  author: string;
  description: string;
  timestamp: firebase.firestore.Timestamp;
}

const profileImage = ref(
  "https://bulma.io/assets/images/placeholders/128x128.png"
);
const fileInput = ref<HTMLInputElement | null>(null);
const isDisabled = ref(true);
const username = ref("");
const email = ref("");
const city = ref("");
const program = ref("");
const description = ref("");
const userNews = ref<News[]>([]);
const perfilImg = ref(profileImage.value);

const userId = auth.currentUser?.uid;

const selectImage = () => {
  fileInput.value?.click();
};

const onFileChange = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0];
  if (file) {
    const storageRef = firebase.storage().ref();
    const profileImageRef = storageRef.child(
      `profile_images/${userId}/${file.name}`
    );

    try {
      const snapshot = await profileImageRef.put(file);
      const downloadURL = await snapshot.ref.getDownloadURL();
      perfilImg.value = downloadURL;
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  }
};

const onSubmit = async () => {
  if (!userId) return;

  try {
    const userDoc = doc(getFirestore(), "users", userId);
    await updateDoc(userDoc, {
      username: username.value,
      email: email.value,
      city: city.value,
      program: program.value,
      description: description.value,
      perfilImg: perfilImg.value,
    });
    isDisabled.value = true;
  } catch (error) {
    console.error("Error al actualizar el perfil:", error);
  }
};

const onEdit = () => {
  isDisabled.value = false;
};

onMounted(async () => {
  if (!userId) return;

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

    const newsCollection = collection(getFirestore(), "news");
    const userNewsQuery = query(newsCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(userNewsQuery);
    const newsData: News[] = [];
    querySnapshot.forEach((doc) => {
      const newsItem = doc.data() as News;
      newsData.push({ ...newsItem, id: doc.id });
    });
    userNews.value = newsData;
  } catch (error) {
    console.error("Error al obtener los datos del perfil:", error);
  }
});

const isImage = (url: string) => {
  return /\.(jpg|jpeg|png|gif|bmp)$/i.test(url);
};
</script>

<style scoped>
.profile-section {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.news-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
}

.news-card {
  width: 300px;
  margin: 1rem;
}
</style>
