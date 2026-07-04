"use client";

import { useState, useEffect, useRef } from "react";
import { Upload, Plus, Trash2, Edit, Loader2, Crown, Shield, Search, CheckSquare, Square, FileText, Copy, Check, X } from "lucide-react";
import { upload } from '@vercel/blob/client';
import Link from "next/link";

type ExamSummary = {
  id: string;
  title: string;
  level: string;
  accessLevel: string;
  planIds?: string[];
  createdAt: string;
  _count: { histories: number };
};

export default function AdminExamsPage() {
  const [exams, setExams] = useState<ExamSummary[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [accessFilter, setAccessFilter] = useState("ALL");

  // Bulk Edit State
  const [selectedExamIds, setSelectedExamIds] = useState<string[]>([]);
  const [bulkAccessLevel, setBulkAccessLevel] = useState<string>("");
  const [bulkPlanIds, setBulkPlanIds] = useState<string[]>([]);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Single Edit Plan Modal
  const [showPlanModal, setShowPlanModal] = useState<{ examId: string, planIds: string[] } | null>(null);

  // Prompt Modal
  const [showPromptModal, setShowPromptModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Create Modal (Paste JSON & Upload Audio)
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createLevel, setCreateLevel] = useState("N3");
  const [createAccessLevel, setCreateAccessLevel] = useState("FREE");
  const [createPlanIds, setCreatePlanIds] = useState<string[]>([]);
  const [createJsonText, setCreateJsonText] = useState("");
  const [createAudioFile, setCreateAudioFile] = useState<File | null>(null);
  const [creating, setCreating] = useState(false);
  const createAudioInputRef = useRef<HTMLInputElement>(null);

  // Custom Toast state
  const [toastMsg, setToastMsg] = useState<{ type: 'success'|'error', text: string } | null>(null);

  const showToast = (type: 'success'|'error', text: string) => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const promptText = `Xin chào, hãy đóng vai một chuyên gia giáo dục tiếng Nhật và xử lý dữ liệu thô của đề thi JLPT mà tôi cung cấp dưới đây. 
Nhiệm vụ của bạn là chuyển đổi dữ liệu thô đó thành một tệp JSON tuân thủ đúng định dạng (schema) sau đây:

\`\`\`json
{
  "level": "N3",
  "title": "Đề thi JLPT N3 - Tháng 12/2023",
  "accessLevel": "FREE",
  "planIds": [],
  "metadata": {
    "exam": "JLPT",
    "level": "N3",
    "year": 2023,
    "session": "December",
    "total_questions": 105,
    "time_limit_minutes": {
      "vocabulary_grammar_reading": 105,
      "listening": 40
    }
  },
  "sections": [
    {
      "section_id": "sec_1",
      "name": "Từ vựng - Kanji",
      "mondai": [
        {
          "mondai_id": "m_1",
          "title": "Mondai 1",
          "instruction": "Chọn cách đọc đúng của chữ Hán được gạch chân.",
          "questions": [
            {
              "question_id": "q_01",
              "number": 1,
              "question": "この漢字の読み方は何ですか。",
              "choices": [
                "A. あ",
                "B. い",
                "C. う",
                "D. え"
              ],
              "correct_answer": 1,
              "answer_explanation": "Giải thích lý do chọn đáp án 1."
            }
          ]
        }
      ]
    }
  ]
}
\`\`\`

Lưu ý quan trọng:
- Bắt buộc dùng mảng "mondai" thay vì "parts".
- Trong mỗi câu hỏi, dùng "question_id" (chuỗi), "number" (số), "question" (chuỗi).
- correct_answer bắt đầu từ 1 (A=1, B=2, C=3, D=4).
- Giải thích chi tiết điền vào field "answer_explanation".
- Chỉ trả về duy nhất chuỗi JSON hợp lệ, không kèm văn bản nào khác.

Dữ liệu thô:
[DÁN DỮ LIỆU ĐỀ THI CỦA BẠN VÀO ĐÂY]`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(promptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchData = async () => {
    try {
      const [examsRes, plansRes] = await Promise.all([
        fetch("/api/admin/exams"),
        fetch("/api/admin/plans")
      ]);
      if (examsRes.ok) setExams(await examsRes.json());
      if (plansRes.ok) setPlans(await plansRes.json());
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      const res = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Upload failed");
      }

      showToast("success", "Tải lên đề thi thành công!");
      fetchData();
    } catch (err: any) {
      showToast("error", "Lỗi: " + err.message);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleCreateExam = async () => {
    if (!createJsonText.trim()) {
      showToast("error", "Vui lòng dán nội dung JSON của đề thi!");
      return;
    }

    setCreating(true);
    try {
      let parsedJson;
      try {
        parsedJson = JSON.parse(createJsonText);
      } catch (err) {
        showToast("error", "Lỗi cú pháp JSON. Vui lòng kiểm tra lại!");
        setCreating(false);
        return;
      }

      // Upload Audio via Vercel Blob first
      if (createAudioFile) {
        try {
          const newBlob = await upload(createAudioFile.name, createAudioFile, {
            access: 'public',
            handleUploadUrl: '/api/upload',
          });
          
          parsedJson.metadata = parsedJson.metadata || {};
          parsedJson.metadata.audioUrl = newBlob.url;
        } catch (uploadErr: any) {
          showToast("error", "Lỗi upload Audio: " + uploadErr.message + "\n(Cần cấu hình Vercel Blob)");
          setCreating(false);
          return;
        }
      }

      // Bước 1: Tạo đề thi bằng JSON
      const payload = {
        ...parsedJson,
        level: createLevel,
        accessLevel: createAccessLevel,
        planIds: createPlanIds
      };
      if (createTitle.trim()) {
        payload.title = createTitle.trim();
      }

      const resExam = await fetch("/api/admin/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resExam.ok) {
        const err = await resExam.json();
        throw new Error(err.error || "Lỗi tạo đề thi");
      }

      const createdExam = await resExam.json();
      const examId = createdExam.id;

      // Bước 2: Upload Audio (nếu có)
      if (createAudioFile) {
        const resAudio = await fetch(`/api/admin/exams/${examId}/audio`, {
          method: "POST",
          headers: {
            "Content-Type": createAudioFile.type || "application/octet-stream",
            "X-File-Name": encodeURIComponent(createAudioFile.name),
          },
          body: createAudioFile,
        });

        if (!resAudio.ok) {
          const err = await resAudio.json();
          throw new Error("Tạo đề thành công nhưng lỗi tải audio: " + err.error);
        }

        const audioData = await resAudio.json();
        
        // Bước 3: Cập nhật JSON với đường dẫn audio mới
        parsedJson.metadata = parsedJson.metadata || {};
        parsedJson.metadata.audioUrl = audioData.url;

        await fetch(`/api/admin/exams/${examId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: createdExam.title,
            level: createdExam.level,
            accessLevel: createdExam.accessLevel,
            planIds: createdExam.planIds,
            metadata: parsedJson.metadata,
            sections: parsedJson.sections
          })
        });
      }

      showToast("success", "Tạo đề thi thành công!");
      setShowCreateModal(false);
      setCreateJsonText("");
      setCreateAudioFile(null);
      fetchData();
    } catch (err: any) {
      showToast("error", "Lỗi: " + err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa đề thi này không? Hành động này không thể hoàn tác.")) return;

    try {
      const res = await fetch(`/api/admin/exams/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      
      showToast("success", "Xóa thành công!");
      fetchData();
      setSelectedExamIds(prev => prev.filter(eid => eid !== id));
    } catch (err: any) {
      showToast("error", "Lỗi xóa: " + err.message);
    }
  };

  const handleQuickUpdate = async (id: string, updates: Partial<ExamSummary>) => {
    // Optimistic update
    setExams(prev => prev.map(ex => ex.id === id ? { ...ex, ...updates } : ex));
    
    try {
      const res = await fetch(`/api/admin/exams/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates)
      });
      
      if (!res.ok) throw new Error("Update failed");
      showToast("success", "Cập nhật thành công!");
    } catch (error) {
      showToast("error", "Lỗi cập nhật. Vui lòng thử lại!");
      fetchData(); // Revert back
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedExamIds.length === 0) return;
    if (!bulkAccessLevel) {
      showToast("error", "Vui lòng chọn Quyền truy cập mới!");
      return;
    }

    setBulkUpdating(true);
    try {
      const res = await fetch("/api/admin/exams/bulk", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          examIds: selectedExamIds,
          accessLevel: bulkAccessLevel,
          planIds: bulkAccessLevel === "PREMIUM" ? bulkPlanIds : []
        })
      });

      if (!res.ok) throw new Error("Bulk update failed");

      showToast("success", "Cập nhật hàng loạt thành công!");
      setSelectedExamIds([]);
      setBulkAccessLevel("");
      setBulkPlanIds([]);
      fetchData();
    } catch (err: any) {
      showToast("error", "Lỗi cập nhật hàng loạt: " + err.message);
    } finally {
      setBulkUpdating(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedExamIds.length === filteredExams.length) {
      setSelectedExamIds([]);
    } else {
      setSelectedExamIds(filteredExams.map(e => e.id));
    }
  };

  const toggleSelectExam = (id: string) => {
    setSelectedExamIds(prev => 
      prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
    );
  };

  const toggleBulkPlan = (planId: string) => {
    setBulkPlanIds(prev => 
      prev.includes(planId) ? prev.filter(pid => pid !== planId) : [...prev, planId]
    );
  };

  const saveSinglePlanModal = () => {
    if (showPlanModal) {
      handleQuickUpdate(showPlanModal.examId, { accessLevel: "PREMIUM", planIds: showPlanModal.planIds });
      setShowPlanModal(null);
    }
  };

  const filteredExams = exams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === "ALL" || exam.level === levelFilter;
    const matchesAccess = accessFilter === "ALL" || exam.accessLevel === accessFilter;
    return matchesSearch && matchesLevel && matchesAccess;
  });

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-24 relative">
      {/* Toast Notification */}
      {toastMsg && (
        <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl font-bold animate-in slide-in-from-right-8 fade-in duration-300 ${
          toastMsg.type === 'success' 
            ? 'bg-emerald-500 text-white shadow-emerald-500/25' 
            : 'bg-rose-500 text-white shadow-rose-500/25'
        }`}>
          {toastMsg.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          {toastMsg.text}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black mb-2">Quản lý Đề thi</h1>
          <p className="text-foreground/60">Upload đề thi mới hoặc cấu hình phân quyền hàng loạt.</p>
        </div>

        <input 
          type="file" 
          accept=".json" 
          className="hidden" 
          ref={fileInputRef} 
          onChange={handleFileUpload}
        />
        <div className="flex gap-3">
          <button 
            onClick={() => setShowPromptModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-foreground/5 hover:bg-foreground/10 text-foreground font-bold rounded-xl border border-foreground/10 transition-colors"
          >
            <FileText className="w-5 h-5" />
            Prompt tạo Đề
          </button>
          
          <button 
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-6 py-3 bg-foreground/5 hover:bg-foreground/10 text-foreground font-bold rounded-xl border border-foreground/10 transition-colors disabled:opacity-50"
          >
            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
            {uploading ? "Đang xử lý..." : "Tải lên JSON"}
          </button>
          
          <button 
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Tạo Đề Mới
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-2">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/40" />
          <input 
            type="text" 
            placeholder="Tìm kiếm tên đề thi..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-card/50 backdrop-blur-xl border border-border focus:border-indigo-500 outline-none transition-colors font-medium"
          />
        </div>
        <select 
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-card/50 backdrop-blur-xl border border-border focus:border-indigo-500 outline-none transition-colors appearance-none font-bold md:w-40"
        >
          <option value="ALL">Tất cả cấp độ</option>
          <option value="N1">N1</option>
          <option value="N2">N2</option>
          <option value="N3">N3</option>
          <option value="N4">N4</option>
          <option value="N5">N5</option>
        </select>
        <select 
          value={accessFilter}
          onChange={(e) => setAccessFilter(e.target.value)}
          className="px-4 py-3 rounded-xl bg-card/50 backdrop-blur-xl border border-border focus:border-indigo-500 outline-none transition-colors appearance-none font-bold md:w-48"
        >
          <option value="ALL">Tất cả quyền</option>
          <option value="FREE">Miễn phí</option>
          <option value="LOGIN">Đăng nhập</option>
          <option value="PREMIUM">Premium</option>
        </select>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border rounded-[2rem] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-foreground/5">
                <th className="p-4 w-12 text-center">
                  <button onClick={toggleSelectAll} className="text-foreground/50 hover:text-indigo-500">
                    {selectedExamIds.length > 0 && selectedExamIds.length === filteredExams.length ? <CheckSquare className="w-5 h-5 text-indigo-500" /> : <Square className="w-5 h-5" />}
                  </button>
                </th>
                <th className="p-4 font-bold text-foreground/80">Tựa đề</th>
                <th className="p-4 font-bold text-foreground/80">Cấp độ</th>
                <th className="p-4 font-bold text-foreground/80">Phân quyền</th>
                <th className="p-4 font-bold text-foreground/80">Lượt thi</th>
                <th className="p-4 font-bold text-foreground/80 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-foreground/60">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : exams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-foreground/60">
                    Chưa có đề thi nào trong hệ thống.
                  </td>
                </tr>
              ) : filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-foreground/60">
                    Không tìm thấy đề thi nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className={`border-b border-border/50 hover:bg-foreground/5 transition-colors ${selectedExamIds.includes(exam.id) ? 'bg-indigo-500/5' : ''}`}>
                    <td className="p-4 text-center">
                      <button onClick={() => toggleSelectExam(exam.id)} className="text-foreground/50 hover:text-indigo-500">
                        {selectedExamIds.includes(exam.id) ? <CheckSquare className="w-5 h-5 text-indigo-500" /> : <Square className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="p-4 font-semibold">{exam.title}</td>
                    <td className="p-4">
                      <select 
                        value={exam.level}
                        onChange={(e) => handleQuickUpdate(exam.id, { level: e.target.value })}
                        className="px-3 py-1 bg-indigo-500/10 text-indigo-500 rounded-lg text-sm font-bold border border-indigo-500/20 outline-none appearance-none cursor-pointer hover:bg-indigo-500/20 transition-colors"
                      >
                        <option value="N1">N1</option>
                        <option value="N2">N2</option>
                        <option value="N3">N3</option>
                        <option value="N4">N4</option>
                        <option value="N5">N5</option>
                      </select>
                    </td>
                    <td className="p-4 flex items-center gap-2">
                      <select 
                        value={exam.accessLevel}
                        onChange={(e) => {
                          if (e.target.value === "PREMIUM") {
                            setShowPlanModal({ examId: exam.id, planIds: exam.planIds || [] });
                          } else {
                            handleQuickUpdate(exam.id, { accessLevel: e.target.value, planIds: [] });
                          }
                        }}
                        className={`px-3 py-1 rounded-lg text-sm font-bold border outline-none appearance-none cursor-pointer transition-colors ${
                          exam.accessLevel === "FREE" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20" :
                          exam.accessLevel === "LOGIN" ? "bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/20" :
                          "bg-amber-500/10 text-amber-500 border-amber-500/20 hover:bg-amber-500/20"
                        }`}
                      >
                        <option value="FREE">Miễn phí</option>
                        <option value="LOGIN">Đăng nhập</option>
                        <option value="PREMIUM">Premium (Gói)</option>
                      </select>
                      
                      {exam.accessLevel === "PREMIUM" && (
                        <button 
                          onClick={() => setShowPlanModal({ examId: exam.id, planIds: exam.planIds || [] })}
                          className="text-xs font-bold text-amber-500 hover:underline flex items-center gap-1"
                        >
                          <Crown className="w-3 h-3"/> {exam.planIds?.length || 0} Gói
                        </button>
                      )}
                    </td>
                    <td className="p-4 text-foreground/60 font-medium">
                      {exam._count.histories} lượt
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/exams/${exam.id}/edit`}>
                          <button className="p-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-500 rounded-lg transition-colors" title="Sửa đề thi">
                            <Edit className="w-4 h-4" />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(exam.id)}
                          className="p-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 rounded-lg transition-colors" 
                          title="Xóa đề thi"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bulk Update Action Bar */}
      {selectedExamIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-card border border-indigo-500/30 shadow-[0_10px_40px_-10px_rgba(99,102,241,0.5)] p-4 rounded-2xl flex flex-col md:flex-row items-center gap-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-300">
          <div className="font-bold text-indigo-500 bg-indigo-500/10 px-4 py-2 rounded-xl">
            Đã chọn {selectedExamIds.length} đề thi
          </div>
          
          <div className="flex items-center gap-3 border-l border-border pl-4">
            <select 
              value={bulkAccessLevel}
              onChange={(e) => setBulkAccessLevel(e.target.value)}
              className="px-4 py-2 rounded-xl bg-foreground/5 border border-border outline-none focus:border-indigo-500 font-bold"
            >
              <option value="">-- Chọn Quyền --</option>
              <option value="FREE">Miễn phí</option>
              <option value="LOGIN">Đăng nhập</option>
              <option value="PREMIUM">Premium (Theo Gói)</option>
            </select>

            {bulkAccessLevel === "PREMIUM" && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Chọn Gói:</span>
                <div className="flex gap-2">
                  {plans.map(p => (
                    <button
                      key={p.id}
                      onClick={() => toggleBulkPlan(p.id)}
                      className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                        bulkPlanIds.includes(p.id) ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' : 'bg-foreground/5 border-transparent text-foreground/60 hover:bg-foreground/10'
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button 
              onClick={handleBulkUpdate}
              disabled={bulkUpdating || !bulkAccessLevel || (bulkAccessLevel === 'PREMIUM' && bulkPlanIds.length === 0)}
              className="px-6 py-2 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 disabled:opacity-50 transition-colors flex items-center gap-2 ml-2"
            >
              {bulkUpdating && <Loader2 className="w-4 h-4 animate-spin" />}
              Áp dụng
            </button>
          </div>
        </div>
      )}

      {/* Single Edit Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background border border-border p-6 rounded-[2rem] max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black mb-4 flex items-center gap-2"><Crown className="w-6 h-6 text-amber-500"/> Chọn Gói Cước</h3>
            <p className="text-sm text-foreground/60 mb-4">Tick chọn các gói cước được phép truy cập đề thi này.</p>
            
            <div className="flex flex-col gap-3 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {plans.map(p => (
                <label key={p.id} className="flex items-center gap-3 p-3 rounded-xl border border-border cursor-pointer hover:bg-foreground/5 transition-colors">
                  <input 
                    type="checkbox" 
                    checked={showPlanModal.planIds.includes(p.id)}
                    onChange={(e) => {
                      const newIds = e.target.checked 
                        ? [...showPlanModal.planIds, p.id] 
                        : showPlanModal.planIds.filter(id => id !== p.id);
                      setShowPlanModal({ ...showPlanModal, planIds: newIds });
                    }}
                    className="w-5 h-5 accent-amber-500"
                  />
                  <span className="font-bold">{p.name}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setShowPlanModal(null)} className="flex-1 py-3 bg-foreground/10 font-bold rounded-xl hover:bg-foreground/20">Hủy</button>
              <button onClick={saveSinglePlanModal} className="flex-1 py-3 bg-amber-500 text-white font-bold rounded-xl hover:bg-amber-600">Lưu lại</button>
            </div>
          </div>
        </div>
      )}

      {/* Prompt Helper Modal */}
      {showPromptModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background border border-border p-6 rounded-[2rem] max-w-3xl w-full shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black flex items-center gap-2">
                <FileText className="w-6 h-6 text-indigo-500"/> Prompt Mẫu tạo JSON Đề thi
              </h3>
              <button onClick={() => setShowPromptModal(false)} className="p-2 hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-foreground/60 mb-4">
              Hãy sao chép Prompt này và dán vào ChatGPT hoặc Claude cùng với nội dung đề thi (file Word/PDF dạng text) để AI tự động chuyển đổi thành cấu trúc JSON chuẩn của hệ thống.
            </p>
            
            <div className="flex-1 overflow-auto bg-foreground/5 border border-border rounded-xl p-4 mb-6 relative group">
              <button 
                onClick={copyToClipboard}
                className="absolute top-4 right-4 p-2 bg-background border border-border rounded-lg shadow-sm hover:bg-foreground/5 transition-colors flex items-center gap-2"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4 text-foreground/70" />}
                <span className="text-xs font-bold">{copied ? "Đã chép!" : "Sao chép"}</span>
              </button>
              <pre className="text-xs md:text-sm font-mono whitespace-pre-wrap break-words text-foreground/80 mt-8">
                {promptText}
              </pre>
            </div>

            <div className="flex justify-end gap-3 mt-auto">
              <button onClick={() => setShowPromptModal(false)} className="px-6 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors">
                Đã hiểu & Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Exam Modal (Paste JSON & Audio & Config) */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-background border border-border p-6 rounded-[2rem] max-w-[1400px] w-full shadow-2xl flex flex-col max-h-[95vh]">
            <div className="flex justify-between items-center mb-4 shrink-0">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Plus className="w-6 h-6 text-indigo-500"/> Tạo Đề Thi Nhanh
              </h3>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-foreground/10 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm text-foreground/60 mb-6 shrink-0">
              Cấu hình thông tin đề thi, đính kèm file Audio (nếu có), và dán nội dung JSON.
            </p>
            
            <div className="flex-1 overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-0">
              {/* Left Column: Config */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="p-5 bg-card border border-border rounded-2xl flex flex-col gap-4 shadow-sm">
                  <h4 className="font-bold text-lg border-b border-border/50 pb-2">Thông tin cơ bản</h4>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-foreground/80">Tên đề thi (để trống sẽ lấy từ JSON)</label>
                    <input 
                      type="text" 
                      value={createTitle}
                      onChange={(e) => setCreateTitle(e.target.value)}
                      placeholder="VD: Đề thi JLPT N3 - Tháng 12/2023"
                      className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none transition-colors font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/80">Cấp độ</label>
                      <select 
                        value={createLevel}
                        onChange={(e) => setCreateLevel(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none transition-colors font-semibold appearance-none"
                      >
                        <option value="N1">N1</option>
                        <option value="N2">N2</option>
                        <option value="N3">N3</option>
                        <option value="N4">N4</option>
                        <option value="N5">N5</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-bold text-foreground/80">Truy cập</label>
                      <select 
                        value={createAccessLevel}
                        onChange={(e) => setCreateAccessLevel(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-background border border-border focus:border-indigo-500 outline-none transition-colors font-semibold appearance-none"
                      >
                        <option value="FREE">Miễn phí</option>
                        <option value="LOGIN">Đăng nhập</option>
                        <option value="PREMIUM">Premium</option>
                      </select>
                    </div>
                  </div>

                  {createAccessLevel === "PREMIUM" && (
                    <div className="space-y-2 pt-2 border-t border-border/50">
                      <label className="text-sm font-bold text-foreground/80 flex items-center gap-2"><Crown className="w-4 h-4 text-amber-500"/> Chọn Gói Cước</label>
                      <div className="flex flex-col gap-2 max-h-40 overflow-y-auto p-2 bg-background border border-border rounded-xl">
                        {plans.map(p => (
                          <label key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-foreground/5 cursor-pointer transition-colors">
                            <input 
                              type="checkbox" 
                              checked={createPlanIds.includes(p.id)}
                              onChange={(e) => {
                                setCreatePlanIds(prev => 
                                  e.target.checked ? [...prev, p.id] : prev.filter(id => id !== p.id)
                                );
                              }}
                              className="w-4 h-4 accent-amber-500"
                            />
                            <span className="text-sm font-bold">{p.name}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="p-5 bg-card border border-border rounded-2xl flex flex-col gap-4 shadow-sm">
                  <h4 className="font-bold text-lg border-b border-border/50 pb-2">Audio Đề thi (Choukai)</h4>
                  <input 
                    type="file" 
                    accept="audio/*" 
                    className="hidden" 
                    ref={createAudioInputRef} 
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setCreateAudioFile(e.target.files[0]);
                      }
                    }}
                  />
                  
                  {createAudioFile ? (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between bg-emerald-500/10 text-emerald-500 p-3 rounded-xl">
                        <span className="text-sm font-bold truncate flex-1">{createAudioFile.name}</span>
                        <button 
                          onClick={() => {
                            setCreateAudioFile(null);
                            if (createAudioInputRef.current) createAudioInputRef.current.value = "";
                          }}
                          className="p-1 hover:bg-emerald-500/20 rounded-md transition-colors ml-2"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                      <button 
                        onClick={() => createAudioInputRef.current?.click()}
                        className="w-full px-4 py-2 bg-foreground/5 hover:bg-foreground/10 rounded-xl transition-colors font-semibold text-sm"
                      >
                        Đổi File Khác
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => createAudioInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-2 py-8 bg-foreground/5 hover:bg-foreground/10 rounded-xl border border-border border-dashed transition-colors"
                    >
                      <Upload className="w-8 h-8 text-foreground/40" />
                      <span className="font-bold text-sm">Nhấn để chọn file Audio</span>
                      <span className="text-xs text-foreground/50">Hỗ trợ MP3, WAV, M4A &lt; 50MB</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Right Column: JSON Textarea */}
              <div className="lg:col-span-8 flex flex-col h-full min-h-[500px]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-lg">Mã JSON đề thi</h4>
                  <span className="text-xs font-mono bg-foreground/10 px-2 py-1 rounded">Required</span>
                </div>
                <textarea 
                  value={createJsonText}
                  onChange={(e) => setCreateJsonText(e.target.value)}
                  placeholder="Dán mã JSON đề thi vào đây..."
                  className="w-full flex-1 p-5 font-mono text-sm bg-[#1e1e1e] text-[#d4d4d4] rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 shadow-inner resize-none"
                  spellCheck={false}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border shrink-0">
              <button 
                onClick={() => setShowCreateModal(false)} 
                className="px-6 py-3 bg-foreground/10 text-foreground font-bold rounded-xl hover:bg-foreground/20 transition-colors"
              >
                Hủy
              </button>
              <button 
                onClick={handleCreateExam}
                disabled={creating || !createJsonText.trim()}
                className="px-8 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/25"
              >
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                {creating ? "Đang tạo..." : "Tạo Đề Thi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
