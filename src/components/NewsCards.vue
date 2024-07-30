<template>
  <div class="card">
    <div class="card-image">
      <figure class="image is-4by3">
        <div v-if="news.imageUrl">
          <img :src="news.imageUrl" alt="Imagen de la noticia" />
        </div>
        <div v-else>
          <video width="320" height="240" controls>
            <source :src="news.videoUrl" type="video/mp4" />
          </video>
        </div>
      </figure>
    </div>
    <div class="card-content">
      <div class="media">
        <div class="media-left">
          <figure class="image is-48x48">
            <img
              src="https://bulma.io/assets/images/placeholders/96x96.png"
              alt="Placeholder image"
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
        <button class="button is-small is-text" @click="toggleReadMore">
          {{ isExpanded ? "Leer menos" : "Leer más" }}
        </button>
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
import { ref, computed } from "vue";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";

interface News {
  id: string;
  imageUrl: string;
  title: string;
  author: string;
  description: string;
  timestamp: any;
  videoUrl: string;
}

const props = defineProps<{
  news: News;
  category: string;
}>();

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

const editNews = (news: News) => {
  console.log("Editar noticia:", news);
};
</script>

<style scoped>
.card {
  margin-bottom: 1rem;
  max-width: 400px; /* Ajusta este valor según tus necesidades */
}

.card-image img {
  object-fit: cover;
  width: 100%;
  height: auto;
}

.content {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  /* -webkit-box-orient: vertical;
  -webkit-line-clamp: 3; Número de líneas antes de truncar el texto */
}

.is-clipped {
  /* -webkit-line-clamp: 3; Número de líneas antes de truncar el texto */
  max-height: 4.5em; /* Ajusta esto según el número de líneas y el tamaño de la fuente */
}

.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
</style>
