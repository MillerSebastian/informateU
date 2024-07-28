<template>
  <div class="columns">
    <div class="column is-one-quarter">
      <div class="box">
        <h2 class="title is-4">Usuarios</h2>
        <ul>
          <li
            v-for="user in users"
            :key="user.id"
            @click="selectUser(user)"
            :class="{
              'is-active': selectedUser && selectedUser.id === user.id,
            }"
          >
            {{ user.name }}
          </li>
        </ul>
      </div>
    </div>
    <div class="column">
      <div class="box">
        <h2 class="title is-4">
          Chat con {{ selectedUser ? selectedUser.name : "..." }}
        </h2>
        <div class="messages">
          <div v-for="message in messages" :key="message.id" class="message">
            <strong>{{ message.author }}:</strong> {{ message.text }}
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
import { ref, onMounted } from "vue";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "@/firebase";

interface User {
  id: string;
  name: string;
}

interface Message {
  id: string;
  text: string;
  author: string;
  timestamp: any;
  userId: string;
}

const users = ref<User[]>([]);
const selectedUser = ref<User | null>(null);
const messages = ref<Message[]>([]);
const newMessage = ref<string>("");

const usersCollection = collection(db, "users");
const messagesCollection = collection(db, "messages");

const loadUsers = async () => {
  const usersSnapshot = await getDocs(usersCollection);
  users.value = usersSnapshot.docs.map(
    (doc) => ({ id: doc.id, ...doc.data() } as User)
  );
};

const selectUser = (user: User) => {
  selectedUser.value = user;
  loadMessages();
};

const loadMessages = () => {
  if (!selectedUser.value) return;
  const messagesQuery = query(messagesCollection, orderBy("timestamp"));
  onSnapshot(messagesQuery, (snapshot) => {
    messages.value = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as Message))
      .filter((message) => message.userId === selectedUser.value?.id);
  });
};

const sendMessage = async () => {
  if (newMessage.value.trim() === "" || !selectedUser.value) return;
  await addDoc(messagesCollection, {
    text: newMessage.value,
    author: "Tu Nombre", // Aquí podrías usar el nombre del usuario autenticado
    timestamp: Timestamp.now(),
    userId: selectedUser.value.id,
  });
  newMessage.value = "";
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

form {
  display: flex;
}

input {
  flex: 1;
  margin-right: 10px;
}
</style>
