<template>
    <footer class="footer-container">
      <div class="footer-content">
        <div class="footer-section company-info">
          <h3>Nuestra Empresa</h3>
          <p><strong>Dirección:</strong> Calle Principal #123, Ciudad Ejemplo, País</p>
          <p><strong>Teléfono:</strong> +57 300 123 4567 / +57 310 987 6543</p>
          <p><strong>Email:</strong> contacto@tuempresa.com</p>
        </div>
  
        <div class="footer-section developers">
          <h3>Desarrolladores</h3>
          <div class="developer-cards">
            <div class="developer-card">
              <h4>Luis Orozco</h4>
              <p>Frontend Developer</p>
              <p>Email: luis.orozco@tuempresa.com</p>
              <p>Tel: +57 300 111 2222</p>
            </div>
            <div class="developer-card">
              <h4>Sebastian Rodelo</h4>
              <p>Backend Developer</p>
              <p>Email: sebastian.rodelo@tuempresa.com</p>
              <p>Tel: +57 300 333 4444</p>
            </div>
          </div>
        </div>
      </div>
  
      <div class="footer-bottom">
        <p>© {{ currentYear }} Tu Empresa. Todos los derechos reservados.</p>
        <p>Desarrollado con ❤️ por Luis Orozco y Sebastian Rodelo</p>
      </div>
    </footer>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  
  // Obtener el año actual para los derechos de autor
  const currentYear = computed(() => new Date().getFullYear());
  </script>
  
  <style scoped>
  .footer-container {
    background-color: #333;
    color: #fff;
    padding: 2rem 1rem;
    width: 100%;
    margin-top: 2rem;
  }
  
  .footer-content {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-around;
    max-width: 1200px;
    margin: 0 auto;
    gap: 2rem;
  }
  
  .footer-section {
    flex: 1;
    min-width: 300px;
  }
  
  .footer-section h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: #f8f8f8;
    border-bottom: 2px solid #8a2be2; /* Blueviolet, para mantener coherencia con tu diseño */
    padding-bottom: 0.5rem;
  }
  
  .developer-cards {
    display: flex;
    flex-wrap: wrap;
    gap: 1.5rem;
  }
  
  .developer-card {
    background-color: #444;
    padding: 1rem;
    border-radius: 8px;
    flex: 1;
    min-width: 200px;
  }
  
  .developer-card h4 {
    color: #8a2be2; /* Blueviolet */
    margin-bottom: 0.5rem;
  }
  
  .footer-bottom {
    text-align: center;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }
  
  /* Responsive design */
  @media (max-width: 768px) {
    .footer-content {
      flex-direction: column;
    }
    
    .footer-section {
      margin-bottom: 1.5rem;
    }
  }
  </style>