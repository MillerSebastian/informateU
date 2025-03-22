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
          <div v-else class="messages-list">
            <div
              v-for="message in sortedMessages"
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
                  <!-- Renderizar mensajes con emojis -->
                  <div
                    v-if="message.text"
                    v-html="formatMessageWithEmojis(message.text)"
                  ></div>

                  <!-- Mostrar archivo adjunto si existe -->
                  <div v-if="message.fileURL" class="file-attachment">
                    <div class="file-preview">
                      <a
                        :href="message.fileURL"
                        target="_blank"
                        class="file-link"
                      >
                        <span class="icon">
                          <i
                            class="fas"
                            :class="getFileIconClass(message.fileName)"
                          ></i>
                        </span>
                        {{ message.fileName }}
                      </a>
                    </div>
                  </div>
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
          <div class="message-input-container">
            <input
              v-model="newMessage"
              placeholder="Escribe un mensaje..."
              class="input"
            />
            <button
              type="button"
              @click="toggleEmojiPicker"
              class="emoji-button"
              title="Emojis"
            >
              <span class="icon">
                <i class="far fa-smile"></i>
              </span>
            </button>
            <button
              type="button"
              @click="triggerFileInput"
              class="file-button"
              title="Adjuntar archivo"
            >
              <span class="icon">
                <i class="fas fa-paperclip"></i>
              </span>
            </button>
            <input
              type="file"
              ref="fileInput"
              style="display: none"
              @change="handleFileUpload"
            />
          </div>
          <button type="submit" class="button is-primary">
            <span class="icon">
              <i class="fas fa-paper-plane"></i>
            </span>
          </button>
        </form>

        <!-- Selector de emojis -->
        <div v-if="showEmojiPicker" class="emoji-picker">
          <div class="emoji-picker-header">
            <h4>Emojis</h4>
            <button @click="toggleEmojiPicker" class="close-button">×</button>
          </div>
          <div class="emoji-list">
            <button
              v-for="emoji in commonEmojis"
              :key="emoji"
              @click="addEmoji(emoji)"
              class="emoji-item"
            >
              {{ emoji }}
            </button>
          </div>
        </div>

        <!-- Indicador de carga de archivo -->
        <div v-if="isUploading" class="upload-indicator">
          <span class="icon is-medium">
            <i class="fas fa-spinner fa-pulse"></i>
          </span>
          <span>Subiendo archivo...</span>
        </div>

        <!-- Previsualización de archivo seleccionado -->
        <div v-if="selectedFile && !isUploading" class="selected-file">
          <div class="file-preview">
            <span class="icon">
              <i class="fas" :class="getFileIconClass(selectedFile.name)"></i>
            </span>
            <span>{{ selectedFile.name }}</span>
            <button
              @click="cancelFileUpload"
              class="delete is-small ml-2"
            ></button>
          </div>
        </div>
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
import {
  getStorage,
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
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
  fileURL?: string;
  fileName?: string;
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
const fileInput = ref<HTMLInputElement | null>(null);
const unreadMessages = ref<Record<string, number>>({});
const readStatus = ref<ReadStatus>({});
const userColors = ref<UserColors>({});
const loadingUsers = ref<boolean>(true);
const showEmojiPicker = ref<boolean>(false);
const selectedFile = ref<File | null>(null);
const isUploading = ref<boolean>(false);

// Emojis comunes para el selector
const commonEmojis = [
  "😀",
  "😁",
  "😂",
  "🤣",
  "😃",
  "😄",
  "😅",
  "😆",
  "😉",
  "😊",
  "😋",
  "😎",
  "😍",
  "😘",
  "🥰",
  "😗",
  "😙",
  "😚",
  "🙂",
  "🤗",
  "🤔",
  "🤨",
  "😐",
  "😑",
  "😶",
  "🙄",
  "😏",
  "😣",
  "😥",
  "😮",
  "🤐",
  "😯",
  "😪",
  "😫",
  "😴",
  "😌",
  "😛",
  "😜",
  "😝",
  "🤤",
  "😒",
  "😓",
  "😔",
  "😕",
  "🙃",
  "🤑",
  "😲",
  "☹️",
  "🙁",
  "😖",
  "😞",
  "😟",
  "😤",
  "😢",
  "😭",
  "😦",
  "😧",
  "😨",
  "😩",
  "🤯",
  "👍",
  "👎",
  "👏",
  "🙌",
  "👌",
  "✌️",
  "🤘",
  "🤙",
  "👋",
  "❤️",
  "💔",
  "💯",
  "🔥",
  "⚡",
  "🌟",
  "💤",
  "💭",
  "🎵",
  "🎶",
  "🎂",
];

const usersCollection = collection(db, "users");
const messagesCollection = collection(db, "messages");
const readStatusCollection = collection(db, "readStatus");
const storage = getStorage();

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
  "#F5A533",
  "#33FFCC",
  "#F533FF",
  "#FF3357",
  "#5733FF",
  "#33FF92",
  "#FF8CFF",
  "#C533FF",
  "#33FF57",
  "#FF335B",
  "#FF8C80",
  "#33F5A8",
  "#8CFF33",
  "#A8FF33",
  "#33FF72",
  "#FF6333",
  "#FF57E5",
  "#33C5FF",
  "#F7FF33",
  "#F533D1",
  "#FF6B33",
  "#C533A8",
  "#6CFF33",
  "#33FF6C",
  "#FF3A8C",
  "#9BFF33",
  "#6B33FF",
  "#33FF48",
  "#A8FF8C",
  "#FF91A8",
  "#33FFEC",
  "#FF336B",
  "#F5FF33",
  "#FF33B3",
  "#FF3A8C",
  "#FF6342",
  "#4BFF33",
  "#B9FF33",
  "#FF339D",
  "#C733FF",
  "#F533FF",
  "#FF33F7",
  "#8CFFFB",
  "#FF33C5",
  "#A8336B",
  "#B333FF",
  "#3A8CFF",
  "#FF3333",
  "#33FFFD",
  "#FF8CF3",
  "#7CFF33",
  "#FF33AA",
  "#C8FF33",
  "#FF7F33",
  "#33D1FF",
  "#8CFF57",
  "#FF33F0",
  "#33FF97",
  "#8CFFCC",
  "#33C9FF",
  "#FF3377",
  "#A8FF75",
  "#FF75A8",
  "#3AFF5C",
  "#A833FF",
  "#D8FF33",
];

// Computed property para filtrar al usuario actual y verificar existencia
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

// Computed property para ordenar los mensajes cronológicamente
const sortedMessages = computed(() => {
  return [...messages.value].sort((a, b) => {
    return a.timestamp.seconds - b.timestamp.seconds;
  });
});

// Función para generar un color consistente para cada usuario
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

// Función para identificar y convertir emojis en el texto
const formatMessageWithEmojis = (text: string): string => {
  // Expresión regular para enlaces
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  // Reemplaza URLs con enlaces HTML
  const withLinks = text.replace(urlRegex, (url) => {
    return `<a href="${url}" target="_blank" class="message-link">${url}</a>`;
  });

  return withLinks;
};

// Determina el icono adecuado para el tipo de archivo
const getFileIconClass = (fileName: string): string => {
  const extension = fileName.split(".").pop()?.toLowerCase() || "";

  const iconMap: { [key: string]: string } = {
    pdf: "fa-file-pdf",
    doc: "fa-file-word",
    docx: "fa-file-word",
    xls: "fa-file-excel",
    xlsx: "fa-file-excel",
    ppt: "fa-file-powerpoint",
    pptx: "fa-file-powerpoint",
    jpg: "fa-file-image",
    jpeg: "fa-file-image",
    png: "fa-file-image",
    gif: "fa-file-image",
    mp4: "fa-file-video",
    mp3: "fa-file-audio",
    zip: "fa-file-archive",
    rar: "fa-file-archive",
    txt: "fa-file-alt",
  };

  return iconMap[extension] || "fa-file";
};

const loadUsers = async () => {
  loadingUsers.value = true;
  try {
    const usersSnapshot = await getDocs(usersCollection);
    const loadedUsers: User[] = [];

    for (const doc of usersSnapshot.docs) {
      const userData = doc.data() as User;

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

// Calcular mensajes recibidos no leídos
const calculateUnreadMessages = async () => {
  if (!auth.currentUser) return;

  for (const user of users.value) {
    if (user.id === auth.currentUser.uid) continue;

    const lastReadTimestamp =
      readStatus.value[user.id]?.lastReadTimestamp || new Timestamp(0, 0);

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

  // IMPORTANTE: Ordenando por timestamp para asegurar orden cronológico
  const messagesQuery = query(messagesCollection, orderBy("timestamp"));

  onSnapshot(messagesQuery, (snapshot) => {
    messages.value = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Message))
      .filter((message) => {
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

  const startListeningTime = Timestamp.now();

  onSnapshot(messagesQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        const message = { id: change.doc.id, ...change.doc.data() } as Message;

        if (
          message.receiverId === auth.currentUser?.uid &&
          message.senderId !== auth.currentUser?.uid &&
          message.timestamp.toDate() > startListeningTime.toDate()
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

// Función para alternar el selector de emojis
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value;
};

// Función para añadir un emoji al mensaje
const addEmoji = (emoji: string) => {
  newMessage.value += emoji;
};

// Desencadena el selector de archivos
const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

// Maneja la selección de archivos
const handleFileUpload = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    selectedFile.value = input.files[0];
  }
};

// Cancela la subida de archivo
const cancelFileUpload = () => {
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

// Función para cargar un archivo a Firebase Storage
const uploadFile = async (): Promise<{ url: string; name: string } | null> => {
  if (!selectedFile.value || !auth.currentUser) return null;

  isUploading.value = true;

  try {
    const fileExt = selectedFile.value.name.split(".").pop();
    const fileName = `${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 15)}.${fileExt}`;
    const filePath = `files/${auth.currentUser.uid}/${fileName}`;

    const fileRef = storageRef(storage, filePath);
    const uploadTask = uploadBytesResumable(fileRef, selectedFile.value);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        "state_changed",
        (snapshot) => {
          // Progreso de carga si quieres implementarlo
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log("Upload is " + progress + "% done");
        },
        (error) => {
          console.error("Error uploading file:", error);
          isUploading.value = false;
          reject(null);
        },
        async () => {
          // Carga completada
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          isUploading.value = false;
          resolve({
            url: downloadURL,
            name: selectedFile.value!.name,
          });
        }
      );
    });
  } catch (error) {
    console.error("Error in upload function:", error);
    isUploading.value = false;
    return null;
  }
};

const sendMessage = async () => {
  if (
    (!newMessage.value.trim() && !selectedFile.value) ||
    !selectedUser.value ||
    !currentUser.value ||
    !auth.currentUser
  )
    return;

  let fileData = null;

  // Si hay un archivo seleccionado, súbelo primero
  if (selectedFile.value) {
    fileData = await uploadFile();
    if (!fileData && !newMessage.value.trim()) {
      return; // Si falló la carga del archivo y no hay mensaje, no enviar nada
    }
  }

  // Crear mensaje con o sin archivo adjunto
  const messageData: any = {
    text: newMessage.value,
    author: `${currentUser.value.firstName} ${currentUser.value.lastName}`,
    timestamp: Timestamp.now(),
    senderId: auth.currentUser.uid,
    receiverId: selectedUser.value.id,
    read: false,
  };

  // Añadir información del archivo si existe
  if (fileData) {
    messageData.fileURL = fileData.url;
    messageData.fileName = fileData.name;
  }

  await addDoc(messagesCollection, messageData);

  // Resetear campos después de enviar
  newMessage.value = "";
  selectedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = "";
  }

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

.messages-list {
  display: flex;
  flex-direction: column;
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
  color: black;
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
}

.message-link {
  color: #3273dc;
  text-decoration: underline;
}

.file-attachment {
  margin-top: 6px;
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 5px;
}

.file-preview {
  display: flex;
  align-items: center;
}

.file-link {
  display: flex;
  align-items: center;
  color: #3273dc;
  text-decoration: none;
}

.file-link:hover {
  text-decoration: underline;
}

.file-link .icon {
  margin-right: 5px;
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

.message-input-container {
  display: flex;
  flex: 1;
  position: relative;
  margin-right: 10px;
  align-items: center;
  background-color: white;
  border-radius: 20px;
  padding-right: 10px;
}

.message-input-container .input {
  flex: 1;
  border-radius: 20px;
  padding-left: 15px;
  border: none;
  box-shadow: none;
}

.emoji-button,
.file-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0 5px;
  color: #888;
  transition: color 0.2s;
}

.emoji-button:hover,
.file-button:hover {
  color: #00d1b2;
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

.emoji-picker {
  position: absolute;
  bottom: 70px;
  right: 50px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  width: 320px;
  max-height: 300px;
  z-index: 10;
  overflow-y: auto;
}

.emoji-picker-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
}

.emoji-picker-header h4 {
  margin: 0;
  font-weight: 500;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  line-height: 1;
}

.emoji-list {
  display: flex;
  flex-wrap: wrap;
  padding: 10px;
}

.emoji-item {
  width: 35px;
  height: 35px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  cursor: pointer;
  background: none;
  border: none;
  transition: background-color 0.2s;
  border-radius: 5px;
}

.emoji-item:hover {
  background-color: #f5f5f5;
}

.upload-indicator {
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

.upload-indicator .icon {
  margin-right: 8px;
  color: #00d1b2;
}

.selected-file {
  display: flex;
  align-items: center;
  margin-top: 8px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 5px;
}

.selected-file .file-preview {
  display: flex;
  align-items: center;
  flex: 1;
}

.selected-file .icon {
  margin-right: 8px;
  color: #3273dc;
}

/* Estilo para dispositivos móviles */
@media screen and (max-width: 768px) {
  .column.is-one-quarter {
    width: 40%;
  }

  .message-bubble {
    max-width: 85%;
  }

  .emoji-picker {
    width: 280px;
    right: 20px;
  }
}
</style>
