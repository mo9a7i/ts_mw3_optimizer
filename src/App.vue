<template>
    <div>
      <h1>Settings</h1>
      <input v-model="setting" placeholder="Setting" />
      <input type="number" v-model="number" placeholder="Number" />
      <button @click="saveSettings">Save</button>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, onMounted } from 'vue';
  import { ipcRenderer } from 'electron';
  
  export default defineComponent({
    setup() {
      const setting = ref('');
      const number = ref(0);
  
      const saveSettings = () => {
        ipcRenderer.send('save-settings', { setting: setting.value, number: number.value });
      };
  
      onMounted(() => {
        ipcRenderer.on('file-not-found', () => {
          alert('File not found. Please locate the file.');
          ipcRenderer.send('prompt-file-location');
        });
  
        ipcRenderer.on('file-selected', (event, filePath) => {
          // Handle file selection, maybe display the file content or use it as needed
        });
      });
  
      return {
        setting,
        number,
        saveSettings,
      };
    },
  });
  </script>
