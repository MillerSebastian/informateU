<template>
  <div id="app">
    <Navbar />
    <router-view />
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import Navbar from "./components/Navbar.vue";
import { auth } from "./firebase";

export default defineComponent({
  name: "App",
  components: {
    Navbar,
  },
  mounted() {
    if (!auth.currentUser) {
      this.$router.push("/");
    }
  },
});
</script>
