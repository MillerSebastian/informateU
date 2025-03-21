<template>
  <div
    class="card news-card"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
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
import { Notyf } from "notyf";
import "notyf/notyf.min.css";

interface News {
  id: string;
  mediaUrl: string;
  title: string;
  author: string;
  description: string;
  timestamp: any;
  fileType: string;
  userId: string;
}

const props = defineProps<{
  news: News;
  category: string;
}>();

const hover = ref(false);
const authorProfileImage = ref(
  "https://bulma.io/assets/images/placeholders/96x96.png"
);

onMounted(async () => {
  try {
    if (props.news.userId) {
      const userDoc = doc(db, "users", props.news.userId);
      const docSnap = await getDoc(userDoc);
      if (docSnap.exists() && docSnap.data().perfilImg) {
        authorProfileImage.value = docSnap.data().perfilImg;
      }
    }
  } catch (error) {
    console.error("Error al obtener la imagen de perfil:", error);
  }
});

let notyf: Notyf;

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
    notyf.success("Noticia eliminada exitosamente");
  } catch (error) {
    notyf.error("Error sl elimnar esta noticia");
    return;
  }
};

const isExpanded = ref(false);
</script>

<style scoped>
.card {
  margin-bottom: 1rem;
  max-width: 400px;
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;
}

.news-card:hover {
  transform: scale(1.05);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.15);
}

.card-image img,
.video-container video {
  object-fit: cover;
  width: 100%;
  height: auto;
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
