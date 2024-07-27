<template>
  <div class="sport-page">
    <h1 class="title">Deportes</h1>
    <div class="add-news-button">
      <button class="button is-button-modal" @click="showModal = true">
        +
      </button>
    </div>

    <AddNewsModal
      :isActive="showModal"
      :closeModal="closeModal"
      category="sport"
    />

    <div class="sport-feed">
      <NewsCard
        v-for="news in newsList"
        :key="news.id"
        :news="news"
        category="sport"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import AddNewsModal from "@/components/AddNewsModal.vue";
import NewsCard from "@/components/NewsCards.vue";

const db = getFirestore();
const showModal = ref(false);
const newsList = ref<any[]>([]);

const closeModal = () => {
  showModal.value = false;
};
onMounted(() => {
  const q = collection(db, "sport");
  onSnapshot(q, (snapshot) => {
    newsList.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });
});
</script>

<style scoped>
.sport-page {
  padding: 1rem;
}

.add-news-button {
  margin-bottom: 1rem;
}

.sport-feed {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.is-button-modal {
  background-color: green;
  color: black;
}
</style>
