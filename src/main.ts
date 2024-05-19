import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import { promises as fs } from 'fs';
import * as path from 'path';
import { homedir } from 'os';

const getUserHomeDirectory = () => homedir();

const scanForFile = async (): Promise<string | null> => {
  const homeDir = getUserHomeDirectory();
  const codDir = path.join(homeDir, 'Documents', 'Call of Duty', 'players');
  const filenamePattern = /^options\.\d+\.cod23\.cst$/;

  try {
    const files = await fs.readdir(codDir);
    for (const file of files) {
      if (filenamePattern.test(file)) {
        return path.join(codDir, file);
      }
    }
  } catch (error) {
    // Directory not found or accessible
  }
  return null;
};

const modifyFile = async (filePath: string, newContent: string): Promise<void> => {
  const backupPath = `${filePath}.bak`;
  await fs.copyFile(filePath, backupPath); // Create a backup
  await fs.writeFile(filePath, newContent); // Write new content
};

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });
  win.loadFile('index.html');
};

app.on('ready', createWindow);

ipcMain.on('save-settings', async (event, { setting, number }) => {
  const filePath = await scanForFile();
  if (filePath) {
    const newContent = `Setting: ${setting}, Number: ${number}`;
    await modifyFile(filePath, newContent);
  } else {
    event.sender.send('file-not-found');
  }
});

ipcMain.on('prompt-file-location', async (event) => {
  const result = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'COD Settings', extensions: ['cst'] }]
  });

  if (result.filePaths.length > 0) {
    const filePath = result.filePaths[0];
    event.sender.send('file-selected', filePath);
  }
});
