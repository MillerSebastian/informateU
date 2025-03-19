<template>
  <div class="columns">
    <div class="column is-one-quarter">
      <div class="box">
        <h2 class="title is-4">Usuarios</h2>
        <div v-if="loadingUsers" class="has-text-centered py-4">
          <span class="icon is-large">
            <i class="fas fa-spinner fa-pulse"></i>
          </span>
          <p>Cargando usuarios...</p>
        </div>
        <ul v-else>
          <li
            v-for="user in filteredUsers"
            :key="user.id"
            @click="selectUser(user)"
            :class="{
              'is-active': selectedUser && selectedUser.id === user.id,
            }"
          >
            <div class="user-name">
              {{ user.firstName + " " + user.lastName }}
            </div>
            <span v-if="unreadMessages[user.id]" class="notification-badge">
              {{ unreadMessages[user.id] }}
            </span>
          </li>
        </ul>
      </div>
    </div>
    <div class="column">
      <div class="box">
        <h2 class="title is-4">
          Chat con
          <span
            v-if="selectedUser"
            :style="{ color: getUserColor(selectedUser.id) }"
          >
            {{ selectedUser.firstName + " " + selectedUser.lastName }}
          </span>
          <span v-else>...</span>
        </h2>
        <div class="messages" ref="messagesContainer">
          <div v-if="!selectedUser" class="no-chat-selected">
            <p>Selecciona un usuario para comenzar a chatear</p>
          </div>
          <div v-else-if="messages.length === 0" class="no-messages">
            <p>No hay mensajes aún. ¡Envía el primer mensaje!</p>
          </div>
          <div v-else>
            <div
              v-for="message in messages"
              :key="message.id"
              :class="[
                'message-wrapper',
                message.senderId === auth.currentUser?.uid
                  ? 'sent'
                  : 'received',
              ]"
            >
              <div
                class="message-bubble"
                :class="
                  message.senderId === auth.currentUser?.uid
                    ? 'sent-bubble'
                    : 'received-bubble'
                "
                :style="
                  message.senderId !== auth.currentUser?.uid
                    ? { borderColor: getUserColor(message.senderId) }
                    : {}
                "
              >
                <div class="message-header">
                  <span
                    class="message-author"
                    :style="{ color: getUserColor(message.senderId) }"
                  >
                    {{ message.author }}
                  </span>
                  <span class="message-time">
                    {{ formatTime(message.timestamp) }}
                  </span>
                </div>
                <div class="message-content">
                  {{ message.text }}
                </div>
                <button
                  v-if="message.senderId === auth.currentUser?.uid"
                  @click="deleteMessage(message.id)"
                  class="delete-button"
                  title="Eliminar mensaje"
                >
                  <span class="icon is-small">
                    <i class="fas fa-trash"></i>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <form
          @submit.prevent="sendMessage"
          v-if="selectedUser"
          class="message-form"
        >
          <input
            v-model="newMessage"
            placeholder="Escribe un mensaje..."
            class="input"
          />
          <button type="submit" class="button is-primary">
            <span class="icon">
              <i class="fas fa-paper-plane"></i>
            </span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch, nextTick } from "vue";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  getDocs,
  deleteDoc,
  doc,
  where,
  updateDoc,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "@/firebase";

// Interfaces actualizadas para reflejar la estructura de datos del registro
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  program: string;
  city: string;
  documentType: string;
  birthDate: string;
}

interface Message {
  id: string;
  text: string;
  author: string;
  timestamp: any;
  senderId: string;
  receiverId: string;
  read?: boolean;
}

interface ReadStatus {
  [userId: string]: {
    lastReadTimestamp: any;
  };
}

interface UserColors {
  [userId: string]: string;
}

const users = ref<User[]>([]);
const selectedUser = ref<User | null>(null);
const messages = ref<Message[]>([]);
const newMessage = ref<string>("");
const currentUser = ref<User | null>(null);
const messagesContainer = ref<HTMLElement | null>(null);
const unreadMessages = ref<Record<string, number>>({});
const readStatus = ref<ReadStatus>({});
const userColors = ref<UserColors>({});
const loadingUsers = ref<boolean>(true);

const usersCollection = collection(db, "users");
const messagesCollection = collection(db, "messages");
const readStatusCollection = collection(db, "readStatus");

// Lista de colores para asignar a los usuarios
const colorPalette = [
  "#FF5733",
  "#33A8FF",
  "#33FF57",
  "#FF33A8",
  "#A833FF",
  "#FF8C33",
  "#33FFC5",
  "#FF33F5",
  "#C5FF33",
  "#337BFF",
  "#FF5E3A",
  "#3AFF8C",
  "#8C3AFF",
  "#FFD13A",
  "#3AFFD1",
];

// verificaion de usurios "si existe o no mostrarlo"
const filteredUsers = computed(() => {
  if (!auth.currentUser) return [];
  return users.value.filter(
    (user) =>
      user.id !== auth.currentUser?.uid &&
      user.firstName &&
      user.lastName &&
      user.email
  );
});

// funcion para generar colores para los usuarios
const getUserColor = (userId: string): string => {
  if (!userColors.value[userId]) {
    const hashCode = userId.split("").reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    const colorIndex = hashCode % colorPalette.length;
    userColors.value[userId] = colorPalette[colorIndex];
  }

  return userColors.value[userId];
};

const formatTime = (timestamp: any): string => {
  if (!timestamp) return "";

  const date = timestamp.toDate();
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
};

const loadUsers = async () => {
  loadingUsers.value = true;
  try {
    const usersSnapshot = await getDocs(usersCollection);
    const loadedUsers: User[] = [];

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data() as User;

      // Verificar que el usuario tenga TODOS los campos necesarios
      if (
        userData.firstName &&
        userData.lastName &&
        userData.email &&
        userData.program &&
        userData.city &&
        userData.documentType
      ) {
        loadedUsers.push({ id: doc.id, ...userData });
      }
    }

    users.value = loadedUsers;

    users.value = loadedUsers;

    if (auth.currentUser) {
      const currentUserDoc = usersSnapshot.docs.find(
        (doc) => doc.id === auth.currentUser?.uid
      );
      if (currentUserDoc && currentUserDoc.data().firstName) {
        currentUser.value = {
          id: currentUserDoc.id,
          ...currentUserDoc.data(),
        } as User;

        await loadReadStatus();
      }
    }

    // Asignar colores a todos los usuarios
    loadedUsers.forEach((user) => {
      getUserColor(user.id);
    });

    setupGlobalMessagesListener();
  } catch (error) {
    console.error("Error al cargar usuarios:", error);
  } finally {
    loadingUsers.value = false;
  }
};

// Cargar el estado de lectura de mensajes del usuario actual
const loadReadStatus = async () => {
  if (!auth.currentUser) return;

  try {
    const statusDoc = doc(readStatusCollection, auth.currentUser.uid);
    const statusSnapshot = await getDoc(statusDoc);

    if (statusSnapshot.exists()) {
      readStatus.value = statusSnapshot.data() as ReadStatus;
    } else {
      await setDoc(statusDoc, {});
    }

    calculateUnreadMessages();
  } catch (error) {
    console.error("Error al cargar el estado de lectura:", error);
  }
};

// Calcular mensajes resividos o no leidos
const calculateUnreadMessages = async () => {
  if (!auth.currentUser) return;

  for (const user of users.value) {
    if (user.id === auth.currentUser.uid) continue;

    // Buscar el ultimo timestamp leído para este usuario
    const lastReadTimestamp =
      readStatus.value[user.id]?.lastReadTimestamp || new Timestamp(0, 0);

    // Consultar mensajes no leidos
    const unreadQuery = query(
      messagesCollection,
      where("senderId", "==", user.id),
      where("receiverId", "==", auth.currentUser.uid),
      where("timestamp", ">", lastReadTimestamp)
    );

    const unreadSnapshot = await getDocs(unreadQuery);
    unreadMessages.value[user.id] = unreadSnapshot.size;
  }
};

const selectUser = async (user: User) => {
  selectedUser.value = user;

  loadMessages();

  // Marcar todos los mensajes como leídos para este usuario
  if (auth.currentUser) {
    const currentTimestamp = Timestamp.now();

    if (!readStatus.value[user.id]) {
      readStatus.value[user.id] = { lastReadTimestamp: currentTimestamp };
    } else {
      readStatus.value[user.id].lastReadTimestamp = currentTimestamp;
    }

    const statusDoc = doc(readStatusCollection, auth.currentUser.uid);
    await updateDoc(statusDoc, {
      [user.id]: {
        lastReadTimestamp: currentTimestamp,
      },
    }).catch(async (error) => {
      if (error.code === "not-found") {
        await setDoc(statusDoc, {
          [user.id]: {
            lastReadTimestamp: currentTimestamp,
          },
        });
      } else {
        console.error("Error al actualizar el estado de lectura:", error);
      }
    });

    unreadMessages.value[user.id] = 0;
  }
};

const loadMessages = () => {
  if (!selectedUser.value || !auth.currentUser) return;

  const messagesQuery = query(messagesCollection, orderBy("timestamp"));

  onSnapshot(messagesQuery, (snapshot) => {
    messages.value = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Message))
      .filter((message) => {
        // Filtrar solo mensajes entre el usuario actual y el usuario seleccionado
        const currentUserID = auth.currentUser?.uid;
        const selectedUserID = selectedUser.value?.id;

        return (
          (message.senderId === currentUserID &&
            message.receiverId === selectedUserID) ||
          (message.senderId === selectedUserID &&
            message.receiverId === currentUserID)
        );
      });

    scrollToBottom();
  });
};

const setupGlobalMessagesListener = () => {
  if (!auth.currentUser) return;

  const messagesQuery = query(messagesCollection, orderBy("timestamp"));

  onSnapshot(messagesQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const message = { id: change.doc.id, ...change.doc.data() } as Message;

        if (
          message.receiverId === auth.currentUser?.uid &&
          message.senderId !== auth.currentUser?.uid
        ) {
          playNotificationSound();

          if (
            !selectedUser.value ||
            selectedUser.value.id !== message.senderId
          ) {
            const lastReadTimestamp =
              readStatus.value[message.senderId]?.lastReadTimestamp ||
              new Timestamp(0, 0);

            if (message.timestamp > lastReadTimestamp) {
              if (!unreadMessages.value[message.senderId]) {
                unreadMessages.value[message.senderId] = 0;
              }
              unreadMessages.value[message.senderId]++;
            }
          } else {
            markMessagesAsRead(message.senderId);
          }
        }
      }
    });
  });
};

const markMessagesAsRead = async (senderId: string) => {
  if (!auth.currentUser) return;

  const currentTimestamp = Timestamp.now();

  if (!readStatus.value[senderId]) {
    readStatus.value[senderId] = { lastReadTimestamp: currentTimestamp };
  } else {
    readStatus.value[senderId].lastReadTimestamp = currentTimestamp;
  }

  const statusDoc = doc(readStatusCollection, auth.currentUser.uid);
  await updateDoc(statusDoc, {
    [senderId]: {
      lastReadTimestamp: currentTimestamp,
    },
  }).catch(async (error) => {
    if (error.code === "not-found") {
      await setDoc(statusDoc, {
        [senderId]: {
          lastReadTimestamp: currentTimestamp,
        },
      });
    } else {
      console.error("Error al actualizar el estado de lectura:", error);
    }
  });

  unreadMessages.value[senderId] = 0;
};

const playNotificationSound = () => {
  const audio = new Audio("/notifyaudio.mp3");
  audio.play().catch((e) => console.log("Error playing notification:", e));
};

const sendMessage = async () => {
  if (
    newMessage.value.trim() === "" ||
    !selectedUser.value ||
    !currentUser.value ||
    !auth.currentUser
  )
    return;

  await addDoc(messagesCollection, {
    text: newMessage.value,
    author: `${currentUser.value.firstName} ${currentUser.value.lastName}`,
    timestamp: Timestamp.now(),
    senderId: auth.currentUser.uid,
    receiverId: selectedUser.value.id,
    read: false,
  });

  newMessage.value = "";
  scrollToBottom();
};

const deleteMessage = async (messageId: string) => {
  try {
    await deleteDoc(doc(db, "messages", messageId));
    console.log("Mensaje eliminado correctamente");
  } catch (error) {
    console.error("Error al eliminar el mensaje:", error);
  }
};

const scrollToBottom = async () => {
  await nextTick();
  if (messagesContainer.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
  }
};

watch(messages, () => {
  scrollToBottom();
});

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.columns {
  height: 100vh;
}

.box {
  height: 100%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 10px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
  border-radius: 4px;
  margin-bottom: 5px;
}

li:hover {
  background-color: #00d1b2;
}

li.is-active {
  background-color: #00d1b2;
  color: rgb(255, 255, 255);
}

.user-name {
  font-weight: 500;
}

.notification-badge {
  background-color: #ff3860;
  color: white;
  border-radius: 50%;
  padding: 2px 8px;
  font-size: 0.8rem;
  margin-left: 5px;
  font-weight: bold;
}

.messages {
  flex: 1;
  overflow-y: auto;
  margin-bottom: 20px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  background-color: hsl(220deg 13.04% 9.02%);
  border-radius: 8px;
}

.no-chat-selected,
.no-messages {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  color: #888;
  font-style: italic;
}

.message-wrapper {
  display: flex;
  margin-bottom: 10px;
  width: 100%;
}

.sent {
  justify-content: flex-end;
}

.received {
  justify-content: flex-start;
}

.message-bubble {
  max-width: 70%;
  padding: 8px 12px;
  border-radius: 12px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.sent-bubble {
  background-color: #dcf8c6;
  border-top-right-radius: 2px;
}

.received-bubble {
  background-color: white;
  border-top-left-radius: 2px;
  border-left: 3px solid;
}

.message-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
  font-size: 0.8rem;
}

.message-author {
  font-weight: bold;
}

.message-time {
  opacity: 0.7;
  margin-left: 8px;
}

.message-content {
  word-break: break-word;
  line-height: 1.4;
  color: black;
}

.delete-button {
  background-color: transparent;
  border: none;
  color: #ff3860;
  cursor: pointer;
  font-size: 0.7rem;
  padding: 0;
  opacity: 0;
  position: absolute;
  right: 4px;
  bottom: 4px;
  transition: opacity 0.2s;
}

.message-bubble:hover .delete-button {
  opacity: 0.8;
}

.delete-button:hover {
  opacity: 1;
}

.message-form {
  display: flex;
  margin-top: auto;
}

.input {
  flex: 1;
  margin-right: 10px;
  border-radius: 20px;
  padding-left: 15px;
}

button.is-primary {
  border-radius: 50%;
  width: 40px;
  height: 40px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
