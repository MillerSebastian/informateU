<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from "vue";
import {
  collection,
  query,
  where,
  onSnapshot,
  Timestamp,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, auth } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";

// Interfaces para tipos de notificaciones
interface NewsNotification {
  id: string;
  title: string;
  author: string;
  category: string;
  timestamp: Timestamp;
  type: "news";
}

interface MessageNotification {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: Timestamp;
  type: "message";
}
const emit = defineEmits(["notification-count"]);

type Notification = NewsNotification | MessageNotification;

// Estado reactivo para notificaciones
const notifications = ref<Notification[]>([]);
const unreadCount = ref(0);
const showEmptyState = ref(true);
const isAuthenticated = ref(false);
const isLoading = ref(false);

// Array para almacenar funciones de desuscripción
const unsubscribes: (() => void)[] = [];

// Configurar notificaciones de noticias
const setupNewsNotifications = (userId: string) => {
  const newsQuery = query(
    collection(db, "news"),
    orderBy("timestamp", "desc"),
    limit(10) // Limitar a las 10 noticias más recientes
  );

  const newsUnsubscribe = onSnapshot(
    newsQuery,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const newsData = change.doc.data();
          const newNotification: NewsNotification = {
            id: change.doc.id,
            title: newsData.title,
            author: newsData.author,
            category: newsData.category,
            timestamp: newsData.timestamp,
            type: "news",
          };

          // Prevenir duplicados
          if (!notifications.value.some((n) => n.id === newNotification.id)) {
            notifications.value.push(newNotification);
            unreadCount.value++;
            showEmptyState.value = false;
          }
        }
      });
    },
    (error) => {
      console.error("Error en notificaciones de noticias:", error);
      isLoading.value = false;
    }
  );

  return newsUnsubscribe;
};

// Configurar notificaciones de mensajes
const setupMessageNotifications = (userId: string) => {
  const messagesQuery = query(
    collection(db, "messages"),
    where("receiverId", "==", userId),
    where("read", "==", false),
    orderBy("timestamp", "desc"),
    limit(10) // Limitar a los 10 mensajes más recientes
  );

  const messagesUnsubscribe = onSnapshot(
    messagesQuery,
    (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === "added") {
          const messageData = change.doc.data();
          const newNotification: MessageNotification = {
            id: change.doc.id,
            senderId: messageData.senderId,
            senderName: messageData.author,
            text: messageData.text,
            timestamp: messageData.timestamp,
            type: "message",
          };

          // Prevenir duplicados
          if (!notifications.value.some((n) => n.id === newNotification.id)) {
            notifications.value.push(newNotification);
            unreadCount.value++;
            showEmptyState.value = false;
          }
        }
      });
    },
    (error) => {
      console.error("Error en notificaciones de mensajes:", error);
      isLoading.value = false;
    }
  );

  return messagesUnsubscribe;
};

// Configurar todas las notificaciones
const setupNotifications = () => {
  // Limpiar listeners anteriores
  unsubscribes.forEach((unsub) => unsub());
  unsubscribes.length = 0;

  const user = auth.currentUser;
  if (!user) {
    console.log("No hay usuario autenticado");
    isAuthenticated.value = false;
    showEmptyState.value = true;
    return;
  }

  isLoading.value = true;
  isAuthenticated.value = true;

  // Restablecer estado de notificaciones
  notifications.value = [];
  unreadCount.value = 0;
  showEmptyState.value = true;

  // Configurar listeners de notificaciones
  const newsUnsub = setupNewsNotifications(user.uid);
  const messagesUnsub = setupMessageNotifications(user.uid);

  // Guardar funciones de desuscripción
  unsubscribes.push(newsUnsub, messagesUnsub);

  isLoading.value = false;
};

// Formatear timestamp a fecha legible
const formatTimestamp = (timestamp: Timestamp): string => {
  const date = timestamp.toDate();
  return date.toLocaleString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

// defineExpose({
//   clearNotifications
// });

watch(unreadCount, (newCount) => {
  emit("notification-count", newCount);
});
// Limpiar notificaciones
const clearNotifications = () => {
  notifications.value = [];
  unreadCount.value = 0;
  showEmptyState.value = true;
};

// Notificaciones ordenadas por timestamp
const sortedNotifications = computed(() => {
  return notifications.value.sort(
    (a, b) => b.timestamp.seconds - a.timestamp.seconds
  );
});

// Listener de estado de autenticación
const authUnsubscribe = onAuthStateChanged(auth, (user) => {
  if (user) {
    setupNotifications();
  } else {
    notifications.value = [];
    unreadCount.value = 0;
    showEmptyState.value = true;
    isAuthenticated.value = false;
  }
});

// Hooks del ciclo de vida
onMounted(() => {
  if (auth.currentUser) {
    setupNotifications();
  }
});

// Limpiar listeners al desmontar
onUnmounted(() => {
  unsubscribes.forEach((unsub) => unsub());
  authUnsubscribe();
});
</script>

<template>
  <div class="notifications-container">
    <!-- Indicador de carga -->
    <div v-if="isLoading" class="loading-spinner">
      Cargando notificaciones...
    </div>

    <!-- Mensaje de autenticación -->
    <div v-if="!isAuthenticated" class="auth-warning">
      <p>Por favor, inicia sesión para ver notificaciones</p>
    </div>

    <!-- Contenedor de notificaciones -->
    <template v-else>
      <!-- Contador de notificaciones no leídas -->
      <div v-if="unreadCount > 0" class="notification-badge">
        {{ unreadCount }}
      </div>

      <div class="notifications-list">
        <!-- Estado vacío -->
        <div v-if="showEmptyState" class="empty-state">
          <p>No hay notificaciones nuevas</p>
        </div>

        <!-- Lista de notificaciones -->
        <div
          v-else
          v-for="notification in sortedNotifications"
          :key="notification.id"
          class="notification"
        >
          <!-- Notificación de noticias -->
          <template v-if="notification.type === 'news'">
            <div class="notification-header">
              <span class="notification-title">Nueva Noticia</span>
              <span class="notification-time">
                {{ formatTimestamp(notification.timestamp) }}
              </span>
            </div>
            <div class="notification-content">
              <p>
                <strong>{{ notification.author }}</strong> publicó una noticia
                en <strong>{{ notification.category }}</strong
                >:
                {{ notification.title }}
              </p>
            </div>
          </template>

          <!-- Notificación de mensajes -->
          <template v-else-if="notification.type === 'message'">
            <div class="notification-header">
              <span class="notification-title">Nuevo Mensaje</span>
              <span class="notification-time">
                {{ formatTimestamp(notification.timestamp) }}
              </span>
            </div>
            <div class="notification-content">
              <p>
                <strong>{{ notification.senderName }}</strong> te envió un
                mensaje:
                {{ notification.text }}
              </p>
            </div>
          </template>
        </div>
      </div>

      <!-- Botón de limpiar notificaciones -->
      <div v-if="!showEmptyState" class="notifications-actions">
        <button @click="clearNotifications" class="clear-notifications-btn">
          Limpiar Notificaciones
        </button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.notifications-container {
  position: relative;
  width: 100%;
  max-height: 400px;
  overflow-y: auto;
}

.notification-badge {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: red;
  color: white;
  border-radius: 50%;
  padding: 4px 8px;
  font-size: 12px;
  z-index: 10;
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #333;
  border-radius: 8px;
  background-color: #1a1a1a;
}

.empty-state {
  text-align: center;
  padding: 20px;
  color: #888;
}

.notification {
  padding: 10px;
  border-bottom: 1px solid #333;
  background-color: #1a1a1a;
}

.notification:last-child {
  border-bottom: none;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.notification-title {
  font-weight: bold;
  color: #ddd;
}

.notification-time {
  color: #888;
  font-size: 0.8em;
}

.notification-content {
  font-size: 0.9em;
  color: #bbb;
}

.clear-notifications-btn {
  width: 100%;
  padding: 10px;
  background-color: #f44336;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

.loading-spinner {
  text-align: center;
  padding: 20px;
  color: #888;
}

.auth-warning {
  text-align: center;
  padding: 20px;
  color: #f44336;
}
</style>
