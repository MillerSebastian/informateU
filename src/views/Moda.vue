<template>
  <div class="moda-page">
    <div class="content-wrapper">
      <h1 class="title">Moda</h1>
      <div class="add-news-button">
        <button class="button is-button-modal" @click="showModal = true">
          +
        </button>
      </div>

      <AddNewsModal
        :isActive="showModal"
        :closeModal="closeModal"
        category="moda"
      />

      <!-- Mensaje de depuración para verificar si hay datos -->
      <p v-if="newsList.length === 0" class="no-news-message">
        Cargando noticias... Si este mensaje persiste, es posible que no haya noticias disponibles.
      </p>

      <div class="moda-feed">
        <NewsCard
          v-for="news in newsList"
          :key="news.id"
          :news="news"
          category="moda"
          class="card-item"
        />
      </div>
    </div>
    
    <AppFooter class="page-footer" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getFirestore, collection, onSnapshot, query, orderBy } from "firebase/firestore";
import AddNewsModal from "@/components/AddNewsModal.vue";
import NewsCard from "@/components/NewsCards.vue";
import AppFooter from "@/components/AppFooter.vue";

const db = getFirestore();
const showModal = ref(false);
const newsList = ref<any[]>([]);

const closeModal = () => {
  showModal.value = false;
};

onMounted(() => {
  console.log("Componente montado, obteniendo datos...");
  try {
    // Intenta primero sin el orderBy para descartar problemas con índices
    const newsRef = collection(db, "moda");
    onSnapshot(newsRef, (snapshot) => {
      console.log("Datos recibidos de Firestore:", snapshot.docs.length, "documentos");
      if (snapshot.empty) {
        console.log("No hay documentos en la colección moda");
        return;
      }
      
      newsList.value = snapshot.docs.map((doc) => {
        const data = doc.data();
        console.log("Documento:", doc.id, data);
        return {
          id: doc.id,
          ...data,
        };
      });
    }, (error) => {
      console.error("Error al obtener noticias:", error);
    });
  } catch (error) {
    console.error("Error en onMounted:", error);
  }
});
</script>

<style scoped>
.moda-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  position: relative;
}

.content-wrapper {
  flex: 1;
  padding: 1rem;
  overflow-y: auto;
  padding-bottom: 4rem;
}

.title {
  margin-bottom: 1.5rem;
}

.add-news-button {
  margin-bottom: 1.5rem;
}

.is-button-modal {
  background-color: blueviolet;
  color: white;
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  font-size: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.moda-feed {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
}

/* Mensaje cuando no hay noticias */
.no-news-message {
  padding: 1rem;
  background-color: #f8f9fa;
  border-radius: 4px;
  text-align: center;
  margin: 1rem 0;
}

/* Asegurarse de que las tarjetas se muestren correctamente */
.card-item {
  width: 100%;
  margin-bottom: 1rem;
  display: block !important;
  visibility: visible !important;
  opacity: 1 !important;
}

/* Eliminamos el deep selector y aplicamos estilos directamente */
/* Esto es porque a veces el deep selector no funciona como se espera */

/* Estilos para el footer */
.page-footer {
  width: 100%;
  position: relative;
  bottom: 0;
  left: 0;
  z-index: 10;
}

/* Estilos globales necesarios */
:global(html), :global(body) {
  height: 100%;
  margin: 0;
  padding: 0;
  overflow-y: auto;
}
</style>