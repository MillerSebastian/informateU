<template>
  <div class="columns">
    <div class="column is-one-quarter">
      <div class="box">
        <h2 class="title is-4">Usuarios</h2>
        <ul>
          <li
            v-for="user in filteredUsers"
            :key="user.id"
            @click="selectUser(user)"
            :class="{
              'is-active': selectedUser && selectedUser.id === user.id,
            }"
          >
            {{ user.email }}
          </li>
        </ul>
      </div>
    </div>
    <div class="column">
      <div class="box">
        <h2 class="title is-4">
          Chat con
          {{
            selectedUser
              ? selectedUser.firstName + " " + selectedUser.lastName
              : "..."
          }}
        </h2>
        <div class="messages">
          <div v-for="message in messages" :key="message.id" class="message">
            <div class="message-container">
              <div class="message-content">
                <strong>{{ message.author }}:</strong> {{ message.text }}
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
        <form @submit.prevent="sendMessage">
          <input
            v-model="newMessage"
            placeholder="Escribe un mensaje..."
            class="input"
          />
          <button type="submit" class="button is-primary">Enviar</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
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
}

const users = ref<User[]>([]);
const selectedUser = ref<User | null>(null);
const messages = ref<Message[]>([]);
const newMessage = ref<string>("");
const currentUser = ref<User | null>(null);

const usersCollection = collection(db, "users");
const messagesCollection = collection(db, "messages");

// Computed property para filtrar al usuario actual de la lista
const filteredUsers = computed(() => {
  if (!auth.currentUser) return users.value;
  return users.value.filter((user) => user.id !== auth.currentUser?.uid);
});

const loadUsers = async () => {
  const usersSnapshot = await getDocs(usersCollection);
  users.value = usersSnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as User)
  );

  // Obtener el usuario actual
  if (auth.currentUser) {
    const currentUserDoc = usersSnapshot.docs.find(
      (doc) => doc.id === auth.currentUser?.uid
    );
    if (currentUserDoc) {
      currentUser.value = {
        id: currentUserDoc.id,
        ...currentUserDoc.data(),
      } as User;
    }
  }
};

const selectUser = (user: User) => {
  selectedUser.value = user;
  loadMessages();
};

const loadMessages = () => {
  if (!selectedUser.value || !auth.currentUser) return;

  // Consulta para obtener mensajes ordenados por timestamp
  const messagesQuery = query(messagesCollection, orderBy("timestamp"));

  onSnapshot(messagesQuery, (snapshot) => {
    messages.value = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Message))
      .filter((message) => {
        // Filtrar solo mensajes entre el usuario actual y el usuario seleccionado
        const currentUserID = auth.currentUser?.uid;
        const selectedUserID = selectedUser.value?.id;

        return (
          // Mensajes enviados por el usuario actual al usuario seleccionado
          (message.senderId === currentUserID &&
            message.receiverId === selectedUserID) ||
          // Mensajes enviados por el usuario seleccionado al usuario actual
          (message.senderId === selectedUserID &&
            message.receiverId === currentUserID)
        );
      });
  });
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
  });

  newMessage.value = "";
};

const deleteMessage = async (messageId: string) => {
  try {
    await deleteDoc(doc(db, "messages", messageId));
    console.log("Mensaje eliminado correctamente");
  } catch (error) {
    console.error("Error al eliminar el mensaje:", error);
  }
};

onMounted(loadUsers);
</script>

<style scoped>
.columns {
  height: 100vh;
}

.box {
  height: 100%;
  overflow-y: auto;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 10px;
  cursor: pointer;
}

li.is-active {
  background-color: #00d1b2;
  color: white;
}

.messages {
  height: 400px;
  overflow-y: auto;
  margin-bottom: 20px;
}

.message {
  margin-bottom: 10px;
}

.message-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.message-content {
  flex-grow: 1;
}

.delete-button {
  background-color: transparent;
  border: none;
  color: #ff3860;
  cursor: pointer;
  font-size: 0.8rem;
  padding: 0 5px;
  opacity: 0.6;
}

.delete-button:hover {
  opacity: 1;
}

form {
  display: flex;
}

input {
  flex: 1;
  margin-right: 10px;
}
</style>
