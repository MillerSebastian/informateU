<template>
  <div
    class="news-card"
    :class="{ 'news-card--expanded': isExpanded }"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="news-card__media">
      <div v-if="news.fileType === 'image'" class="news-card__image-container">
        <img
          :src="news.mediaUrl"
          alt="Imagen de la noticia"
          class="news-card__image"
        />
      </div>
      <div
        v-else-if="news.fileType === 'video'"
        class="news-card__video-container"
      >
        <video controls class="news-card__video">
          <source :src="news.mediaUrl" type="video/mp4" />
        </video>
      </div>
      <div class="news-card__category">{{ category }}</div>
    </div>

    <div class="news-card__content">
      <h3 class="news-card__title">{{ truncateText(news.title, 60) }}</h3>

      <div class="news-card__author">
        <div class="news-card__author-image">
          <img
            :src="authorProfileImage"
            alt="Imagen de perfil del autor"
            @error="handleImageError"
          />
        </div>
        <div class="news-card__author-info">
          <span class="news-card__author-name"
            >@{{ truncateText(news.author, 20) }}</span
          >
          <time class="news-card__date" :datetime="news.timestamp">{{
            formattedDate
          }}</time>
        </div>
      </div>

      <div class="news-card__description">
        <p :class="{ 'news-card__description--clipped': !isExpanded }">
          {{ news.description }}
        </p>
        <button
          v-if="isDescriptionLong"
          class="news-card__toggle-btn"
          @click="isExpanded = !isExpanded"
        >
          {{ isExpanded ? "Mostrar menos" : "Mostrar más" }}
        </button>
      </div>

      <div class="news-card__actions">
        <button class="news-card__delete-btn" @click="deleteNews(news.id)">
          <span class="news-card__delete-icon">
            <i class="fas fa-trash-alt"></i>
          </span>
          <span>Eliminar</span>
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

const emit = defineEmits(["newsDeleted"]);

const hover = ref(false);
const isExpanded = ref(false);
const authorProfileImage = ref(
  "https://bulma.io/assets/images/placeholders/96x96.png"
);
let notyf: Notyf;

// Determinar si el texto de la descripción es lo suficientemente largo para mostrar el botón
const isDescriptionLong = computed(() => {
  return props.news.description && props.news.description.length > 120;
});

// Función para truncar texto y evitar desbordamientos
const truncateText = (text: string, maxLength: number) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

onMounted(async () => {
  // Inicializar Notyf para notificaciones
  notyf = new Notyf({
    duration: 3000,
    position: { x: "right", y: "bottom" },
    types: [
      {
        type: "success",
        background: "#38c172",
        icon: {
          className: "fas fa-check-circle",
          tagName: "i",
          color: "white",
        },
      },
      {
        type: "error",
        background: "#e3342f",
        icon: {
          className: "fas fa-times-circle",
          tagName: "i",
          color: "white",
        },
      },
    ],
  });

  // Obtener imagen de perfil del autor
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
    emit("newsDeleted", id);
  } catch (error) {
    notyf.error("Error al eliminar esta noticia");
  }
};
</script>

<style scoped>
.news-card {
  position: relative;
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #1a1a2e;
  color: #e6e6e6;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

.news-card__media {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.news-card__image,
.news-card__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.news-card:hover .news-card__image,
.news-card:hover .news-card__video {
  transform: scale(1.05);
}

.news-card__category {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(255, 107, 107, 0.85);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.news-card__content {
  padding: 1.25rem;
}

.news-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  line-height: 1.3;
  color: #ffffff;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.news-card__author {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.news-card__author-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 0.75rem;
  border: 2px solid #16213e;
  flex-shrink: 0;
}

.news-card__author-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-card__author-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.news-card__author-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #b8c1ec;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-card__date {
  font-size: 0.75rem;
  color: #a7abc5;
}

.news-card__description {
  color: #d1d1e0;
  font-size: 0.9375rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.news-card__description--clipped {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: 4.5em;
}

.news-card__toggle-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  font-weight: 600;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: block;
}

.news-card__toggle-btn:hover {
  color: #ff9797;
  text-decoration: underline;
}

.news-card__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.news-card__delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #16213e;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.news-card__delete-btn:hover {
  background-color: #ff6b6b;
  color: #16213e;
}

.news-card--expanded {
  max-width: 500px;
}

.news-card--expanded .news-card__description--clipped {
  max-height: none;
  -webkit-line-clamp: initial;
}

@media (max-width: 768px) {
  .news-card {
    max-width: 100%;
  }
}
</style>
