<template>
    <div class="container">
      <div class="columns">
        <!-- Profile Section -->
        <div class="column is-one-third">
          <div class="profile-section">
            <figure class="image is-128x128 is-centered">
              <img
                class="is-rounded"
                :src="perfilImg"
                alt="Imagen de perfil"
              />
            </figure>
            
            <div class="user-status-container is-flex is-justify-content-center is-align-items-center mt-3">
              <div 
                class="user-status-indicator mr-2" 
                :class="{
                  'is-online': isUserOnline,
                  'is-offline': !isUserOnline
                }">
              </div>
              <span class="has-text-weight-bold">
                {{ isUserOnline ? 'En línea' : 'Desconectado' }}
              </span>
            </div>
          </div>
          <div class="form-section">
            <div class="columns">
              <div class="column">
                <div class="field">
                  <label class="label has-text-white">Username</label>
                  <div class="control has-icons-left">
                    <input
                      class="input is-static"
                      type="text"
                      :value="username"
                      readonly
                    />
                    <span class="icon is-small is-left">
                      <i class="fas fa-user"></i>
                    </span>
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label class="label has-text-white">Email</label>
                  <div class="control has-icons-left">
                    <input
                      class="input is-static"
                      type="email"
                      :value="email"
                      readonly
                    />
                    <span class="icon is-small is-left">
                      <i class="fas fa-envelope"></i>
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div class="columns">
              <div class="column">
                <div class="field">
                  <label class="label has-text-white">Ciudad</label>
                  <div class="control">
                    <input
                      class="input is-static"
                      :value="city"
                      readonly
                    />
                  </div>
                </div>
              </div>
              <div class="column">
                <div class="field">
                  <label class="label has-text-white">Programa</label>
                  <div class="control">
                    <input
                      class="input is-static"
                      :value="program"
                      readonly
                    />
                  </div>
                </div>
              </div>
            </div>
            <div class="field">
              <label class="label has-text-white">Descripción</label>
              <div class="control">
                <textarea
                  class="textarea is-static"
                  :value="description"
                  readonly
                ></textarea>
              </div>
            </div>
          </div>
        </div>
    
        <!-- Noticias del Usuario -->
        <div class="column is-two-thirds">
          <div class="section-header mb-4">
            <h2 class="title is-4">Noticias de {{ username }}</h2>
            <p class="subtitle is-6">Publicaciones compartidas</p>
          </div>
    
          <div v-if="isLoadingNews" class="has-text-centered my-5">
            <div class="spinner-large"></div>
            <p class="mt-3">Cargando noticias...</p>
          </div>
    
          <div
            v-else-if="userNews.length === 0"
            class="no-news-message has-text-centered"
            style="background-color: hsl(220deg 13.04% 9.02%)"
          >
            <i class="fas fa-newspaper fa-3x mb-3"></i>
            <p>Este usuario no ha publicado ninguna noticia todavía.</p>
          </div>
    
          <div v-else class="columns is-multiline">
            <div
              class="column is-one-third"
              v-for="news in userNews"
              :key="news.id"
            >
              <div class="card">
                <div class="card-image">
                  <figure class="image is-4by3">
                    <img
                      v-if="news.fileType === 'image'"
                      :src="news.mediaUrl"
                      alt="Imagen de noticia"
                    />
                    <video v-else-if="news.fileType === 'video'" controls>
                      <source :src="news.mediaUrl" type="video/mp4" />
                    </video>
                    <div v-else class="no-media-placeholder">
                      <i class="fas fa-image fa-3x"></i>
                    </div>
                  </figure>
                </div>
                <div class="card-content">
                  <div class="media">
                    <div class="media-content">
                      <p class="title is-4">{{ news.title }}</p>
                      <p class="subtitle is-6">
                        <span
                          class="tag"
                          :class="getCategoryClass(news.category)"
                        >
                          {{ getCategoryName(news.category) }}
                        </span>
                      </p>
                    </div>
                  </div>
                  <div class="content">
                    {{ news.description }}
                    <br />
                    <time
                      :datetime="formatDateTime(news.timestamp)"
                      class="is-size-7 has-text-grey"
                    >
                      {{ formatDate(news.timestamp) }}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, onMounted } from "vue";
  import { useRouter, useRoute } from "vue-router";
  import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    Timestamp,
  } from "firebase/firestore";
  import { db } from "../firebase";
  import { Notyf } from "notyf";
  import "notyf/notyf.min.css";
  
  interface News {
    id: string;
    mediaUrl: string;
    title: string;
    author: string;
    description: string;
    timestamp: any;
    category: string;
    fileType: string;
  }
  
  const router = useRouter();
  const route = useRoute();
  const profileImage = ref("/default-profile.png");
  const isLoadingNews = ref(true);
  const username = ref("");
  const email = ref("");
  const city = ref("");
  const program = ref("");
  const description = ref("");
  const userNews = ref<News[]>([]);
  const perfilImg = ref(profileImage.value);
  const isUserOnline = ref(false);
  let notyf: Notyf;
  
  // Function declarations BEFORE they are used in onMounted
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Fecha desconocida";
  
    const date =
      timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  const formatDateTime = (timestamp: any) => {
    if (!timestamp) return "";
  
    const date =
      timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  
    return date.toISOString();
  };
  
  const getCategoryName = (category: string) => {
    const categories = {
      news: "Noticias",
      moda: "Moda",
      sport: "Deportes",
      gaming: "Gaming",
    };
    return categories[category as keyof typeof categories] || category;
  };
  
  const getCategoryClass = (category: string) => {
    const classes = {
      news: "is-info",
      moda: "is-primary",
      sport: "is-success",
      gaming: "is-warning",
    };
    return classes[category as keyof typeof classes] || "is-light";
  };
  
  const fetchUserNews = async () => {
    const emailValue = email.value;
    
    console.log("Buscando noticias para:", emailValue);
  
    if (!emailValue) {
      isLoadingNews.value = false;
      return;
    }
  
    isLoadingNews.value = true;
  
    try {
      const categories = ["news", "moda", "sport", "gaming"];
      let newsData: News[] = [];
  
      for (const category of categories) {
        console.log(`Consultando colección ${category} con author=${emailValue}`);
        
        const q = query(
          collection(db, category),
          where("author", "==", emailValue)
        );
  
        const querySnapshot = await getDocs(q);
        console.log(`Resultados en ${category}:`, querySnapshot.size);
        
        querySnapshot.forEach((doc) => {
          newsData.push({
            id: doc.id,
            ...(doc.data() as News),
            category: category,
          });
        });
      }
  
      console.log("Total de noticias encontradas:", newsData.length);
      
      // Ordenar por fecha (más reciente primero)
      userNews.value = newsData.sort((a, b) => {
        const timeA = a.timestamp?.toMillis ? a.timestamp?.toMillis() : 0;
        const timeB = b.timestamp?.toMillis ? b.timestamp?.toMillis() : 0;
        return timeB - timeA;
      });
    } catch (error) {
      console.error("Error al recuperar las noticias del usuario:", error);
      notyf?.error("Error al cargar las noticias");
    } finally {
      isLoadingNews.value = false;
    }
  };
  
  const fetchUserProfile = async () => {
    const userId = route.params.userId as string;
  
    if (!userId) {
      router.push("/");
      return;
    }
  
    try {
      const userDoc = doc(getFirestore(), "users", userId);
      const docSnap = await getDoc(userDoc);
  
      if (docSnap.exists()) {
        const data = docSnap.data();
        username.value = data.username || "";
        email.value = data.email || "";
        city.value = data.city || "";
        program.value = data.program || "";
        description.value = data.description || "";
        perfilImg.value = data.perfilImg || profileImage.value;
        
        // Ahora que tenemos el username, buscamos las noticias
        await fetchUserNews();
      } else {
        notyf?.error("Usuario no encontrado");
        router.push("/");
      }
    } catch (error) {
      console.error("Error al obtener los datos del perfil:", error);
      notyf?.error("Error al cargar los datos del perfil");
    }
  };
  
  // Initialize Notyf first in onMounted
  onMounted(async () => {
    notyf = new Notyf({
      duration: 3000,
      position: { x: "right", y: "top" },
      types: [
        {
          type: "success",
          background: "green",
          icon: {
            className: "fas fa-check-circle",
            tagName: "i",
          },
        },
        {
          type: "error",
          background: "red",
          icon: {
            className: "fas fa-times-circle",
            tagName: "i",
          },
        },
      ],
    });
    
    await fetchUserProfile();
    // Ya no llamamos a fetchUserNews aquí, se llama dentro de fetchUserProfile
    
    // TODO: Implement actual online status tracking
    // This is a placeholder and should be replaced with actual online status logic
    isUserOnline.value = false;
  });
  </script>
  
  <style scoped>
  .container {
    margin-top: 2rem;
    margin-bottom: 2rem;
  }
  
  .profile-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 2rem;
  }
  
  .image.is-centered {
    margin: 0 auto;
    margin-bottom: 1rem;
  }
  
  .card {
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    margin-bottom: 1rem;
  }
  
  .card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
  
  .card-image img,
  .card-image video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .card-content {
    flex-grow: 1;
  }
  
  .no-media-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: #f5f5f5;
    color: #aaa;
  }
  
  .no-news-message {
    padding: 3rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    color: #666;
  }
  
  .input.is-static, .textarea.is-static {
    background-color: transparent;
    border-color: transparent;
    color: #efefef;
    box-shadow: none;
    padding-left: 0;
    padding-right: 0;
  }
  
  .textarea.is-static {
    resize: none;
  }
  
  /* Estilos para el spinner de carga */
  .spinner-large {
    display: inline-block;
    width: 3rem;
    height: 3rem;
    border: 3px solid rgba(0, 0, 0, 0.1);
    border-left-color: #ffe08a;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  
  .tag {
    font-size: 0.75rem;
    margin-top: 0.5rem;
  }
  
  .section-header {
    border-bottom: 2px solid #f5f5f5;
    padding-bottom: 1rem;
  }
  
  .user-status-indicator {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }
  
  .is-online {
    background-color: #48c774;
  }
  
  .is-offline {
    background-color: #f14668;
  }
  
  .user-status-container {
    margin-bottom: 1rem;
  }
  </style>