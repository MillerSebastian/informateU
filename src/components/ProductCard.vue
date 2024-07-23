<template>
  <div class="box">
    <article class="media">
      <div class="media-left">
        <figure class="image is-64x64">
          <img
            src="https://bulma.io/assets/images/placeholders/128x128.png"
            alt="Image"
          />
        </figure>
      </div>
      <div class="media-content">
        <div class="content">
          <p>
            <strong>{{ product.name }}</strong>
            <br />
            {{ product.description }}
          </p>
        </div>
      </div>
    </article>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

export default defineComponent({
  name: "ProductCard",
  props: {
    product: {
      type: Object as PropType<{ name: string; description: string }>,
      required: true,
    },
  },
});
</script>

<style scoped>
.box {
  background-color: #f9f9f9;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  margin: 10px;
  width: 200px;
  text-align: left;
}
</style>
