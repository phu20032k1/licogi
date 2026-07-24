"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { Bot, Building2, ChevronDown, LogIn, MapPinned, MessageCircle, Send, Sparkles, X } from "lucide-react";

type Message = { role: "assistant" | "user"; content: string };

const quickQuestions = ["Ngành hàng chính", "Địa chỉ liên hệ", "Xem bản đồ dự án", "Đăng nhập hệ thống"];

function answerFor(question: string) {
  const q = question.toLocaleLowerCase("vi");
  if (q.includes("ngành") || q.includes("lĩnh vực")) return "LICOGI 18.3 hoạt động trong các nhóm chính: công trình dân dụng và công nghiệp, hạ tầng kỹ thuật, giao thông, điện năng, vật liệu xây dựng, kết cấu kim loại và đầu tư dự án.";
  if (q.includes("địa chỉ") || q.includes("liên hệ") || q.includes("điện thoại")) return "Trụ sở: Số 98 Nguyễn Văn Linh, phường Mỹ Hào, tỉnh Hưng Yên. Điện thoại: (+84) 221.3942.550 / 551. Email: jsclicogi18.3@gmail.com.";
  if (q.includes("bản đồ") || q.includes("dự án")) return "Bạn kéo xuống mục Bản đồ dự án để xem dữ liệu được đồng bộ từ Trung tâm dữ liệu. Mỗi biểu tượng thể hiện loại công trình và màu thể hiện trạng thái dự án.";
  if (q.includes("đăng nhập") || q.includes("admin")) return "Nút Đăng nhập nằm ở góc trên bên phải. Sau khi đăng nhập, quản trị viên có thể import dữ liệu, quản lý dự án và xem bản đồ nội bộ.";
  if (q.includes("hồ sơ") || q.includes("năng lực")) return "Website mới ưu tiên chứng minh năng lực thực chiến qua dữ liệu dự án, bản đồ GIS, hình ảnh, video và hồ sơ năng lực số thay vì chỉ trình bày brochure tĩnh.";
  return "Tôi có thể hỗ trợ tra cứu nhanh về ngành hàng, thông tin liên hệ, bản đồ dự án, hồ sơ năng lực và cách đăng nhập hệ thống LICOGI 18.3.";
}

export default function PublicAIAssistant() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Xin chào! Tôi là trợ lý số LICOGI 18.3. Bạn cần tìm thông tin nào?" },
  ]);

  const lastThree = useMemo(() => messages.slice(-5), [messages]);

  function submit(text: string) {
    const clean = text.trim();
    if (!clean) return;
    setMessages((current) => [...current, { role: "user", content: clean }, { role: "assistant", content: answerFor(clean) }]);
    setInput("");
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    submit(input);
  }

  return (
    <div className="public-ai-wrap">
      {open ? <section className={`public-ai-panel ${minimized ? "is-minimized" : ""}`} aria-label="Trợ lý AI LICOGI 18.3">
        <header>
          <div className="public-ai-avatar"><Bot size={20} /></div>
          <div><strong>Trợ lý LICOGI AI</strong><span><i /> Sẵn sàng hỗ trợ</span></div>
          <button type="button" onClick={() => setMinimized((value) => !value)} aria-label="Thu gọn"><ChevronDown size={18} /></button>
          <button type="button" onClick={() => setOpen(false)} aria-label="Đóng"><X size={18} /></button>
        </header>
        {!minimized ? <>
          <div className="public-ai-messages">
            {lastThree.map((message, index) => <div key={`${message.role}-${index}`} className={`public-ai-message is-${message.role}`}>{message.content}</div>)}
          </div>
          <div className="public-ai-quick">
            {quickQuestions.map((question) => <button type="button" key={question} onClick={() => submit(question)}>{question}</button>)}
          </div>
          <form onSubmit={onSubmit}>
            <input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Nhập câu hỏi..." />
            <button type="submit" aria-label="Gửi"><Send size={17} /></button>
          </form>
          <div className="public-ai-footer"><Sparkles size={12} /> Trợ lý giới thiệu công khai · <Link href="/login">Vào hệ thống AI</Link></div>
        </> : null}
      </section> : null}

      {!open ? <button type="button" className="public-ai-launcher" onClick={() => setOpen(true)} aria-label="Mở trợ lý AI">
        <span className="public-ai-launcher-ring" />
        <MessageCircle size={25} />
        <span className="public-ai-launcher-label">Hỏi LICOGI AI</span>
      </button> : null}
    </div>
  );
}
