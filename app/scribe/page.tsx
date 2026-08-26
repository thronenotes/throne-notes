"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Feather, ChevronLeft, Maximize2, Minimize2, Save, FileText,
  Trash2, Plus, Download, Crown, BookOpen, Hash, Sparkles,
  Bold, Italic, Heading1, Heading2, Quote, List, Mic, MicOff, Loader2,
  CheckCircle, AlertCircle, StickyNote, Globe, Lock, DollarSign,
  Play, Pause, Volume2,
} from "lucide-react";
import { exportToPDF, exportToMarkdown } from "@/lib/export";
import { useAuth } from "@/lib/auth-context";

interface Book { id: string; title: string; status: string; slug?: string | null; priceDigital?: string | null; }
interface Chapter {
  id: string; bookId: string; title: string; content: string;
  status: string; sourceDreamId?: string; updatedAt: string;
}
interface Note {
  id: string;
  title: string | null;
  content: string;
  audioUrl?: string | null;
  audioDuration?: number | null;
  updatedAt: string;
}

type Tab = "books" | "notes";

export default function ScribeStudio() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<Tab>("books");

  // Books state
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [title, setTitle] = useState("");
  const [sermonMode, setSermonMode] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [showNewBook, setShowNewBook] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [newBookTitle, setNewBookTitle] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [creatingBook, setCreatingBook] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error" | "no-chapter">("idle");
  const [recording, setRecording] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishPrice, setPublishPrice] = useState("");
  const [publishingBookId, setPublishingBookId] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);

  // Notes state
  const [notesList, setNotesList] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [noteSaveStatus, setNoteSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [creatingNote, setCreatingNote] = useState(false);
  const noteAutoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const isNoteDirtyRef = useRef(false);

  // Voice note state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const voiceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/login";
      return;
    }
    if (user) {
      fetchBooks();
      fetchNotes();
    }
  }, [user, authLoading]);

  // ─── BOOKS ─────────────────────────────────────────────────────────

  const fetchBooks = async () => {
    try {
      const res = await fetch(`/api/books?userId=${user?.id || ""}`);
      if (res.ok) {
        const data = await res.json();
        const deduped = Array.isArray(data) ? data.filter((b: Book, i: number, arr: Book[]) => arr.findIndex(x => x.id === b.id) === i) : [];
        setBooks(deduped);
        if (deduped.length > 0) {
          setSelectedBookId(deduped[0].id);
          await fetchChapters(deduped[0].id);
          return;
        }
      }
    } catch (e) { console.error(e); }
    setPageLoading(false);
  };

  const fetchChapters = async (bookId: string) => {
    try {
      const res = await fetch(`/api/chapters?bookId=${bookId}`);
      if (res.ok) {
        const data = await res.json();
        setChapters(data);
        if (data.length > 0) {
          selectChapter(data[0]);
        } else {
          await createFirstChapter(bookId);
        }
      } else {
        setPageLoading(false);
      }
    } catch (e) { console.error(e); setPageLoading(false); }
  };

  const createFirstChapter = async (bookId: string) => {
    try {
      const res = await fetch("/api/chapters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId,
          title: "Chapter 1",
          content: "<p>Start writing your decree here...</p>",
          orderIndex: 0,
          status: "draft",
        }),
      });
      if (res.ok) {
        const newCh = await res.json();
        setChapters([newCh]);
        selectChapter(newCh);
      } else {
        setPageLoading(false);
      }
    } catch (e) {
      console.error(e);
      setPageLoading(false);
    }
  };

  const handleCreateBook = async () => {
    if (!newBookTitle.trim() || !user || creatingBook) return;
    if (books.some(b => b.title.toLowerCase() === newBookTitle.trim().toLowerCase())) {
      alert("A book with this title already exists.");
      return;
    }
    setCreatingBook(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newBookTitle.trim(),
          status: "draft",
          creatorId: user.id,
        }),
      });
      if (res.ok) {
        const newBook = await res.json();
        setBooks((prev) => [...prev, newBook]);
        setSelectedBookId(newBook.id);
        setNewBookTitle("");
        setShowNewBook(false);
        await createFirstChapter(newBook.id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCreatingBook(false);
    }
  };

  const handleDeleteBook = async (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this book and ALL its chapters permanently?")) return;
    try {
      const res = await fetch(`/api/books/${bookId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      const remainingBooks = books.filter((b) => b.id !== bookId);
      setBooks(remainingBooks);

      if (selectedBookId === bookId) {
        setChapters([]);
        setSelectedChapter(null);
        setTitle("");
        if (editorRef.current) editorRef.current.innerHTML = "";

        if (remainingBooks.length > 0) {
          setSelectedBookId(remainingBooks[0].id);
          await fetchChapters(remainingBooks[0].id);
        } else {
          setSelectedBookId("");
          setPageLoading(false);
        }
      }
    } catch (e) {
      console.error("Failed to delete book", e);
      alert("Failed to delete book. Try again.");
    }
  };

  const openPublishModal = (bookId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPublishingBookId(bookId);
    const book = books.find((b) => b.id === bookId);
    setPublishPrice(book?.priceDigital || "");
    setShowPublishModal(true);
  };

  const handlePublishBook = async () => {
    if (!publishingBookId) return;
    const price = publishPrice.trim() === "" ? "0" : publishPrice.trim();
    try {
      const res = await fetch(`/api/books/${publishingBookId}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ price }),
      });
      const data = await res.json();
      if (data.success) {
        setBooks((prev) =>
          prev.map((b) => (b.id === publishingBookId ? { ...b, status: "published", slug: data.slug, priceDigital: price } : b))
        );
        setShowPublishModal(false);
        setPublishingBookId("");
        setPublishPrice("");
        alert(`Published! View: https://thronenotes.com/books/${data.slug}`);
      }
    } catch (e) {
      console.error(e);
      alert("Publish failed.");
    }
  };

  const selectChapter = (chapter: Chapter) => {
    if (isDirtyRef.current && selectedChapter && editorRef.current) {
      doSave(selectedChapter.id, title, editorRef.current.innerHTML);
    }
    setSelectedChapter(chapter);
    setTitle(chapter.title);
    isDirtyRef.current = false;
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = chapter.content || "<p><br></p>";
      }
      setPageLoading(false);
    }, 0);
  };

  const doSave = async (chapterId: string, chapterTitle: string, html: string) => {
    if (!chapterId) return;
    setSaveStatus("saving");
    try {
      const res = await fetch(`/api/chapters/${chapterId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: html, title: chapterTitle }),
      });
      if (!res.ok) throw new Error("Save failed");
      setSaveStatus("saved");
      isDirtyRef.current = false;
      setTimeout(() => setSaveStatus("idle"), 2000);
    } catch (e) {
      console.error("Save failed", e);
      setSaveStatus("error");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }
  };

  const saveCurrent = useCallback(() => {
    if (!selectedChapter || !editorRef.current) {
      setSaveStatus("no-chapter");
      setTimeout(() => setSaveStatus("idle"), 3000);
      return;
    }
    doSave(selectedChapter.id, title, editorRef.current.innerHTML);
  }, [selectedChapter, title]);

  useEffect(() => {
    if (autoSaveRef.current) clearInterval(autoSaveRef.current);
    autoSaveRef.current = setInterval(() => {
      if (isDirtyRef.current && selectedChapter && editorRef.current) {
        doSave(selectedChapter.id, title, editorRef.current.innerHTML);
      }
    }, 30000);
    return () => { if (autoSaveRef.current) clearInterval(autoSaveRef.current); };
  }, [selectedChapter, title]);

  const handleCreateChapter = async () => {
    if (!newChapterTitle.trim() || !selectedBookId) return;
    const res = await fetch("/api/chapters", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookId: selectedBookId,
        title: newChapterTitle,
        content: "<p>Start writing your decree here...</p>",
        orderIndex: chapters.length,
        status: "draft",
      }),
    });
    if (res.ok) {
      const newCh = await res.json();
      setChapters((prev) => [...prev, newCh]);
      selectChapter(newCh);
      setNewChapterTitle("");
      setShowNewChapter(false);
    }
  };

  const handleDeleteChapter = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Delete this chapter permanently?")) return;
    try {
      const res = await fetch(`/api/chapters/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");

      const remaining = chapters.filter((c) => c.id !== id);
      setChapters(remaining);

      if (selectedChapter?.id === id) {
        if (remaining.length > 0) {
          selectChapter(remaining[0]);
        } else {
          setSelectedChapter(null);
          setTitle("");
          if (editorRef.current) editorRef.current.innerHTML = "";
          await createFirstChapter(selectedBookId);
        }
      }
    } catch (e) {
      console.error("Failed to delete chapter", e);
      alert("Failed to delete chapter. Try again.");
    }
  };

  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      editorRef.current.focus();
      isDirtyRef.current = true;
    }
  };

  const handleInput = () => {
    isDirtyRef.current = true;
  };

  const getStatusDot = (status: string) => {
    const colors: Record<string, string> = {
      draft: "#8A8A9A", editing: "#D4AF37", published: "#046307",
    };
    return colors[status] || "#8A8A9A";
  };

  const bookChapters = chapters.filter((c) => c.bookId === selectedBookId);

  // ─── NOTES ─────────────────────────────────────────────────────────

  const fetchNotes = async () => {
    try {
      const res = await fetch(`/api/notes?userId=${user?.id || ""}`);
      if (res.ok) {
        const data = await res.json();
        setNotesList(Array.isArray(data) ? data : []);
      }
    } catch (e) { console.error(e); }
  };

  const selectNote = (note: Note) => {
    if (isNoteDirtyRef.current && selectedNote) {
      doSaveNote(selectedNote.id, noteTitle, noteContent, audioUrl);
    }
    setSelectedNote(note);
    setNoteTitle(note.title || "");
    setNoteContent(note.content || "");
    setAudioUrl(note.audioUrl || null);
    setAudioPlaying(false);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    isNoteDirtyRef.current = false;
    setNoteSaveStatus("idle");
  };

  const doSaveNote = async (id: string, title: string, content: string, audio?: string | null) => {
    if (!id) return;
    setNoteSaveStatus("saving");
    try {
      const body: any = { title, content };
      if (audio !== undefined) body.audioUrl = audio;
      const res = await fetch(`/api/notes/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Save failed");
      setNoteSaveStatus("saved");
      isNoteDirtyRef.current = false;
      setNotesList((prev) => prev.map((n) => n.id === id ? { ...n, title, content, audioUrl: audio || n.audioUrl, updatedAt: new Date().toISOString() } : n));
      setTimeout(() => setNoteSaveStatus("idle"), 2000);
    } catch (e) {
      console.error(e);
      setNoteSaveStatus("idle");
    }
  };

  const saveCurrentNote = useCallback(() => {
    if (!selectedNote) return;
    doSaveNote(selectedNote.id, noteTitle, noteContent, audioUrl);
  }, [selectedNote, noteTitle, noteContent, audioUrl]);

  useEffect(() => {
    if (noteAutoSaveRef.current) clearTimeout(noteAutoSaveRef.current);
    noteAutoSaveRef.current = setTimeout(() => {
      if (isNoteDirtyRef.current && selectedNote) {
        doSaveNote(selectedNote.id, noteTitle, noteContent, audioUrl);
      }
    }, 5000);
    return () => { if (noteAutoSaveRef.current) clearTimeout(noteAutoSaveRef.current); };
  }, [noteTitle, noteContent, selectedNote, audioUrl]);

  const handleCreateNote = async () => {
    if (!user || creatingNote) return;
    setCreatingNote(true);
    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, title: "New Note", content: "" }),
      });
      if (res.ok) {
        const note = await res.json();
        setNotesList((prev) => [note, ...prev]);
        selectNote(note);
      }
    } catch (e) { console.error(e); }
    finally { setCreatingNote(false); }
  };

  const handleDeleteNote = async (id: string) => {
    if (!confirm("Delete this note?")) return;
    try {
      const res = await fetch(`/api/notes/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      setNotesList((prev) => prev.filter((n) => n.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
        setNoteTitle("");
        setNoteContent("");
        setAudioUrl(null);
        setAudioPlaying(false);
        if (audioPlayerRef.current) {
          audioPlayerRef.current.pause();
          audioPlayerRef.current = null;
        }
      }
    } catch (e) {
      console.error("Failed to delete note", e);
      alert("Failed to delete note. Try again.");
    }
  };

  // ─── VOICE RECORDING ───────────────────────────────────────────────

  const getSupportedMimeType = () => {
    const types = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/ogg;codecs=opus",
    ];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return undefined;
  };

  const startRecording = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert("Your browser does not support voice recording. Use Chrome, Edge, or Firefox.");
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = getSupportedMimeType();
      const mediaRecorder = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onerror = (e) => {
        console.error("MediaRecorder error:", e);
        alert("Recording error occurred. Try again.");
        setIsRecording(false);
        if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
      };

      mediaRecorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        if (audioChunksRef.current.length === 0) {
          alert("No audio captured. Try recording for at least 2 seconds.");
          return;
        }
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mimeType || "audio/webm",
        });
        await uploadAudio(audioBlob);
      };

      mediaRecorder.start(1000);
      setIsRecording(true);
      setRecordingTime(0);

      voiceTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Start recording failed:", err);
      if (err.name === "NotAllowedError") {
        alert("Microphone access denied. Click the lock icon in your browser address bar and allow microphone.");
      } else if (err.name === "NotFoundError") {
        alert("No microphone found. Connect a microphone and try again.");
      } else {
        alert("Could not start recording: " + err.message);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (voiceTimerRef.current) clearInterval(voiceTimerRef.current);
    }
  };

  const uploadAudio = async (blob: Blob) => {
    setNoteSaveStatus("saving");
    try {
      const ext = blob.type.includes("mp4") ? "mp4" : "webm";
      const file = new File([blob], `note-${Date.now()}.${ext}`, { type: blob.type });
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/upload/audio", { method: "POST", body: form });
      const data = await res.json();

      if (data.url) {
        setAudioUrl(data.url);
        if (selectedNote) {
          await doSaveNote(selectedNote.id, noteTitle, noteContent, data.url);
          setNotesList((prev) =>
            prev.map((n) =>
              n.id === selectedNote.id
                ? { ...n, audioUrl: data.url, updatedAt: new Date().toISOString() }
                : n
            )
          );
        }
      } else {
        alert("Upload failed: " + (data.error || "Unknown error"));
      }
    } catch (e) {
      console.error("Upload failed:", e);
      alert("Failed to upload voice note. Check your connection.");
      setNoteSaveStatus("idle");
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioUrl) return;
    if (!audioPlayerRef.current) {
      audioPlayerRef.current = new Audio(audioUrl);
      audioPlayerRef.current.onended = () => setAudioPlaying(false);
      audioPlayerRef.current.onerror = () => {
        alert("Could not play audio. The file may be corrupted.");
        setAudioPlaying(false);
      };
    }
    if (audioPlaying) {
      audioPlayerRef.current.pause();
      setAudioPlaying(false);
    } else {
      audioPlayerRef.current.play().catch((e) => {
        console.error("Playback failed:", e);
        alert("Could not play audio.");
      });
      setAudioPlaying(true);
    }
  };

  const deleteAudio = async () => {
    if (!selectedNote || !audioUrl) return;
    if (!confirm("Delete this voice recording?")) return;
    setAudioUrl(null);
    setAudioPlaying(false);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause();
      audioPlayerRef.current = null;
    }
    await doSaveNote(selectedNote.id, noteTitle, noteContent, null);
    setNotesList((prev) => prev.map((n) => (n.id === selectedNote.id ? { ...n, audioUrl: null } : n)));
  };

  // ─── RENDER ────────────────────────────────────────────────────────

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A0A0F" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#D4AF37" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0A0A0F" }}>
      {/* Top Bar */}
      <header className="border-b h-14 flex items-center px-4 justify-between shrink-0 z-40"
        style={{ backgroundColor: "rgba(20,20,30,0.8)", borderColor: "#2A2A3E", backdropFilter: "blur(8px)" }}>
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="flex items-center gap-2 transition-colors" style={{ color: "#8A8A9A" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#D4AF37")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#8A8A9A")}>
            <ChevronLeft className="w-4 h-4" />
            <Crown className="w-5 h-5" style={{ color: "#D4AF37" }} />
          </Link>
          <div className="h-6 w-px" style={{ backgroundColor: "#2A2A3E" }} />
          <h1 className="text-sm tracking-wider" style={{ color: "#D4AF37", fontFamily: "Cinzel, serif" }}>SCRIBE STUDIO</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex items-center rounded-lg border overflow-hidden" style={{ borderColor: "#2A2A3E" }}>
            <button onClick={() => setTab("books")}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={tab === "books" ? { backgroundColor: "rgba(212,175,55,0.15)", color: "#D4AF37" } : { color: "#8A8A9A" }}>
              <BookOpen className="w-3 h-3 inline mr-1.5" />Books
            </button>
            <button onClick={() => setTab("notes")}
              className="px-3 py-1.5 text-xs font-medium transition-colors"
              style={tab === "notes" ? { backgroundColor: "rgba(212,175,55,0.15)", color: "#D4AF37" } : { color: "#8A8A9A" }}>
              <StickyNote className="w-3 h-3 inline mr-1.5" />Quick Notes
            </button>
          </div>

          {tab === "books" && (
            <>
              {saveStatus === "idle" && selectedChapter && (
                <span className="text-xs hidden sm:inline" style={{ color: "#8A8A9A" }}>
                  {isDirtyRef.current ? "Unsaved changes" : "All changes saved"}
                </span>
              )}
              {saveStatus === "saving" && (
                <span className="text-xs flex items-center gap-1" style={{ color: "#D4AF37" }}>
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                </span>
              )}
              {saveStatus === "saved" && (
                <span className="text-xs flex items-center gap-1" style={{ color: "#046307" }}>
                  <CheckCircle className="w-3 h-3" /> Saved
                </span>
              )}
              {saveStatus === "error" && (
                <span className="text-xs flex items-center gap-1" style={{ color: "#8B0000" }}>
                  <AlertCircle className="w-3 h-3" /> Save failed
                </span>
              )}
              {saveStatus === "no-chapter" && (
                <span className="text-xs flex items-center gap-1" style={{ color: "#8B0000" }}>
                  <AlertCircle className="w-3 h-3" /> Create a book first
                </span>
              )}

              <button onClick={saveCurrent}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors border"
                style={{ backgroundColor: "rgba(212,175,55,0.1)", borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37" }}>
                <Save className="w-3.5 h-3.5" /> Save
              </button>

              <div className="relative">
                <button onClick={() => setShowExportMenu(!showExportMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors border"
                  style={{ backgroundColor: "rgba(75,0,130,0.1)", borderColor: "rgba(75,0,130,0.3)", color: "#4B0082" }}>
                  <Download className="w-3.5 h-3.5" /> Export
                </button>
                {showExportMenu && (
                  <div className="absolute right-0 top-full mt-1 w-40 rounded-lg shadow-xl z-50 overflow-hidden border"
                    style={{ backgroundColor: "#14141E", borderColor: "#2A2A3E" }}>
                    <button onClick={() => { if (editorRef.current) exportToPDF(title, editorRef.current.innerHTML); setShowExportMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center gap-2 hover:bg-[#1E1E2A]" style={{ color: "#F5F0E6" }}>
                      <FileText className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} /> Export as PDF
                    </button>
                    <button onClick={() => { if (editorRef.current) exportToMarkdown(title, editorRef.current.innerHTML); setShowExportMenu(false); }}
                      className="w-full text-left px-4 py-2.5 text-xs transition-colors flex items-center gap-2 hover:bg-[#1E1E2A]" style={{ color: "#F5F0E6" }}>
                      <Hash className="w-3.5 h-3.5" style={{ color: "#4B0082" }} /> Export as Markdown
                    </button>
                  </div>
                )}
              </div>
              <button onClick={() => setSermonMode(!sermonMode)} className="p-2 rounded-md transition-colors" style={{ color: "#8A8A9A" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1E1E2A"; e.currentTarget.style.color = "#D4AF37"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#8A8A9A"; }}>
                {sermonMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
            </>
          )}

          {tab === "notes" && (
            <>
              {noteSaveStatus === "saving" && (
                <span className="text-xs flex items-center gap-1" style={{ color: "#D4AF37" }}>
                  <Loader2 className="w-3 h-3 animate-spin" /> Saving...
                </span>
              )}
              {noteSaveStatus === "saved" && (
                <span className="text-xs flex items-center gap-1" style={{ color: "#046307" }}>
                  <CheckCircle className="w-3 h-3" /> Saved
                </span>
              )}
              <button onClick={saveCurrentNote}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-colors border"
                style={{ backgroundColor: "rgba(212,175,55,0.1)", borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37" }}>
                <Save className="w-3.5 h-3.5" /> Save
              </button>
            </>
          )}
        </div>
      </header>

      {/* BOOKS MODE */}
      {tab === "books" && (
        <div className="flex flex-1 overflow-hidden">
          {!sermonMode && (
            <aside className="w-64 border-r flex flex-col shrink-0" style={{ backgroundColor: "rgba(20,20,30,0.3)", borderColor: "#2A2A3E" }}>
              <div className="p-4 border-b" style={{ borderColor: "#2A2A3E" }}>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs tracking-wider" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>BOOKS</span>
                  <button onClick={() => setShowNewBook(!showNewBook)} className="p-1 rounded transition-colors" style={{ color: "#8A8A9A" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1E1E2A"; e.currentTarget.style.color = "#D4AF37"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#8A8A9A"; }}>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {showNewBook && (
                  <div className="mb-3 p-2 rounded-md border" style={{ backgroundColor: "#14141E", borderColor: "#2A2A3E" }}>
                    <input type="text" value={newBookTitle} onChange={(e) => setNewBookTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateBook()} placeholder="Book title..."
                      className="w-full bg-transparent text-xs outline-none mb-2" style={{ color: "#F5F0E6" }} autoFocus />
                    <div className="flex gap-2">
                      <button onClick={handleCreateBook} disabled={creatingBook}
                        className="px-2 py-1 rounded text-xs transition-colors disabled:opacity-40" style={{ backgroundColor: "rgba(212,175,55,0.2)", color: "#D4AF37" }}>
                        {creatingBook ? "Creating..." : "Create"}
                      </button>
                      <button onClick={() => { setShowNewBook(false); setNewBookTitle(""); }} className="px-2 py-1 rounded text-xs" style={{ color: "#8A8A9A" }}>Cancel</button>
                    </div>
                  </div>
                )}

                {books.length === 0 && !showNewBook && (
                  <p className="text-[11px] text-throne-text-muted mb-2">No books yet. Create your first manuscript.</p>
                )}

                <div className="space-y-1">
                  {books.map((book) => (
                    <div key={book.id} className="group relative">
                      <button
                        onClick={() => { setSelectedBookId(book.id); fetchChapters(book.id); }}
                        className="w-full text-left px-3 py-2 rounded-md text-xs transition-all flex items-center gap-2 pr-16"
                        style={selectedBookId === book.id ? { backgroundColor: "rgba(212,175,55,0.1)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.2)" } : { color: "#8A8A9A" }}
                        onMouseEnter={(e) => { if (selectedBookId !== book.id) { e.currentTarget.style.backgroundColor = "#1E1E2A"; e.currentTarget.style.color = "#F5F0E6"; } }}
                        onMouseLeave={(e) => { if (selectedBookId !== book.id) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#8A8A9A"; } }}>
                        <BookOpen className="w-3.5 h-3.5 shrink-0" /> 
                        <span className="truncate">{book.title}</span>
                        {book.status === "published" && (
                          <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded border" style={{ borderColor: "#04630730", color: "#046307" }}>
                            LIVE
                          </span>
                        )}
                      </button>

                      {/* Action buttons */}
                      <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        {book.status !== "published" && (
                          <button
                            onClick={(e) => openPublishModal(book.id, e)}
                            className="p-1 rounded text-[10px] font-bold transition-colors"
                            style={{ color: "#046307" }}
                            title="Publish book"
                            onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(4,99,7,0.15)"; }}
                            onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}>
                            PUBLISH
                          </button>
                        )}
                        <button
                          onClick={(e) => handleDeleteBook(book.id, e)}
                          className="p-1 rounded transition-colors"
                          style={{ color: "#8A8A9A" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(139,0,0,0.2)"; e.currentTarget.style.color = "#8B0000"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#8A8A9A"; }}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs tracking-wider" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>CHAPTERS</span>
                  <button onClick={() => setShowNewChapter(!showNewChapter)} className="p-1 rounded transition-colors" style={{ color: "#8A8A9A" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1E1E2A"; e.currentTarget.style.color = "#D4AF37"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#8A8A9A"; }}>
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {showNewChapter && (
                  <div className="mb-3 p-2 rounded-md border" style={{ backgroundColor: "#14141E", borderColor: "#2A2A3E" }}>
                    <input type="text" value={newChapterTitle} onChange={(e) => setNewChapterTitle(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleCreateChapter()} placeholder="Chapter title..."
                      className="w-full bg-transparent text-xs outline-none mb-2" style={{ color: "#F5F0E6" }} autoFocus />
                    <div className="flex gap-2">
                      <button onClick={handleCreateChapter} className="px-2 py-1 rounded text-xs transition-colors" style={{ backgroundColor: "rgba(212,175,55,0.2)", color: "#D4AF37" }}>Create</button>
                      <button onClick={() => { setShowNewChapter(false); setNewChapterTitle(""); }} className="px-2 py-1 rounded text-xs" style={{ color: "#8A8A9A" }}>Cancel</button>
                    </div>
                  </div>
                )}

                {bookChapters.length === 0 && books.length > 0 && (
                  <p className="text-[11px] text-throne-text-muted">No chapters yet.</p>
                )}

                <div className="space-y-1">
                  {bookChapters.map((chapter) => (
                    <button key={chapter.id} onClick={() => selectChapter(chapter)}
                      className="w-full text-left px-3 py-2.5 rounded-md text-xs transition-all group relative"
                      style={selectedChapter?.id === chapter.id ? { backgroundColor: "rgba(75,0,130,0.1)", color: "#F5F0E6", border: "1px solid rgba(75,0,130,0.2)" } : { color: "#8A8A9A" }}
                      onMouseEnter={(e) => { if (selectedChapter?.id !== chapter.id) { e.currentTarget.style.backgroundColor = "#1E1E2A"; e.currentTarget.style.color = "#F5F0E6"; } }}
                      onMouseLeave={(e) => { if (selectedChapter?.id !== chapter.id) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#8A8A9A"; } }}>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: getStatusDot(chapter.status) }} />
                        <span className="truncate">{chapter.title}</span>
                      </div>
                      {selectedChapter?.id === chapter.id && (
                        <button onClick={(e) => handleDeleteChapter(chapter.id, e)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 p-1 rounded transition-all" style={{ color: "#8A8A9A" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "rgba(139,0,0,0.2)"; e.currentTarget.style.color = "#8B0000"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#8A8A9A"; }}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          )}

          <main className={`flex-1 flex flex-col min-w-0 ${sermonMode ? "max-w-3xl mx-auto" : ""}`}>
            {selectedChapter?.sourceDreamId && !sermonMode && (
              <div className="px-6 py-3 flex items-center gap-2" style={{ backgroundColor: "rgba(75,0,130,0.05)", borderBottom: "1px solid rgba(75,0,130,0.2)" }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: "#4B0082" }} />
                <span className="text-xs" style={{ color: "#4B0082" }}>Revelation Source: Linked Dream</span>
              </div>
            )}

            <div className="px-6 pt-6 pb-2">
              <input type="text" value={title} onChange={(e) => { setTitle(e.target.value); isDirtyRef.current = true; }} placeholder="Untitled Chapter"
                className="w-full bg-transparent text-2xl outline-none" style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }} />
            </div>

            {!sermonMode && (
              <div className="px-6 py-2 flex items-center gap-1 border-b" style={{ borderColor: "#2A2A3E" }}>
                {[{ icon: Bold, cmd: "bold" }, { icon: Italic, cmd: "italic" }, { icon: Heading1, cmd: "formatBlock", val: "H1" }, { icon: Heading2, cmd: "formatBlock", val: "H2" }, { icon: Quote, cmd: "formatBlock", val: "BLOCKQUOTE" }, { icon: List, cmd: "insertUnorderedList" }].map((btn) => (
                  <button key={btn.cmd + (btn.val || "")} onClick={() => execCommand(btn.cmd, btn.val || "")}
                    className="p-1.5 rounded transition-colors" style={{ color: "#8A8A9A" }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1E1E2A"; e.currentTarget.style.color = "#D4AF37"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#8A8A9A"; }}>
                    <btn.icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {books.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <BookOpen className="w-10 h-10 mb-4" style={{ color: "#2A2A3E" }} />
                  <p className="text-sm text-throne-text-muted mb-2">No manuscript found.</p>
                  <p className="text-xs text-throne-text-muted mb-4">Create a book from the sidebar to start writing.</p>
                  <button onClick={() => setShowNewBook(true)}
                    className="px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                    style={{ backgroundColor: "#D4AF37", color: "#0A0A0F" }}>
                    Create First Book
                  </button>
                </div>
              ) : (
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  onInput={handleInput}
                  className="min-h-[60vh] outline-none"
                  style={{ color: "#F5F0E6", fontFamily: "Inter, sans-serif", lineHeight: 1.8, fontSize: "1.05rem" }}
                />
              )}
            </div>
          </main>

          {!sermonMode && (
            <aside className="w-64 border-l flex flex-col shrink-0" style={{ backgroundColor: "rgba(20,20,30,0.3)", borderColor: "#2A2A3E" }}>
              <div className="p-4 border-b" style={{ borderColor: "#2A2A3E" }}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-3.5 h-3.5" style={{ color: "#D4AF37" }} />
                  <span className="text-xs tracking-wider" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>NUMEROLOGY</span>
                </div>
                <div className="space-y-3">
                  {[{ label: "Personal Year", num: "7", color: "#D4AF37", desc: "Inner reflection. Study, meditate, withdraw to gain wisdom." }, { label: "Personal Month", num: "3", color: "#4B0082", desc: "Express creativity. Social activities bring joy now." }, { label: "Personal Day", num: "1", color: "#046307", desc: "A day for new starts. Take the lead." }].map((n) => (
                    <div key={n.label} className="p-3 rounded-lg border" style={{ backgroundColor: "#14141E", borderColor: "#2A2A3E" }}>
                      <div className="text-xs mb-1" style={{ color: "#8A8A9A" }}>{n.label}</div>
                      <div className="text-4xl" style={{ color: n.color, fontFamily: "Cinzel, serif" }}>{n.num}</div>
                      <div className="text-[10px] mt-1 leading-relaxed" style={{ color: "#8A8A9A" }}>{n.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-3.5 h-3.5" style={{ color: "#4B0082" }} />
                  <span className="text-xs tracking-wider" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>SCRIPTURE</span>
                </div>
                <div className="space-y-2">
                  {[{ ref: "1 Cor 4:20", text: "The kingdom of God is not in word, but in power." }, { ref: "Isaiah 6:1", text: "I saw the Lord sitting upon a throne, high and lifted up." }, { ref: "Rev 3:7", text: "What He opens, no one can shut." }].map((s) => (
                    <div key={s.ref} className="p-2.5 rounded-lg border transition-colors cursor-pointer group" style={{ backgroundColor: "#14141E", borderColor: "#2A2A3E" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#D4AF3750"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#2A2A3E"; }}>
                      <div className="text-[10px] mb-1" style={{ color: "#D4AF37", fontFamily: "Cinzel, serif" }}>{s.ref}</div>
                      <div className="text-[11px] leading-relaxed transition-colors group-hover:text-[#F5F0E6]" style={{ color: "#8A8A9A" }}>{s.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </aside>
          )}
        </div>
      )}

      {/* NOTES MODE */}
      {tab === "notes" && (
        <div className="flex flex-1 overflow-hidden">
          <aside className="w-72 border-r flex flex-col shrink-0" style={{ backgroundColor: "rgba(20,20,30,0.3)", borderColor: "#2A2A3E" }}>
            <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: "#2A2A3E" }}>
              <span className="text-xs tracking-wider" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>QUICK NOTES</span>
              <button onClick={handleCreateNote} disabled={creatingNote}
                className="p-1 rounded transition-colors disabled:opacity-40" style={{ color: "#8A8A9A" }}
                onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#1E1E2A"; e.currentTarget.style.color = "#D4AF37"; }}
                onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#8A8A9A"; }}>
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {notesList.length === 0 && (
                <p className="text-[11px] text-throne-text-muted p-2">No notes yet. Click + to create one.</p>
              )}
              {notesList.map((note) => (
                <button key={note.id} onClick={() => selectNote(note)}
                  className="w-full text-left p-3 rounded-lg border transition-all group relative"
                  style={selectedNote?.id === note.id ? { backgroundColor: "rgba(212,175,55,0.08)", borderColor: "rgba(212,175,55,0.25)", color: "#F5F0E6" } : { backgroundColor: "rgba(20,20,30,0.4)", borderColor: "#2A2A3E", color: "#8A8A9A" }}
                  onMouseEnter={(e) => { if (selectedNote?.id !== note.id) { e.currentTarget.style.backgroundColor = "#1E1E2A"; e.currentTarget.style.color = "#F5F0E6"; } }}
                  onMouseLeave={(e) => { if (selectedNote?.id !== note.id) { e.currentTarget.style.backgroundColor = "rgba(20,20,30,0.4)"; e.currentTarget.style.color = "#8A8A9A"; } }}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium truncate" style={{ color: selectedNote?.id === note.id ? "#F5F0E6" : "#8A8A9A" }}>
                      {note.title || "Untitled Note"}
                    </span>
                    <div className="flex items-center gap-1">
                      {note.audioUrl && <Volume2 className="w-3 h-3" style={{ color: "#D4AF37" }} />}
                      {selectedNote?.id === note.id && (
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteNote(note.id); }}
                          className="p-1 rounded opacity-0 group-hover:opacity-100 transition-all" style={{ color: "#8A8A9A" }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = "#8B0000"; }}>
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-[10px] line-clamp-2" style={{ color: "#8A8A9A" }}>{note.content || "No content"}</p>
                  {note.audioUrl && (
                    <span className="text-[9px] mt-1 inline-flex items-center gap-1" style={{ color: "#D4AF37" }}>
                      <Mic className="w-3 h-3" /> Voice note
                    </span>
                  )}
                  <p className="text-[9px] mt-1.5" style={{ color: "#5A5A6A" }}>
                    {new Date(note.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </button>
              ))}
            </div>
          </aside>

          <main className="flex-1 flex flex-col min-w-0">
            {selectedNote ? (
              <>
                <div className="px-6 pt-6 pb-2">
                  <input type="text" value={noteTitle} onChange={(e) => { setNoteTitle(e.target.value); isNoteDirtyRef.current = true; }}
                    placeholder="Note title..."
                    className="w-full bg-transparent text-xl outline-none" style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }} />
                </div>

                {/* Voice Recorder Bar */}
                <div className="px-6 py-2 flex items-center gap-3">
                  {!isRecording ? (
                    <button
                      onClick={startRecording}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors border"
                      style={{ backgroundColor: "rgba(139,0,0,0.1)", borderColor: "rgba(139,0,0,0.3)", color: "#8B0000" }}
                    >
                      <Mic className="w-3 h-3" /> Record Voice
                    </button>
                  ) : (
                    <button
                      onClick={stopRecording}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors border animate-pulse"
                      style={{ backgroundColor: "rgba(139,0,0,0.2)", borderColor: "#8B0000", color: "#fff" }}
                    >
                      <MicOff className="w-3 h-3" /> Stop ({Math.floor(recordingTime / 60)}:{String(recordingTime % 60).padStart(2, "0")})
                    </button>
                  )}

                  {audioUrl && !isRecording && (
                    <>
                      <button
                        onClick={toggleAudioPlayback}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[10px] font-bold transition-colors border"
                        style={{ backgroundColor: "rgba(212,175,55,0.1)", borderColor: "rgba(212,175,55,0.3)", color: "#D4AF37" }}
                      >
                        {audioPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                        {audioPlaying ? "Pause" : "Play"}
                      </button>
                      <button
                        onClick={deleteAudio}
                        className="p-1.5 rounded transition-colors"
                        style={{ color: "#8A8A9A" }}
                        title="Delete recording"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </>
                  )}
                </div>

                <div className="flex-1 overflow-y-auto px-6 py-4">
                  <textarea
                    value={noteContent}
                    onChange={(e) => { setNoteContent(e.target.value); isNoteDirtyRef.current = true; }}
                    placeholder="Write your thought, idea, or revelation..."
                    className="w-full h-full bg-transparent outline-none resize-none text-sm leading-relaxed"
                    style={{ color: "#F5F0E6", fontFamily: "Inter, sans-serif" }}
                  />
                </div>
                <div className="px-6 py-3 border-t flex items-center justify-between" style={{ borderColor: "#2A2A3E" }}>
                  <span className="text-[10px]" style={{ color: "#5A5A6A" }}>
                    {noteContent.split(/\s+/).filter((w) => w.length > 0).length} words
                  </span>
                  <span className="text-[10px]" style={{ color: "#5A5A6A" }}>
                    Auto-saves every 5 seconds
                  </span>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <StickyNote className="w-10 h-10 mb-4" style={{ color: "#2A2A3E" }} />
                <p className="text-sm text-throne-text-muted mb-2">Select a note or create a new one.</p>
                <button onClick={handleCreateNote}
                  className="px-4 py-2 rounded-lg text-xs font-bold transition-colors"
                  style={{ backgroundColor: "#D4AF37", color: "#0A0A0F" }}>
                  New Note
                </button>
              </div>
            )}
          </main>
        </div>
      )}

      {/* Publish Modal */}
      {showPublishModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: "rgba(10,10,15,0.8)", backdropFilter: "blur(8px)" }}>
          <div className="w-full max-w-md rounded-2xl border shadow-2xl p-6" style={{ backgroundColor: "#14141E", borderColor: "#2A2A3E" }}>
            <h2 className="text-sm mb-1" style={{ color: "#F5F0E6", fontFamily: "Cinzel, serif" }}>Publish Manuscript</h2>
            <p className="text-xs mb-5" style={{ color: "#8A8A9A" }}>Set a price or make it free for your readers.</p>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest mb-2 block" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>
                  Price (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#8A8A9A" }} />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={publishPrice}
                    onChange={(e) => setPublishPrice(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg border outline-none text-sm transition-colors"
                    style={{ backgroundColor: "#0A0A0F", borderColor: "#2A2A3E", color: "#F5F0E6" }}
                  />
                </div>
                <p className="text-[10px] mt-1.5" style={{ color: "#5A5A6A" }}>
                  Leave empty or 0 to make this book free.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-6">
              <button
                onClick={() => { setShowPublishModal(false); setPublishingBookId(""); setPublishPrice(""); }}
                className="px-4 py-2 rounded-lg text-xs transition-colors"
                style={{ color: "#8A8A9A" }}
              >
                Cancel
              </button>
              <button
                onClick={handlePublishBook}
                className="px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2"
                style={{ backgroundColor: "#046307", color: "#F5F0E6" }}
              >
                <Globe className="w-3.5 h-3.5" />
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      <button onClick={() => setRecording(!recording)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all z-50"
        style={{ backgroundColor: recording ? "#8B0000" : "#D4AF37", color: recording ? "#fff" : "#0A0A0F", boxShadow: recording ? "0 0 0 0 rgba(212,175,55,0.3)" : "0 4px 20px rgba(0,0,0,0.4)" }}>
        {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {showExportMenu && <div className="fixed inset-0 z-30" onClick={() => setShowExportMenu(false)} />}
    </div>
  );
}