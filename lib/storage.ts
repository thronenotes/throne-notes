"use client";

export interface Book {
  id: string;
  title: string;
  status: "draft" | "editing" | "published";
  createdAt: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  title: string;
  content: string;
  status: "draft" | "editing" | "published";
  sourceDreamId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  spiritualState: string;
  tags: string[];
  date: string;
  createdAt: string;
}

const BOOKS_KEY = "throne_books";
const CHAPTERS_KEY = "throne_chapters";
const ENTRIES_KEY = "throne_entries";

export function getBooks(): Book[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(BOOKS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveBooks(books: Book[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(BOOKS_KEY, JSON.stringify(books));
}

export function addBook(book: Book) {
  const books = getBooks();
  books.push(book);
  saveBooks(books);
  return book;
}

export function getChapters(): Chapter[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(CHAPTERS_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveChapters(chapters: Chapter[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CHAPTERS_KEY, JSON.stringify(chapters));
}

export function addChapter(chapter: Chapter) {
  const chapters = getChapters();
  chapters.push(chapter);
  saveChapters(chapters);
  return chapter;
}

export function updateChapter(id: string, updates: Partial<Chapter>) {
  const chapters = getChapters();
  const idx = chapters.findIndex((c) => c.id === id);
  if (idx !== -1) {
    chapters[idx] = { ...chapters[idx], ...updates, updatedAt: new Date().toISOString() };
    saveChapters(chapters);
  }
  return chapters[idx];
}

export function deleteChapter(id: string) {
  const chapters = getChapters();
  const filtered = chapters.filter((c) => c.id !== id);
  saveChapters(filtered);
}

export function getEntries(): JournalEntry[] {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(ENTRIES_KEY);
  return data ? JSON.parse(data) : [];
}

export function saveEntries(entries: JournalEntry[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
}

export function addEntry(entry: JournalEntry) {
  const entries = getEntries();
  entries.unshift(entry);
  saveEntries(entries);
  return entry;
}

export function deleteEntry(id: string) {
  const entries = getEntries();
  const filtered = entries.filter((e) => e.id !== id);
  saveEntries(filtered);
}

export function seedData() {
  if (typeof window === "undefined") return;
  
  if (getBooks().length === 0) {
    const books: Book[] = [
      { id: "book-1", title: "The Kingdom Code", status: "editing", createdAt: new Date().toISOString() },
      { id: "book-2", title: "Prophetic Blueprints", status: "draft", createdAt: new Date().toISOString() },
    ];
    saveBooks(books);
  }

  if (getChapters().length === 0) {
    const chapters: Chapter[] = [
      {
        id: "ch-1",
        bookId: "book-1",
        title: "Chapter 1: The Throne Room",
        content: "<p>The throne room is not a place you visit. It is a place you <strong>occupy</strong>.</p><p>When the prophet Isaiah saw the Lord high and lifted up, he did not merely observe — he was <em>confronted</em>. The seraphim cried, \"Holy, holy, holy!\" and the foundations shook.</p><blockquote>The kingdom of God is not in word, but in power. — 1 Corinthians 4:20</blockquote><p>Every believer has been given a seat at the table. The question is: are you sitting?</p>",
        status: "published",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "ch-2",
        bookId: "book-1",
        title: "Chapter 2: The Decree of Dominion",
        content: "<p>A king does not beg. A king <strong>decrees</strong>.</p><p>In the ancient courts, a decree once spoken could not be reversed. It carried the full weight of the throne. Today, your words carry the same authority.</p>",
        status: "editing",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: "ch-3",
        bookId: "book-1",
        title: "Chapter 3: Breaking Generational Poverty",
        content: "<p><em>Dream Source: Dream #47 — March 3rd, 3:14 AM</em></p><p>I saw a chain wrapped around my father's house. But in the dream, I was given a golden key. The angel said, \"This is the key of David. What you open, no man can shut.\"</p><p>Generational poverty is not just financial. It is a <strong>mindset</strong> passed down through bloodlines. The blood of Jesus speaks a better word.</p>",
        status: "editing",
        sourceDreamId: "entry-1",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    saveChapters(chapters);
  }

  if (getEntries().length === 0) {
    const entries: JournalEntry[] = [
      {
        id: "entry-1",
        title: "Dream #47 — The Golden Key",
        content: "I saw a chain wrapped around my father's house. But in the dream, I was given a golden key. The angel said, 'This is the key of David. What you open, no man can shut.' The key had the number 777 engraved on it.",
        spiritualState: "revelation",
        tags: ["#financial-breakthrough", "#generational-curses", "#angelic-visit"],
        date: "2026-03-03",
        createdAt: new Date().toISOString(),
      },
      {
        id: "entry-2",
        title: "Vision — The River of Gold",
        content: "Saw a river flowing through the city. The water was liquid gold. People were drinking from it and their faces began to shine. A voice said: 'This is the river of My provision. It flows to those who believe.'",
        spiritualState: "vision",
        tags: ["#provision", "#abundance", "#city-transformation"],
        date: "2026-03-15",
        createdAt: new Date().toISOString(),
      },
      {
        id: "entry-3",
        title: "Prophetic Word — The Nkwo Principle",
        content: "Heard clearly: 'Nkwo means rest. On the seventh day, I rested. But My rest is not inactivity — it is dominion from a seated position. Teach My people to rest in authority, not strive in anxiety.'",
        spiritualState: "prophetic-word",
        tags: ["#rest", "#authority", "#sabbath"],
        date: "2026-04-01",
        createdAt: new Date().toISOString(),
      },
    ];
    saveEntries(entries);
  }
}