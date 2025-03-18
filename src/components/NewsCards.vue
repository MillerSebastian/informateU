<!-- NewsCard.vue -->
<template>
  <div class="card">
    <div class="card-image">
      <figure class="image is-4by3">
        <div v-if="news.fileType === 'image'">
          <img :src="news.mediaUrl" alt="Imagen de la noticia" />
        </div>
        <div v-else-if="news.fileType === 'video'" class="video-container">
          <video controls>
            <source :src="news.mediaUrl" type="video/mp4" />
          </video>
        </div>
      </figure>
    </div>
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <figure class="image is-48x48">
            <!-- Directly fetch profile image using userId -->
            <img
              :src="authorProfileImage"
              alt="Imagen de perfil del autor"
              class="is-rounded"
              @error="handleImageError"
            />
          </figure>
        </div>
        <div class="media-content">
          <p class="title is-4">{{ news.title }}</p>
          <p class="subtitle is-6">@{{ news.author }}</p>
        </div>
      </div>

      <div class="content">
        <p :class="{ 'is-clipped': !isExpanded }">{{ news.description }}</p>
        <br />
        <time :datetime="news.timestamp">{{ formattedDate }}</time>
      </div>

      <div class="buttons">
        <button class="button is-danger" @click="deleteNews(news.id)">
          Borrar
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { doc, deleteDoc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";

interface News {
  id: string;
  mediaUrl: string;
  title: string;
  author: string;
  description: string;
  timestamp: any;
  fileType: string;
  userId: string; // Ensure this exists in your data
}

const props = defineProps<{
  news: News;
  category: string;
}>();

const authorProfileImage = ref(
  "https://bulma.io/assets/images/placeholders/96x96.png"
);

// Fetch the author's profile image
onMounted(async () => {
  if (props.news.userId) {
    try {
      const userDoc = doc(db, "users", props.news.userId);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists() && docSnap.data().perfilImg) {
        authorProfileImage.value = docSnap.data().perfilImg;
      }
    } catch (error) {
      console.error("Error al obtener la imagen de perfil:", error);
    }
  }
});

// Handle image load errors
const handleImageError = (event) => {
  event.target.src = "https://bulma.io/assets/images/placeholders/96x96.png";
};

const formattedDate = computed(() => {
  const date = new Date(props.news.timestamp.seconds * 1000);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

const deleteNews = async (id: string) => {
  try {
    await deleteDoc(doc(db, props.category, id));
    alert("Noticia borrada exitosamente");
  } catch (error) {
    console.error("Error al borrar la noticia:", error);
  }
};

const isExpanded = ref(false);
const toggleReadMore = () => {
  isExpanded.value = !isExpanded.value;
};
</script>

<style scoped>
.card {
  margin-bottom: 1rem;
  max-width: 400px;
}

.card-image img {
  object-fit: cover;
  width: 100%;
  height: auto;
}

.video-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.content {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
}

.is-clipped {
  max-height: 4.5em;
}

.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.is-rounded {
  border-radius: 50%;
  object-fit: cover;
  width: 48px;
  height: 48px;
}
</style>
