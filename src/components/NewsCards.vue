<template>
  <div
    class="news-card"
    :class="{ 'news-card--expanded': isExpanded }"
    @mouseenter="hover = true"
    @mouseleave="hover = false"
  >
    <div class="news-card__media">
      <div v-if="news.fileType === 'image'" class="news-card__image-container">
        <img
          :src="news.mediaUrl"
          alt="Imagen de la noticia"
          class="news-card__image"
        />
      </div>
      <div
        v-else-if="news.fileType === 'video'"
        class="news-card__video-container"
      >
        <video controls class="news-card__video">
          <source :src="news.mediaUrl" type="video/mp4" />
        </video>
      </div>
      <div class="news-card__category">{{ category }}</div>
    </div>

    <div class="news-card__content">
      <h3 class="news-card__title">{{ truncateText(news.title, 60) }}</h3>

      <div class="news-card__author">
        <div class="news-card__author-image">
          <img :src="authorProfileImage" alt="Imagen de perfil del autor" />
        </div>
        <div class="news-card__author-info">
          <span class="news-card__author-name"
            >@{{ truncateText(news.author, 20) }}</span
          >
          <time class="news-card__date" :datetime="news.timestamp">{{
            formattedDate
          }}</time>
        </div>
        <button
          class="news-card__profile-btn"
          @click="viewUserProfile"
          title="Ver perfil"
        >
          <i class="fas fa-user"></i>
        </button>
      </div>

      <div class="news-card__description">
        <p :class="{ 'news-card__description--clipped': !isExpanded }">
          {{ news.description }}
        </p>
        <button
          v-if="isDescriptionLong"
          class="news-card__toggle-btn"
          @click="isExpanded = !isExpanded"
        >
          {{ isExpanded ? "Mostrar menos" : "Leer más" }}
        </button>
      </div>

      <!-- Sistema de Likes -->
      <div class="news-card__likes">
        <button 
          class="news-card__like-btn"
          :class="{ 'news-card__like-btn--liked': isLiked }"
          @click="toggleLike"
          :disabled="!currentUser"
        >
          <i class="fas" :class="isLiked ? 'fa-heart' : 'fa-heart'"></i>
          <span>{{ likesCount }}</span>
        </button>
      </div>

      <!-- Sistema de Comentarios -->
      <div class="news-card__comments">
        <div class="news-card__comments-header">
          <h4>Comentarios ({{ comments.length }})</h4>
          <button 
            class="news-card__toggle-comments-btn"
            @click="showComments = !showComments"
          >
            {{ showComments ? 'Ocultar' : 'Mostrar' }} comentarios
          </button>
        </div>

        <div v-if="showComments" class="news-card__comments-section">
          <!-- Formulario de comentario -->
          <div v-if="currentUser" class="news-card__comment-form">
            <div class="news-card__comment-input-container">
              <img :src="currentUserProfileImage" alt="Tu perfil" class="news-card__comment-user-img" />
              <input
                v-model="newComment"
                type="text"
                placeholder="Escribe un comentario..."
                class="news-card__comment-input"
                @keyup.enter="addComment"
              />
              <button 
                @click="addComment"
                class="news-card__comment-btn"
                :disabled="!newComment.trim()"
              >
                <i class="fas fa-paper-plane"></i>
              </button>
            </div>
          </div>

          <!-- Lista de comentarios -->
          <div class="news-card__comments-list">
            <div 
              v-for="comment in comments" 
              :key="comment.id"
              class="news-card__comment"
            >
              <div class="news-card__comment-header">
                <img :src="comment.userProfileImage" alt="Perfil" class="news-card__comment-user-img" />
                <div class="news-card__comment-info">
                  <span class="news-card__comment-author">{{ comment.authorName }}</span>
                  <time class="news-card__comment-date">{{ formatCommentDate(comment.timestamp) }}</time>
                </div>
                <button 
                  v-if="canDeleteComment(comment)"
                  @click="deleteComment(comment.id)"
                  class="news-card__comment-delete-btn"
                  title="Eliminar comentario"
                >
                  <i class="fas fa-trash"></i>
                </button>
              </div>
              <p class="news-card__comment-text">{{ comment.text }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Botón de eliminar solo para el autor -->
      <div v-if="canDeleteNews" class="news-card__actions">
        <button class="news-card__delete-btn" @click="deleteNews(news.id)">
          <span class="news-card__delete-icon">
            <i class="fas fa-trash-alt"></i>
          </span>
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { doc, deleteDoc, getDoc, addDoc, collection, query, where, getDocs, updateDoc, onSnapshot, Timestamp, setDoc } from "firebase/firestore";
import { db } from "@/firebase";
import { Notyf } from "notyf";
import "notyf/notyf.min.css";
import { useRouter } from "vue-router";
import { getAuth } from "firebase/auth";

interface News {
  id: string;
  mediaUrl: string;
  title: string;
  author: string;
  description: string;
  perfilImg: string;
  timestamp: any;
  fileType: string;
  userId: string;
}

interface Comment {
  id: string;
  text: string;
  authorId: string;
  authorName: string;
  userProfileImage: string;
  timestamp: any;
}

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  city: string;
  documentType: string;
  birthDate: string;
  perfilImg?: string;
}

const props = defineProps<{
  news: News;
  category: string;
}>();

const emit = defineEmits(["newsDeleted"]);
const router = useRouter();
const auth = getAuth();

const users = ref<User[]>([]);
const hover = ref(false);
const isExpanded = ref(false);
const showComments = ref(false);
const newComment = ref("");
const comments = ref<Comment[]>([]);
const likesCount = ref(0);
const isLiked = ref(false);
const currentUser = ref<any>(null);
const currentUserProfileImage = ref("https://bulma.io/assets/images/placeholders/96x96.png");
const authorProfileImage = ref("https://bulma.io/assets/images/placeholders/96x96.png");
let notyf: Notyf;

// Determinar si el texto de la descripción es lo suficientemente largo para mostrar el botón
const isDescriptionLong = computed(() => {
  return props.news.description && props.news.description.length > 120;
});

// Verificar si el usuario actual puede eliminar la noticia
const canDeleteNews = computed(() => {
  return currentUser.value && props.news.userId === currentUser.value.uid;
});

// Función para truncar texto y evitar desbordamientos
const truncateText = (text: string, maxLength: number) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

// Función para navegar al perfil del usuario
const viewUserProfile = () => {
  if (props.news.userId) {
    router.push({
      name: "/ViewProfile",
      params: { userId: props.news.userId },
    });
  } else {
    notyf.error("No se encontró información del usuario");
  }
};

// Función para verificar si el usuario puede eliminar un comentario
const canDeleteComment = (comment: Comment) => {
  return currentUser.value && comment.authorId === currentUser.value.uid;
};

// Función para formatear fecha de comentarios
const formatCommentDate = (timestamp: any) => {
  if (!timestamp) return "";
  const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
  return date.toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
};

// Función para agregar comentario
const addComment = async () => {
  if (!newComment.value.trim() || !currentUser.value) return;

  try {
    const commentData = {
      text: newComment.value.trim(),
      authorId: currentUser.value.uid,
      authorName: currentUser.value.displayName || currentUser.value.email,
      userProfileImage: currentUserProfileImage.value,
      timestamp: Timestamp.now(),
      newsId: props.news.id,
      category: props.category
    };

    await addDoc(collection(db, "comments"), commentData);
    newComment.value = "";
    notyf.success("Comentario agregado exitosamente");
  } catch (error) {
    console.error("Error al agregar comentario:", error);
    notyf.error("Error al agregar el comentario");
  }
};

// Función para eliminar comentario
const deleteComment = async (commentId: string) => {
  try {
    await deleteDoc(doc(db, "comments", commentId));
    notyf.success("Comentario eliminado exitosamente");
  } catch (error) {
    console.error("Error al eliminar comentario:", error);
    notyf.error("Error al eliminar el comentario");
  }
};

// Función para manejar likes
const toggleLike = async () => {
  if (!currentUser.value) {
    notyf.error("Debes iniciar sesión para dar like");
    return;
  }

  try {
    // Crear un ID único para el like de este usuario en esta noticia
    const likeId = `${props.news.id}_${currentUser.value.uid}`;
    const likeRef = doc(db, "likes", likeId);
    const likeDoc = await getDoc(likeRef);

    if (likeDoc.exists()) {
      // Quitar like - eliminar el documento
      await deleteDoc(likeRef);
      isLiked.value = false;
      likesCount.value--;
      notyf.success("Like eliminado");
    } else {
      // Agregar like - crear el documento con ID único
      await setDoc(likeRef, {
        newsId: props.news.id,
        userId: currentUser.value.uid,
        category: props.category,
        timestamp: Timestamp.now()
      });
      isLiked.value = true;
      likesCount.value++;
      notyf.success("Like agregado");
    }
  } catch (error) {
    console.error("Error al manejar like:", error);
    notyf.error("Error al procesar el like");
  }
};

// Cargar comentarios
const loadComments = () => {
  const commentsQuery = query(
    collection(db, "comments"),
    where("newsId", "==", props.news.id),
    where("category", "==", props.category)
  );

  return onSnapshot(commentsQuery, (snapshot) => {
    comments.value = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Comment)).sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());
  });
};

// Cargar likes
const loadLikes = async () => {
  try {
    const likesQuery = query(
      collection(db, "likes"),
      where("newsId", "==", props.news.id)
    );
    const likesSnapshot = await getDocs(likesQuery);
    likesCount.value = likesSnapshot.size;

    // Verificar si el usuario actual dio like
    if (currentUser.value) {
      const likeId = `${props.news.id}_${currentUser.value.uid}`;
      const userLikeDoc = await getDoc(doc(db, "likes", likeId));
      isLiked.value = userLikeDoc.exists();
    }
  } catch (error) {
    console.error("Error al cargar likes:", error);
  }
};

onMounted(async () => {
  // Inicializar Notyf para notificaciones
  notyf = new Notyf({
    duration: 3000,
    position: { x: "right", y: "bottom" },
    types: [
      {
        type: "success",
        background: "#38c172",
        icon: {
          className: "fas fa-check-circle",
          tagName: "i",
          color: "white",
        },
      },
      {
        type: "error",
        background: "#e3342f",
        icon: {
          className: "fas fa-times-circle",
          tagName: "i",
          color: "white",
        },
      },
    ],
  });

  // Obtener usuario actual
  currentUser.value = auth.currentUser;
  
  // Escuchar cambios en la autenticación
  auth.onAuthStateChanged((user) => {
    currentUser.value = user;
    if (user) {
      loadCurrentUserProfile();
    }
  });

  // Obtener imagen de perfil del autor desde la colección users
  try {
    // Primero verificar si la noticia ya tiene una imagen de perfil
    if (props.news.perfilImg) {
      authorProfileImage.value = props.news.perfilImg;
    } else if (props.news.userId) {
      const userRef = doc(db, "users", props.news.userId);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData && userData.perfilImg) {
          authorProfileImage.value = userData.perfilImg;
        }
      }
    } else {
      // Para noticias existentes sin userId, intentar buscar por email
      try {
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", props.news.author));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          const userData = userDoc.data();
          if (userData && userData.perfilImg) {
            authorProfileImage.value = userData.perfilImg;
          }
        }
      } catch (error) {
        console.error("Error al buscar usuario por email:", error);
      }
    }
  } catch (error) {
    console.error("Error al obtener la imagen de perfil:", error);
  }

  // Cargar comentarios y likes
  loadComments();
  await loadLikes();
});

// Función para cargar perfil del usuario actual
const loadCurrentUserProfile = async () => {
  if (!currentUser.value) return;

  try {
    const userRef = doc(db, "users", currentUser.value.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      if (userData && userData.perfilImg) {
        currentUserProfileImage.value = userData.perfilImg;
      }
    }
  } catch (error) {
    console.error("Error al cargar perfil del usuario actual:", error);
  }
};

const formattedDate = computed(() => {
  const date = new Date(props.news.timestamp.seconds * 1000);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
});

const deleteNews = async (id: string) => {
  if (!canDeleteNews.value) {
    notyf.error("No tienes permisos para eliminar esta noticia");
    return;
  }

  try {
    // Eliminar la noticia
    await deleteDoc(doc(db, props.category, id));
    
    // Eliminar comentarios asociados
    const commentsQuery = query(
      collection(db, "comments"),
      where("newsId", "==", id),
      where("category", "==", props.category)
    );
    const commentsSnapshot = await getDocs(commentsQuery);
    const deleteCommentsPromises = commentsSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deleteCommentsPromises);
    
    // Eliminar likes asociados
    const likesQuery = query(
      collection(db, "likes"),
      where("newsId", "==", id)
    );
    const likesSnapshot = await getDocs(likesQuery);
    const deleteLikesPromises = likesSnapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deleteLikesPromises);
    
    notyf.success("Noticia eliminada exitosamente");
    emit("newsDeleted", id);
  } catch (error) {
    console.error("Error al eliminar noticia:", error);
    notyf.error("Error al eliminar esta noticia");
  }
};
</script>

<style scoped>
.news-card {
  position: relative;
  width: 100%;
  max-width: 400px;
  border-radius: 12px;
  overflow: hidden;
  background-color: #1a1a2e;
  color: #e6e6e6;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
  margin-bottom: 1.5rem;
}

.news-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.4);
}

.news-card__media {
  position: relative;
  height: 200px;
  overflow: hidden;
}

.news-card__image,
.news-card__video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.news-card:hover .news-card__image,
.news-card:hover .news-card__video {
  transform: scale(1.05);
}

.news-card__category {
  position: absolute;
  top: 12px;
  right: 12px;
  background-color: rgba(255, 107, 107, 0.85);
  color: #fff;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  font-weight: 600;
}

.news-card__content {
  padding: 1.25rem;
}

.news-card__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  line-height: 1.3;
  color: #ffffff;
  word-wrap: break-word;
  overflow-wrap: break-word;
  white-space: normal;
}

.news-card__author {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.news-card__author-image {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 0.75rem;
  border: 2px solid #16213e;
  flex-shrink: 0;
}

.news-card__author-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.news-card__author-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.news-card__author-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: #b8c1ec;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-card__date {
  font-size: 0.75rem;
  color: #a7abc5;
}

.news-card__description {
  color: #d1d1e0;
  font-size: 0.9375rem;
  line-height: 1.5;
  margin-bottom: 1rem;
  word-wrap: break-word;
  overflow-wrap: break-word;
}

.news-card__description--clipped {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: 4.5em;
}

.news-card__toggle-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  font-weight: 600;
  font-size: 0.875rem;
  margin-top: 0.5rem;
  padding: 4px 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: block;
}

.news-card__toggle-btn:hover {
  color: #ff9797;
  text-decoration: underline;
}

/* Sistema de Likes */
.news-card__likes {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #2a2a3e;
}

.news-card__like-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid #4a4a6a;
  border-radius: 20px;
  padding: 0.5rem 1rem;
  color: #a7abc5;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.news-card__like-btn:hover:not(:disabled) {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.news-card__like-btn--liked {
  background-color: #ff6b6b;
  border-color: #ff6b6b;
  color: white;
}

.news-card__like-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.news-card__like-btn i {
  font-size: 1rem;
}

/* Sistema de Comentarios */
.news-card__comments {
  margin-bottom: 1rem;
}

.news-card__comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.news-card__comments-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0;
}

.news-card__toggle-comments-btn {
  background: none;
  border: none;
  color: #4a9eff;
  font-size: 0.875rem;
  cursor: pointer;
  transition: color 0.2s ease;
}

.news-card__toggle-comments-btn:hover {
  color: #6bb6ff;
  text-decoration: underline;
}

.news-card__comments-section {
  border-top: 1px solid #2a2a3e;
  padding-top: 1rem;
}

.news-card__comment-form {
  margin-bottom: 1rem;
}

.news-card__comment-input-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background-color: #2a2a3e;
  border-radius: 25px;
  padding: 0.5rem 1rem;
}

.news-card__comment-user-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.news-card__comment-input {
  flex: 1;
  background: none;
  border: none;
  color: #ffffff;
  font-size: 0.875rem;
  outline: none;
}

.news-card__comment-input::placeholder {
  color: #a7abc5;
}

.news-card__comment-btn {
  background: none;
  border: none;
  color: #4a9eff;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.news-card__comment-btn:hover:not(:disabled) {
  background-color: #4a9eff;
  color: white;
}

.news-card__comment-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.news-card__comments-list {
  max-height: 300px;
  overflow-y: auto;
}

.news-card__comment {
  margin-bottom: 1rem;
  padding: 0.75rem;
  background-color: #2a2a3e;
  border-radius: 8px;
}

.news-card__comment-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.news-card__comment-info {
  flex: 1;
  min-width: 0;
}

.news-card__comment-author {
  font-size: 0.875rem;
  font-weight: 600;
  color: #b8c1ec;
  display: block;
}

.news-card__comment-date {
  font-size: 0.75rem;
  color: #a7abc5;
}

.news-card__comment-delete-btn {
  background: none;
  border: none;
  color: #ff6b6b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
  opacity: 0.7;
}

.news-card__comment-delete-btn:hover {
  background-color: #ff6b6b;
  color: white;
  opacity: 1;
}

.news-card__comment-text {
  color: #d1d1e0;
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0;
  word-wrap: break-word;
}

.news-card__actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 1rem;
}

.news-card__delete-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #16213e;
  color: #ff6b6b;
  border: 1px solid #ff6b6b;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.news-card__delete-btn:hover {
  background-color: #ff6b6b;
  color: #16213e;
}

.news-card--expanded {
  max-width: 500px;
}

.news-card__author {
  display: flex;
  align-items: center;
}

.news-card__profile-btn {
  margin-left: 10px;
  background-color: #3273dc;
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background-color 0.3s;
}

.news-card__profile-btn:hover {
  background-color: #2366d1;
}

.news-card--expanded .news-card__description--clipped {
  max-height: none;
  -webkit-line-clamp: initial;
}

/* Scrollbar personalizado para comentarios */
.news-card__comments-list::-webkit-scrollbar {
  width: 6px;
}

.news-card__comments-list::-webkit-scrollbar-track {
  background: #1a1a2e;
  border-radius: 3px;
}

.news-card__comments-list::-webkit-scrollbar-thumb {
  background: #4a4a6a;
  border-radius: 3px;
}

.news-card__comments-list::-webkit-scrollbar-thumb:hover {
  background: #6a6a8a;
}

@media (max-width: 768px) {
  .news-card {
    max-width: 100%;
  }
  
  .news-card__comment-input-container {
    padding: 0.75rem;
  }
  
  .news-card__comment {
    padding: 1rem;
  }
}
</style>
