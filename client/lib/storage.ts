/**
 * storage.ts
 * 
 * Provides persistent storage utilities for notes and calculator history.
 * Uses AsyncStorage for key-value persistence that survives app restarts.
 * All operations are asynchronous to prevent blocking the UI thread.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// Data structure representing a single note
export interface Note {
  id: string;
  content: string;
  timestamp: number;
}

// Data structure representing a calculation history entry
export interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
}

// Storage keys used for AsyncStorage operations
const STORAGE_KEYS = {
  NOTES: "@calculator_notes",
  HISTORY: "@calculator_history",
};

/**
 * Persists the complete notes array to storage.
 * Overwrites any existing notes data.
 */
export async function saveNotes(notes: Note[]): Promise<void> {
  try {
    const jsonString = JSON.stringify(notes);
    await AsyncStorage.setItem(STORAGE_KEYS.NOTES, jsonString);
  } catch (error) {
    console.error("Failed to save notes:", error);
  }
}

/**
 * Retrieves all saved notes from storage.
 * Returns an empty array if no notes exist or on error.
 */
export async function loadNotes(): Promise<Note[]> {
  try {
    const jsonString = await AsyncStorage.getItem(STORAGE_KEYS.NOTES);
    
    if (jsonString === null) {
      return [];
    }
    
    return JSON.parse(jsonString) as Note[];
  } catch (error) {
    console.error("Failed to load notes:", error);
    return [];
  }
}

/**
 * Persists calculation history to storage.
 */
export async function saveHistory(history: HistoryItem[]): Promise<void> {
  try {
    const jsonString = JSON.stringify(history);
    await AsyncStorage.setItem(STORAGE_KEYS.HISTORY, jsonString);
  } catch (error) {
    console.error("Failed to save history:", error);
  }
}

/**
 * Retrieves calculation history from storage.
 * Returns an empty array if no history exists or on error.
 */
export async function loadHistory(): Promise<HistoryItem[]> {
  try {
    const jsonString = await AsyncStorage.getItem(STORAGE_KEYS.HISTORY);
    
    if (jsonString === null) {
      return [];
    }
    
    return JSON.parse(jsonString) as HistoryItem[];
  } catch (error) {
    console.error("Failed to load history:", error);
    return [];
  }
}

/**
 * Creates a new note and adds it to the beginning of the notes list.
 * Returns the newly created note object.
 */
export async function addNote(content: string): Promise<Note> {
  const notes = await loadNotes();
  
  const newNote: Note = {
    id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
    content: content,
    timestamp: Date.now(),
  };
  
  const updatedNotes = [newNote, ...notes];
  await saveNotes(updatedNotes);
  
  return newNote;
}

/**
 * Updates an existing note's content and timestamp.
 * Returns the updated note or null if not found.
 */
export async function updateNote(id: string, content: string): Promise<Note | null> {
  const notes = await loadNotes();
  
  const noteIndex = notes.findIndex((note) => note.id === id);
  
  if (noteIndex === -1) {
    return null;
  }
  
  notes[noteIndex] = {
    ...notes[noteIndex],
    content: content,
    timestamp: Date.now(),
  };
  
  await saveNotes(notes);
  return notes[noteIndex];
}

/**
 * Removes a note from storage by its ID.
 * Returns true if a note was deleted, false if not found.
 */
export async function deleteNote(id: string): Promise<boolean> {
  const notes = await loadNotes();
  
  const updatedNotes = notes.filter((note) => note.id !== id);
  
  if (updatedNotes.length === notes.length) {
    return false;
  }
  
  await saveNotes(updatedNotes);
  return true;
}

/**
 * Retrieves a single note by its ID.
 * Returns null if not found.
 */
export async function getNoteById(id: string): Promise<Note | null> {
  const notes = await loadNotes();
  return notes.find((note) => note.id === id) || null;
}

/**
 * Removes all stored data (notes and history).
 * Useful for testing or full reset functionality.
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove([STORAGE_KEYS.NOTES, STORAGE_KEYS.HISTORY]);
  } catch (error) {
    console.error("Failed to clear data:", error);
  }
}
