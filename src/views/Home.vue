<template>
  <div class="main-container">
    <h1 class="title">Bienvenido a la Página Principal</h1>
    <div class="columns is-multiline">
      <div class="column is-one-third" v-for="news in newsList" :key="news.id">
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
            </figure>
          </div>
          <div class="card-content">
            <div class="media">
              <div class="media-content">
                <p class="title is-4">{{ news.title }}</p>
                <p class="subtitle is-6">{{ news.author }}</p>
              </div>
            </div>
            <div class="content">
              {{ news.description }}
              <br />
              <!-- <time :datetime="news.timestamp.toDate()">
                {{ formatDate(news.timestamp.toDate()) }}
              </time> -->
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

export default defineComponent({
  name: "Home",
  setup() {
    const newsList = ref<any[]>([]);

    const fetchNews = async () => {
      try {
        const categories = ["news", "moda", "sport", "gaming"];
        let newsData: any[] = [];
        for (const category of categories) {
          const querySnapshot = await getDocs(collection(db, category));
          querySnapshot.forEach((doc) => {
            newsData.push({ id: doc.id, ...doc.data(), category });
          });
        }
        newsList.value = newsData;
      } catch (error) {
        console.error("Error al recuperar las noticias:", error);
      }
    };

    const formatDate = (date: Date) => {
      return date.toLocaleDateString("es-ES", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    onMounted(() => {
      fetchNews();
    });

    return {
      newsList,
      formatDate,
    };
  },
});
</script>

<style>
/* Aseguramos que el html y body tengan altura completa y permitan scroll */
html, body {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-y: auto !important;
}

#app {
  min-height: 100%;
  position: relative;
}
</style>

<style scoped>
.main-container {
  margin-top: 2rem;
  margin-bottom: 2rem;
  padding: 0 1.5rem;
  /* Permitimos que el contenedor principal tenga scroll si es necesario */
  overflow-y: auto;
}

.card {
  margin-bottom: 1.5rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-image img,
.card-image video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Aseguramos que las columnas tengan altura apropiada */
.columns {
  width: 100%;
}

.column {
  display: flex;
}
</style>