"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  Feather, ChevronLeft, Maximize2, Minimize2, Save, FileText,
  Trash2, Plus, Download, Crown, BookOpen, Hash, Sparkles,
  Bold, Italic, Heading1, Heading2, Quote, List, Mic, MicOff, Loader2,
  CheckCircle, AlertCircle,
} from "lucide-react";
import { exportToPDF, exportToMarkdown } from "@/lib/export";
import { useAuth } from "@/lib/auth-context";

interface Book { id: string; title: string; status: string; }
interface Chapter {
  id: string; bookId: string; title: string; content: string;
  status: string; sourceDreamId?: string; updatedAt: string;
}

export default function ScribeStudio() {
  const { user, loading: authLoading } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [title, setTitle] = useState("");
  const [sermonMode, setSermonMode] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState("");
  const [selectedBookId, setSelectedBookId] = useState("");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [recording, setRecording] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const editorRef = useRef<HTMLDivElement>(null);
  const autoSaveRef = useRef<NodeJS.Timeout | null>(null);
  const isDirtyRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      window.location.href = "/login";
      return;
    }
    if (user) fetchBooks();
  }, [user, authLoading]);

  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/books");
      if (res.ok) {
        const data = await res.json();
        setBooks(data);
        if (data.length > 0) {
          setSelectedBookId(data[0].id);
          await fetchChapters(data[0].id);
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
          setPageLoading(false);
        }
      } else {
        setPageLoading(false);
      }
    } catch (e) { console.error(e); setPageLoading(false); }
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
    if (!selectedChapter || !editorRef.current) return;
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
    await fetch(`/api/chapters/${id}`, { method: "DELETE" });
    const remaining = chapters.filter((c) => c.id !== id);
    setChapters(remaining);
    if (selectedChapter?.id === id) {
      if (remaining.length > 0) {
        selectChapter(remaining[0]);
      } else {
        setSelectedChapter(null);
        setTitle("");
        if (editorRef.current) editorRef.current.innerHTML = "";
      }
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

  if (authLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#0A0A0F" }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#D4AF37" }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#0A0A0F" }}>
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
          {saveStatus === "idle" && selectedChapter && (
            <span className="text-xs" style={{ color: "#8A8A9A" }}>
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
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {!sermonMode && (
          <aside className="w-64 border-r flex flex-col shrink-0" style={{ backgroundColor: "rgba(20,20,30,0.3)", borderColor: "#2A2A3E" }}>
            <div className="p-4 border-b" style={{ borderColor: "#2A2A3E" }}>
              <span className="text-xs tracking-wider block mb-3" style={{ color: "#8A8A9A", fontFamily: "Cinzel, serif" }}>BOOKS</span>
              <div className="space-y-1">
                {books.map((book) => (
                  <button key={book.id} onClick={() => { setSelectedBookId(book.id); fetchChapters(book.id); }}
                    className="w-full text-left px-3 py-2 rounded-md text-xs transition-all flex items-center gap-2"
                    style={selectedBookId === book.id ? { backgroundColor: "rgba(212,175,55,0.1)", color: "#D4AF37", border: "1px solid rgba(212,175,55,0.2)" } : { color: "#8A8A9A" }}
                    onMouseEnter={(e) => { if (selectedBookId !== book.id) { e.currentTarget.style.backgroundColor = "#1E1E2A"; e.currentTarget.style.color = "#F5F0E6"; } }}
                    onMouseLeave={(e) => { if (selectedBookId !== book.id) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#8A8A9A"; } }}>
                    <BookOpen className="w-3.5 h-3.5" /> {book.title}
                  </button>
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
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              onInput={handleInput}
              className="min-h-[60vh] outline-none"
              style={{ color: "#F5F0E6", fontFamily: "Inter, sans-serif", lineHeight: 1.8, fontSize: "1.05rem" }}
            />
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

      <button onClick={() => setRecording(!recording)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all z-50"
        style={{ backgroundColor: recording ? "#8B0000" : "#D4AF37", color: recording ? "#fff" : "#0A0A0F", boxShadow: recording ? "0 0 0 0 rgba(212,175,55,0.3)" : "0 4px 20px rgba(0,0,0,0.4)" }}>
        {recording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
      </button>

      {showExportMenu && <div className="fixed inset-0 z-30" onClick={() => setShowExportMenu(false)} />}
    </div>
  );
}