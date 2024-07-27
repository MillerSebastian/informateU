<template>
  <div class="product-page">
    <transition name="fade" mode="out-in">
      <div
        v-if="step === 0"
        key="welcome"
        class="message full-screen-message"
        @click="nextStep"
      >
        <h1 class="title">
          Bienvenido a Informate<span style="color: yellow">Ü</span> productos
          <span style="color: yellow">asociado por la</span> Universidad
          <span style="color: blue">AMERICANA</span>
        </h1>
      </div>
      <div
        v-else-if="step === 1"
        key="intro"
        class="message full-screen-message"
        @click="nextStep"
      >
        <img src="/Logo americana 2.png" alt="Logo" class="logo-image" />
        <h1 class="title">
          Aquí puedes publicar tus productos o emprendimientos que tengas en
          mente
        </h1>
      </div>
      <div v-else key="products" class="products full-screen">
        <div class="moda-page">
          <h1 class="title">Productos</h1>
          <div class="add-news-button">
            <button class="button is-button-modal" @click="showModal = true">
              +
            </button>
          </div>

          <AddProductModal
            :isActive="showModal"
            :closeModal="closeModal"
            category="product"
            @productAdded="fetchProducts"
          />

          <div class="moda-feed">
            <ProductCard
              v-for="news in newsList"
              :key="news.id"
              :news="news"
              category="product"
            />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import AddProductModal from "@/components/AddProductModal.vue";
import ProductCard from "@/components/ProductCard.vue";

const db = getFirestore();
const showModal = ref(false);
const newsList = ref<any[]>([]);
const step = ref(0);

const closeModal = () => {
  showModal.value = false;
};

const nextStep = () => {
  if (step.value < 2) {
    step.value += 1;
  }
};

const fetchProducts = () => {
  const q = collection(db, "products");
  onSnapshot(q, (snapshot) => {
    newsList.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    console.log("Fetched products: ", newsList.value); // Log for debugging
  });
};

onMounted(fetchProducts);
</script>

<style scoped>
.product-page {
  padding: 1rem;
}

.product-feed {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 100px;
}

.full-screen-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  text-align: center;
}

.logo-image {
  display: block;
  margin-bottom: 20px;
  max-width: 40%;
  height: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}
</style>
