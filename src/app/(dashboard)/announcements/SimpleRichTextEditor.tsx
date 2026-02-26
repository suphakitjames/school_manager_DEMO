"use client";

import { Bold, Italic, List, Link as LinkIcon } from "lucide-react";

export function SimpleRichTextEditor({ 
  value, 
  onChange 
}: { 
  value: string; 
  onChange: (val: string) => void;
}) {
  const insertText = (before: string, after: string = "") => {
    const textarea = document.getElementById("announcement-content") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = value.substring(start, end);
    const replacement = before + selected + after;
    
    onChange(value.substring(0, start) + replacement + value.substring(end));
    
    // Restore focus and cursor
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const insertLink = () => {
    const url = prompt("กรุณาระบุ URL (เช่น https://google.com):");
    if (url) {
      insertText(`[`, `](${url})`);
    } else {
      insertText("[", "](url)");
    }
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-white focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500 transition-all">
      <div className="flex items-center gap-1 p-2 bg-slate-50 border-b border-slate-200">
        <button 
          type="button" 
          onClick={() => insertText("**", "**")}
          className="p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded transition-colors"
          title="ตัวหนา"
        >
          <Bold className="w-4 h-4" />
        </button>
        <button 
          type="button" 
          onClick={() => insertText("*", "*")}
          className="p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded transition-colors"
          title="ตัวเอียง"
        >
          <Italic className="w-4 h-4" />
        </button>
        <div className="w-px h-4 bg-slate-300 mx-1"></div>
        <button 
          type="button" 
          onClick={() => insertText("- ")}
          className="p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded transition-colors"
          title="รายการ"
        >
          <List className="w-4 h-4" />
        </button>
        <button 
          type="button" 
          onClick={insertLink}
          className="p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-800 rounded transition-colors"
          title="แทรกลิงก์"
        >
          <LinkIcon className="w-4 h-4" />
        </button>
      </div>
      <textarea 
        id="announcement-content"
        value={value} 
        onChange={e => onChange(e.target.value)}
        rows={6} 
        className="w-full px-4 py-3 text-sm focus:outline-none resize-none"
        placeholder="พิมพ์เนื้อหาประกาศ... (สามารถใช้ Markdown ได้ หรือกดปุ่มด้านบนเพื่อจัดรูปแบบ)"
      />
    </div>
  );
}

// Helper to render basic markdown-like syntax
export function renderRichText(text: string) {
  if (!text) return null;
  
  // 1. Links: [text](url)
  let html = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" class="text-indigo-600 hover:underline inline-flex items-center gap-1">$1 <svg class="w-3 h-3 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>');
  
  // 2. Bold: **text**
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  
  // 3. Italic: *text*
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  
  // 4. Bullets: - text
  html = html.replace(/^- (.*)$/gm, '<li class="ml-4 list-disc">$1</li>');
  
  // 5. Line breaks
  html = html.replace(/\n/g, '<br/>');

  return (
    <div 
      className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed" 
      dangerouslySetInnerHTML={{ __html: html }} 
    />
  );
}
