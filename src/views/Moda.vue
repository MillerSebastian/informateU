<template>
  <div class="Moda-page">
    <h1 class="title">Moda</h1>

    <div class="add-news-button">
      <button class="button is-primary" @click="showModal = true">+</button>
    </div>

    <AddNewsModal :isActive="showModal" :closeModal="closeModal" />

    <div class="news-feed">
      <NewsCard v-for="news in newsList" :key="news" :news="news" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import AddNewsModal from "@/components/AddNewsModal.vue";
import NewsCard from "@/components/NewsCards.vue";

export default defineComponent({
  name: "Moda",
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
        //@ts-ignore
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
.Moda-page {
  padding: 1rem;
}

.add-Moda-button {
  margin-bottom: 1rem;
}

.Moda-feed {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>
