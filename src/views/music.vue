<template>
  <div class="rolitas-page">
    <h1 class="title">Rolitas</h1>

    <div class="tabs is-centered">
      <ul>
        <li :class="{ 'is-active': activeTab === 'news' }">
          <a @click="activeTab = 'news'">Noticias</a>
        </li>
        <li :class="{ 'is-active': activeTab === 'player' }">
          <a @click="activeTab = 'player'">Reproductor</a>
        </li>
        <li :class="{ 'is-active': activeTab === 'playlists' }">
          <a @click="activeTab = 'playlists'">Mis Playlists</a>
        </li>
      </ul>
    </div>

    <!-- Pestaña de Noticias -->
    <div v-if="activeTab === 'news'" class="tab-content">
      <div class="add-news-button">
        <button class="button is-button-modal" @click="showNewsModal = true">
          + Añadir Noticia
        </button>
      </div>

      <AddNewsModal
        :isActive="showNewsModal"
        :closeModal="closeNewsModal"
        category="music"
      />

      <div class="news-feed">
        <NewsCard
          v-for="news in newsList"
          :key="news.id"
          :news="news"
          category="music"
        />
      </div>
    </div>

    <!-- Pestaña del Reproductor de Música -->
    <div v-if="activeTab === 'player'" class="tab-content">
      <div class="music-player-container">
        <div class="upload-section">
          <button
            class="button is-button-modal"
            @click="showUploadModal = true"
          >
            + Subir Canción
          </button>

          <UploadSongModal
            :isActive="showUploadModal"
            :closeModal="closeUploadModal"
            @song-uploaded="handleSongUploaded"
          />
        </div>

        <!-- Player Controls -->
        <div class="player-controls" v-if="currentSong">
          <h3 class="song-title">
            {{ currentSong.title }} - {{ currentSong.artist }}
          </h3>
          <div class="controls">
            <button @click="prevSong" class="button is-small">
              <span class="icon">
                <i class="fas fa-step-backward"></i>
              </span>
            </button>
            <button @click="togglePlay" class="button is-medium">
              <span class="icon">
                <i :class="isPlaying ? 'fas fa-pause' : 'fas fa-play'"></i>
              </span>
            </button>
            <button @click="nextSong" class="button is-small">
              <span class="icon">
                <i class="fas fa-step-forward"></i>
              </span>
            </button>
            <button
              @click="addToCurrentPlaylist"
              class="button is-small"
              :disabled="!currentSong"
            >
              <span class="icon">
                <i class="fas fa-plus"></i>
              </span>
              <span>Añadir a Playlist</span>
            </button>
          </div>
          <div class="progress-container">
            <input
              type="range"
              min="0"
              max="100"
              v-model="songProgress"
              @input="seekSong"
              class="progress-bar"
            />
            <div class="time-display">
              <span>{{ formatTime(currentTime) }}</span>
              <span>{{ formatTime(duration) }}</span>
            </div>
          </div>
        </div>
        <div v-else class="no-song-message">
          <p>
            No hay canción seleccionada. Sube una canción o selecciona una de la
            lista.
          </p>
        </div>

        <!-- Song List -->
        <div class="song-list">
          <h3>Canciones disponibles</h3>
          <ul class="songs">
            <li
              v-for="song in songsList"
              :key="song.id"
              :class="{
                'is-active': currentSong && currentSong.id === song.id,
              }"
              @click="playSong(song)"
            >
              <span class="song-info">
                <strong>{{ song.title }}</strong> - {{ song.artist }}
              </span>
              <div class="song-actions">
                <button
                  class="button is-small"
                  @click.stop="addToNewPlaylist(song)"
                >
                  <span class="icon">
                    <i class="fas fa-list"></i>
                  </span>
                </button>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Pestaña de Playlists -->
    <div v-if="activeTab === 'playlists'" class="tab-content">
      <div class="playlists-header">
        <h3>Mis Playlists</h3>
        <button
          class="button is-button-modal"
          @click="showCreatePlaylistModal = true"
        >
          + Crear Playlist
        </button>
      </div>

      <CreatePlaylistModal
        :isActive="showCreatePlaylistModal"
        :closeModal="closeCreatePlaylistModal"
        @playlist-created="handlePlaylistCreated"
      />

      <!-- Lista de Playlists -->
      <div class="playlists-container">
        <div
          v-for="playlist in playlists"
          :key="playlist.id"
          class="playlist-card"
          :class="{ 'is-active': selectedPlaylistId === playlist.id }"
          @click="selectPlaylist(playlist.id)"
        >
          <div class="playlist-header">
            <h4>{{ playlist.name }}</h4>
            <span class="songs-count"
              >{{ playlist.songs.length }} canciones</span
            >
          </div>
          <button
            class="button is-small is-danger"
            @click.stop="deletePlaylist(playlist.id)"
          >
            <span class="icon">
              <i class="fas fa-trash"></i>
            </span>
          </button>
        </div>
      </div>

      <!-- Detalles de la Playlist Seleccionada -->
      <div v-if="selectedPlaylist" class="selected-playlist">
        <h3>{{ selectedPlaylist.name }}</h3>
        <button class="button is-primary" @click="playPlaylist">
          <span class="icon">
            <i class="fas fa-play"></i>
          </span>
          <span>Reproducir Playlist</span>
        </button>

        <ul class="playlist-songs">
          <li v-for="(song, index) in selectedPlaylist.songs" :key="index">
            <span class="song-info">
              <strong>{{ song.title }}</strong> - {{ song.artist }}
            </span>
            <div class="song-actions">
              <button class="button is-small" @click="playSong(song)">
                <span class="icon">
                  <i class="fas fa-play"></i>
                </span>
              </button>
              <button
                class="button is-small is-danger"
                @click="removeSongFromPlaylist(index)"
              >
                <span class="icon">
                  <i class="fas fa-times"></i>
                </span>
              </button>
            </div>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, defineComponent } from "vue";
import {
  getFirestore,
  collection,
  onSnapshot,
  addDoc,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import AddNewsModal from "@/components/AddNewsModal.vue";
import NewsCard from "@/components/NewsCards.vue";
import UploadSongModal from "@/components/UploadSongModal.vue";
import CreatePlaylistModal from "@/components/CreatePlaylistModal.vue";

const db = getFirestore();
const storage = getStorage();

const activeTab = ref("news");

const showNewsModal = ref(false);
const newsList = ref<any[]>([]);

const showUploadModal = ref(false);
const songsList = ref<any[]>([]);
const currentSong = ref<any>(null);
const isPlaying = ref(false);
const audioElement = ref<HTMLAudioElement | null>(null);
const songProgress = ref(0);
const currentTime = ref(0);
const duration = ref(0);

const showCreatePlaylistModal = ref(false);
const playlists = ref<any[]>([]);
const selectedPlaylistId = ref<string | null>(null);
const selectedPlaylist = computed(() => {
  if (!selectedPlaylistId.value) return null;
  return playlists.value.find((p) => p.id === selectedPlaylistId.value);
});

const closeNewsModal = () => {
  showNewsModal.value = false;
};

const closeUploadModal = () => {
  showUploadModal.value = false;
};

const handleSongUploaded = (songData: any) => {
  songsList.value.push(songData);
  closeUploadModal();
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? "0" + secs : secs}`;
};

const playSong = (song: any) => {
  if (!audioElement.value) {
    audioElement.value = new Audio();
    setupAudioListeners();
  }

  // Si es la misma canción, solo toggle play/pause
  if (currentSong.value && currentSong.value.id === song.id) {
    togglePlay();
    return;
  }

  currentSong.value = song;
  audioElement.value.src = song.audioUrl;
  audioElement.value.load();
  audioElement.value.play();
  isPlaying.value = true;
};

const togglePlay = () => {
  if (!audioElement.value || !currentSong.value) return;

  if (isPlaying.value) {
    audioElement.value.pause();
  } else {
    audioElement.value.play();
  }

  isPlaying.value = !isPlaying.value;
};

const seekSong = () => {
  if (!audioElement.value) return;

  const seekTime = (songProgress.value / 100) * duration.value;
  audioElement.value.currentTime = seekTime;
};

const nextSong = () => {
  if (!currentSong.value || songsList.value.length === 0) return;

  const currentIndex = songsList.value.findIndex(
    (song) => song.id === currentSong.value.id
  );
  const nextIndex = (currentIndex + 1) % songsList.value.length;
  playSong(songsList.value[nextIndex]);
};

const prevSong = () => {
  if (!currentSong.value || songsList.value.length === 0) return;

  const currentIndex = songsList.value.findIndex(
    (song) => song.id === currentSong.value.id
  );
  const prevIndex =
    (currentIndex - 1 + songsList.value.length) % songsList.value.length;
  playSong(songsList.value[prevIndex]);
};

const setupAudioListeners = () => {
  if (!audioElement.value) return;

  audioElement.value.addEventListener("timeupdate", () => {
    if (!audioElement.value) return;

    currentTime.value = audioElement.value.currentTime;
    duration.value = audioElement.value.duration || 0;
    songProgress.value = (currentTime.value / duration.value) * 100 || 0;
  });

  audioElement.value.addEventListener("ended", () => {
    nextSong();
  });

  audioElement.value.addEventListener("play", () => {
    isPlaying.value = true;
  });

  audioElement.value.addEventListener("pause", () => {
    isPlaying.value = false;
  });
};

// Funciones para playlists
const closeCreatePlaylistModal = () => {
  showCreatePlaylistModal.value = false;
};

const handlePlaylistCreated = (playlistData: any) => {
  playlists.value.push(playlistData);
  closeCreatePlaylistModal();
};

const selectPlaylist = (playlistId: string) => {
  selectedPlaylistId.value = playlistId;
};

const deletePlaylist = async (playlistId: string) => {
  if (confirm("¿Estás seguro de eliminar esta playlist?")) {
    try {
      await deleteDoc(doc(db, "playlists", playlistId));

      // Si la playlist eliminada estaba seleccionada, limpiar la selección
      if (selectedPlaylistId.value === playlistId) {
        selectedPlaylistId.value = null;
      }
    } catch (error) {
      console.error("Error al eliminar playlist:", error);
    }
  }
};

const addToNewPlaylist = async (song: any) => {
  showCreatePlaylistModal.value = true;
  // La función handlePlaylistCreated se encargará de guardar la playlist
  // Aquí se podría agregar lógica para precargar la canción en la nueva playlist
};

const addToCurrentPlaylist = async () => {
  if (!currentSong.value || !selectedPlaylist.value) {
    alert("Selecciona una canción y una playlist primero");
    return;
  }

  try {
    const playlistRef = doc(db, "playlists", selectedPlaylist.value.id);
    const playlistDoc = await getDoc(playlistRef);

    if (playlistDoc.exists()) {
      const playlistData = playlistDoc.data();
      const songs = [...playlistData.songs, currentSong.value];

      await updateDoc(playlistRef, { songs });

      // Actualizamos la vista local
      const index = playlists.value.findIndex(
        (p) => p.id === selectedPlaylist.value.id
      );
      if (index !== -1) {
        playlists.value[index].songs = songs;
      }
    }
  } catch (error) {
    console.error("Error al añadir canción a la playlist:", error);
  }
};

const removeSongFromPlaylist = async (songIndex: number) => {
  if (!selectedPlaylist.value) return;

  try {
    const playlistRef = doc(db, "playlists", selectedPlaylist.value.id);
    const playlistDoc = await getDoc(playlistRef);

    if (playlistDoc.exists()) {
      const playlistData = playlistDoc.data();
      const songs = [...playlistData.songs];
      songs.splice(songIndex, 1);

      await updateDoc(playlistRef, { songs });

      // Actualizamos la vista local
      const index = playlists.value.findIndex(
        (p) => p.id === selectedPlaylist.value.id
      );
      if (index !== -1) {
        playlists.value[index].songs = songs;
      }
    }
  } catch (error) {
    console.error("Error al eliminar canción de la playlist:", error);
  }
};

const playPlaylist = () => {
  if (!selectedPlaylist.value || selectedPlaylist.value.songs.length === 0) {
    alert("La playlist está vacía");
    return;
  }

  // Reproducir la primera canción de la playlist
  playSong(selectedPlaylist.value.songs[0]);
};

// Carga de datos iniciales
onMounted(() => {
  // Obtener noticias
  const newsQuery = collection(db, "music");
  const newsUnsubscribe = onSnapshot(newsQuery, (snapshot) => {
    newsList.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });

  // Obtener canciones
  const songsQuery = collection(db, "songs");
  const songsUnsubscribe = onSnapshot(songsQuery, (snapshot) => {
    songsList.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });

  // Obtener playlists
  const playlistsQuery = collection(db, "playlists");
  const playlistsUnsubscribe = onSnapshot(playlistsQuery, (snapshot) => {
    playlists.value = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  });

  // Crear elemento de audio
  audioElement.value = new Audio();
  setupAudioListeners();

  // Limpiar suscripciones al desmontar el componente
  onUnmounted(() => {
    newsUnsubscribe();
    songsUnsubscribe();
    playlistsUnsubscribe();

    // Limpiar elemento de audio
    if (audioElement.value) {
      audioElement.value.pause();
      audioElement.value.src = "";
    }
  });
});
</script>

<style scoped>
.rolitas-page {
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

.title {
  font-size: 2rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.tabs {
  margin-bottom: 1.5rem;
}

.tab-content {
  margin-top: 1rem;
}

/* Estilos para noticias */
.add-news-button {
  margin-bottom: 1rem;
  text-align: right;
}

.news-feed {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

/* Estilos para el reproductor */
.music-player-container {
  display: grid;
  grid-template-rows: auto auto 1fr;
  gap: 1.5rem;
}

.upload-section {
  text-align: right;
  margin-bottom: 1rem;
}

.player-controls {
  background-color: #f5f5f5;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.song-title {
  font-size: 1.2rem;
  margin-bottom: 1rem;
  text-align: center;
}

.controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.progress-container {
  width: 100%;
}

.progress-bar {
  width: 100%;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #ddd;
  border-radius: 3px;
  outline: none;
  margin-bottom: 0.5rem;
}

.progress-bar::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: rgb(233, 18, 204);
  border-radius: 50%;
  cursor: pointer;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 0.8rem;
  color: #666;
}

.song-list {
  margin-top: 2rem;
}

.song-list h3 {
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

.songs {
  list-style: none;
  padding: 0;
}

.songs li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
}

.songs li:hover {
  background-color: #f9f9f9;
}

.songs li.is-active {
  background-color: #f0f0f0;
  border-left: 3px solid rgb(233, 18, 204);
}

.song-info {
  flex: 1;
}

.song-actions {
  display: flex;
  gap: 0.5rem;
}

.no-song-message {
  text-align: center;
  padding: 2rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  color: #666;
}

/* Estilos para playlists */
.playlists-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.playlists-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.playlist-card {
  padding: 1rem;
  background-color: #f5f5f5;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background-color 0.2s;
}

.playlist-card:hover {
  background-color: #eaeaea;
}

.playlist-card.is-active {
  background-color: #e0e0e0;
  border-left: 3px solid rgb(233, 18, 204);
}

.playlist-header {
  flex: 1;
}

.songs-count {
  font-size: 0.8rem;
  color: #666;
}

.selected-playlist {
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.selected-playlist h3 {
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.playlist-songs {
  list-style: none;
  padding: 0;
  margin-top: 1.5rem;
}

.playlist-songs li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8rem;
  border-bottom: 1px solid #eee;
}

.is-button-modal {
  background-color: rgb(233, 18, 204);
  color: white;
  border: none;
}

.is-button-modal:hover {
  background-color: rgb(207, 16, 181);
  color: white;
}
</style>
