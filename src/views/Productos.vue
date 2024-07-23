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
        <img src="/americana logo.png" alt="Logo" class="logo-image" />
        <h1 class="title">
          Aquí puedes publicar tus productos o emprendimientos que tengas en
          mente
        </h1>
      </div>
      <div v-else key="products" class="products full-screen">
        <div class="product-header">
          <h1 class="title">Productos</h1>
          <button
            class="button"
            style="background-color: yellow; color: black"
            @click="showModal = true"
          >
            Crear Producto
          </button>
        </div>
        <AddProductModal :isActive="showModal" :closeModal="closeModal" />

        <div class="product-feed">
          <ProductCard
            v-for="product in productList"
            :key="product.id"
            :product="product"
          />
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from "vue";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import AddProductModal from "@/components/AddProductModal.vue";
import ProductCard from "@/components/ProductCard.vue";

export default defineComponent({
  name: "Productos",
  components: {
    AddProductModal,
    ProductCard,
  },
  setup() {
    const db = getFirestore();
    const showModal = ref(false);
    const productList = ref([]);
    const step = ref(0);

    const closeModal = () => {
      showModal.value = false;
    };

    const nextStep = () => {
      if (step.value < 2) {
        step.value += 1;
      }
    };

    onMounted(() => {
      const q = collection(db, "products");
      onSnapshot(q, (snapshot) => {
        //@ts-ignore
        productList.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      });
    });

    return {
      showModal,
      closeModal,
      productList,
      step,
      nextStep,
    };
  },
});
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
