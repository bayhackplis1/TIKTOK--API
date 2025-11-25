import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

export interface ChatMessage {
  id: number;
  username: string;
  age: number;
  message: string;
  timestamp: string;
}

const STORAGE_DIR = path.join(process.cwd(), 'data');
const MESSAGES_FILE = path.join(STORAGE_DIR, 'chat-messages.json');

async function ensureStorageDir() {
  if (!existsSync(STORAGE_DIR)) {
    await mkdir(STORAGE_DIR, { recursive: true });
  }
}

async function readMessages(): Promise<ChatMessage[]> {
  try {
    await ensureStorageDir();
    if (!existsSync(MESSAGES_FILE)) {
      await writeFile(MESSAGES_FILE, JSON.stringify([], null, 2));
      return [];
    }
    const data = await readFile(MESSAGES_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading messages:', error);
    return [];
  }
}

async function writeMessages(messages: ChatMessage[]): Promise<void> {
  try {
    await ensureStorageDir();
    await writeFile(MESSAGES_FILE, JSON.stringify(messages, null, 2));
  } catch (error) {
    console.error('Error writing messages:', error);
    throw error;
  }
}

export async function getAllMessages(limit: number = 100): Promise<ChatMessage[]> {
  const messages = await readMessages();
  return messages.slice(-limit).reverse();
}

export async function addMessage(username: string, age: number, message: string): Promise<ChatMessage> {
  const messages = await readMessages();
  
  const newMessage: ChatMessage = {
    id: messages.length > 0 ? Math.max(...messages.map(m => m.id)) + 1 : 1,
    username,
    age,
    message,
    timestamp: new Date().toISOString(),
  };
  
  messages.push(newMessage);
  await writeMessages(messages);
  
  return newMessage;
}

export async function clearOldMessages(daysToKeep: number = 30): Promise<number> {
  const messages = await readMessages();
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
  
  const filteredMessages = messages.filter(msg => {
    const msgDate = new Date(msg.timestamp);
    return msgDate >= cutoffDate;
  });
  
  const deletedCount = messages.length - filteredMessages.length;
  
  if (deletedCount > 0) {
    await writeMessages(filteredMessages);
  }
  
  return deletedCount;
}
