<template>
  <div class="sport-page">
    <h1 class="title">Sport</h1>

    <div class="add-news-button">
      <button class="button is-primary" @click="showModal = true">+</button>
    </div>

    <AddNewsModal :isActive="showModal" :closeModal="closeModal" />

    <div class="news-feed">
      <NewsCard v-for="news in newsList" :key="news.id" :news="news" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import AddNewsModal from "@/components/AddNewsModal.vue";
import NewsCard from "@/components/NewsCards.vue";

export default defineComponent({
  name: "Sport",
  components: {
    AddNewsModal,
    NewsCard,
  },
  setup() {
    const db = getFirestore();
    const showModal = ref(false);
    const newsList = ref([]);

    const closeModal = () => {
      showModal.value = false;
    };

    onMounted(() => {
      const q = collection(db, "news");
      onSnapshot(q, (snapshot) => {
        newsList.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      });
    });

    return {
      showModal,
      closeModal,
      newsList,
    };
  },
});
</script>

<style scoped>
.sport-page {
  padding: 1rem;
}

.add-sport-button {
  margin-bottom: 1rem;
}

.sport-feed {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>
