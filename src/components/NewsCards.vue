<template>
  <div class="card">
    <div class="card-image">
      <figure class="image is-4by3">
        <img :src="news.imageUrl" alt="Placeholder image" />
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
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from "vue";

export default defineComponent({
  name: "NewsCard",
  props: {
    news: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const formattedDate = computed(() => {
      const date = new Date(props.news.timestamp);
      return date.toLocaleString();
    });

    return {
      formattedDate,
    };
  },
});
</script>

<style scoped>
/* Añade tus estilos específicos para el componente NewsCard aquí */
</style>
