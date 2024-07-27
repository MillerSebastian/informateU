<template>
  <div class="card">
    <div class="card-image">
      <figure class="image is-4by3">
        <img :src="news.imageUrl" alt="Imagen de la noticia" />
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
        {{ news.description }}
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
import { computed } from "vue";
import { doc, deleteDoc } from "firebase/firestore";
import { db } from "@/firebase";

interface News {
  id: string;
  imageUrl: string;
  title: string;
  author: string;
  description: string;
  timestamp: any; // Asegúrate de que el tipo sea compatible con Date
}

const props = defineProps<{
  news: News;
  category: string;
}>();

const formattedDate = computed(() => {
  const date = new Date(props.news.timestamp.seconds * 1000); // Convierte el timestamp de Firebase a Date
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

const editNews = (news: News) => {
  // Implementa tu lógica de edición aquí
  console.log("Editar noticia:", news);
};
</script>

<style scoped>
.card {
  margin-bottom: 1rem;
}

.card-image img {
  object-fit: cover;
}

.buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}
</style>
