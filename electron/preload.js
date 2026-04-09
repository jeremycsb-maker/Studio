import { contextBridge, ipcRenderer, shell } from 'electron'

// Expose des fonctions au processus de rendu de manière sécurisée
contextBridge.exposeInMainWorld('electronAPI', {
  sendMessage: (channel, data) => ipcRenderer.send(channel, data),
  receiveMessage: (channel, func) => ipcRenderer.on(channel, (event, ...args) => func(...args)),
  // Nouvelles méthodes pour l'auth
  openBrowser: (url) => ipcRenderer.send('open-external', url), // On passera par IPC pour plus de sécurité
  onAuthCallback: (callback) => ipcRenderer.on('auth-callback', (event, url) => callback(url)),
})
