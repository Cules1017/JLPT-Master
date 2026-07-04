"use client";

import { useState, useEffect, useRef, use } from "react";
import { upload } from '@vercel/blob/client';
import { useRouter } from "next/navigation";
import { Save, ChevronLeft, Loader2, AlertCircle, Upload, Music, Trash2, MessageSquare, Edit3 } from "lucide-react";
import Link from "next/link";

export default function AdminEditExamPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = use(params);
  const id = unwrappedParams.id;
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("N3");
  const [accessLevel, setAccessLevel] = useState("FREE");
  
  // Audio state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);

  // Visual editor state
  const [examData, setExamData] = useState<any>(null);

  const updateQuestion = (sIndex: number, mIndex: number, qIndex: number, field: string, value: any) => {
    setExamData((prev: any) => {
      const newData = structuredClone(prev);
      const mondais = newData.sections[sIndex].mondai || newData.sections[sIndex].parts;
      mondais[mIndex].questions[qIndex][field] = value;
      return newData;
    });
  };

  const updateChoice = (sIndex: number, mIndex: number, qIndex: number, cIndex: number, value: string) => {
    setExamData((prev: any) => {
      const newData = structuredClone(prev);
      const mondais = newData.sections[sIndex].mondai || newData.sections[sIndex].parts;
      mondais[mIndex].questions[qIndex].choices[cIndex] = value;
      return newData;
    });
  };
  
  const updateMondai = (sIndex: number, mIndex: number, field: string, value: any) => {
    setExamData((prev: any) => {
      const newData = structuredClone(prev);
      const mondais = newData.sections[sIndex].mondai || newData.sections[sIndex].parts;
      if (typeof mondais[mIndex][field] === 'object' && typeof value === 'object') {
         mondais[mIndex][field] = { ...mondais[mIndex][field], ...value };
      } else {
         mondais[mIndex][field] = value;
      }
      return newData;
    });
  };

  useEffect(() => {
    const fetchExam = async () => {
      try {
        const res = await fetch(`/api/admin/exams/${id}`);
        if (!res.ok) throw new Error("Không thể tải dữ liệu đề thi");
        const data = await res.json();
        
        setTitle(data.title);
        setLevel(data.level);
        setAccessLevel(data.accessLevel || "FREE");
        setAudioUrl(data.metadata?.audioUrl || null);
        
        const examObj = {
          metadata: data.metadata,
          sections: data.sections
        };
        setExamData(examObj);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExam();
  }, [id]);

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAudio(true);

    try {
      const newBlob = await upload(file.name, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
      });

      setAudioUrl(newBlob.url);

      try {
        setExamData((prev: any) => {
          if (!prev) return prev;
          const currentData = structuredClone(prev);
          currentData.metadata = currentData.metadata || {};
          currentData.metadata.audioUrl = newBlob.url;
          return currentData;
        });
      } catch (e) {}

    } catch (err: any) {
      alert("Lỗi upload Audio: " + err.message + "\n(Vui lòng đảm bảo bạn đã cấu hình Vercel Blob và thêm biến BLOB_READ_WRITE_TOKEN)");
    } finally {
      setUploadingAudio(false);
      if (audioInputRef.current) audioInputRef.current.value = "";
    }
  };

  const removeAudio = () => {
    setAudioUrl(null);
    try {
      setExamData((prev: any) => {
        if (!prev) return prev;
        const currentData = structuredClone(prev);
        if (currentData.metadata && currentData.metadata.audioUrl) {
          delete currentData.metadata.audioUrl;
        }
        return currentData;
      });
    } catch (e) {}
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    if (!examData) {
      setSaving(false);
      return;
    }

    try {
      const res = await fetch(`/api/admin/exams/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          level,
          accessLevel,
          metadata: examData.metadata,
          sections: examData.sections
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Lỗi cập nhật");
      }

      alert("Cập nhật thành công!");
      router.push("/admin/exams");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-foreground/60">
        <Loader2 className="w-8 h-8 animate-spin mb-4" />
        <p>Đang tải dữ liệu đề thi...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/exams">
            <button className="p-2 bg-foreground/5 hover:bg-foreground/10 rounded-full transition-colors border border-foreground/10">
              <ChevronLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-black mb-1">Chỉnh sửa đề thi</h1>
            <p className="text-foreground/60">Cập nhật thông tin và nội dung câu hỏi.</p>
          </div>
        </div>

        <button 
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/25 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {saving ? "Đang lưu..." : "Lưu thay đổi"}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Meta Settings */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-card/50 backdrop-blur-xl border border-border p-6 rounded-[2rem] shadow-xl">
            <h2 className="text-xl font-bold mb-6">Thông tin cơ bản</h2>
            
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80">Tên đề thi</label>
                <input 
                  type="text" 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:border-indigo-500 outline-none transition-colors font-semibold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-foreground/80">Cấp độ (JLPT)</label>
                <select 
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:border-indigo-500 outline-none transition-colors font-semibold appearance-none"
                >
                  <option value="N1">N1</option>
                  <option value="N2">N2</option>
                  <option value="N3">N3</option>
                  <option value="N4">N4</option>
                  <option value="N5">N5</option>
                </select>
              </div>

              <div className="space-y-2 mt-2">
                <label className="text-sm font-bold text-foreground/80 block">Trạng thái Truy cập (Phân quyền)</label>
                <select 
                  value={accessLevel}
                  onChange={(e) => setAccessLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-background border border-foreground/10 focus:border-indigo-500 outline-none transition-colors font-semibold appearance-none"
                >
                  <option value="FREE">Miễn phí cho mọi người (Guest)</option>
                  <option value="LOGIN">Miễn phí cho User đã Login</option>
                  <option value="PREMIUM">Tính phí (Premium)</option>
                </select>
              </div>

              <div className="space-y-2 mt-4 pt-4 border-t border-border">
                <label className="text-sm font-bold text-foreground/80 flex items-center gap-2">
                  <Music className="w-4 h-4" /> Audio Đề Thi
                </label>
                
                <input 
                  type="file" 
                  accept="audio/*" 
                  className="hidden" 
                  ref={audioInputRef} 
                  onChange={handleAudioUpload}
                />
                
                {audioUrl ? (
                  <div className="flex flex-col gap-3">
                    <audio src={audioUrl} controls className="w-full h-10" />
                    <button 
                      onClick={removeAudio}
                      className="flex items-center justify-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl transition-colors font-semibold text-sm"
                    >
                      <Trash2 className="w-4 h-4" /> Xóa Audio
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => audioInputRef.current?.click()}
                    disabled={uploadingAudio}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-foreground/5 hover:bg-foreground/10 border border-border border-dashed rounded-xl transition-colors font-semibold disabled:opacity-50"
                  >
                    {uploadingAudio ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5 text-foreground/60" />}
                    {uploadingAudio ? "Đang xử lý..." : "Tải lên File Audio"}
                  </button>
                )}
                <p className="text-xs text-foreground/50 mt-1">Hỗ trợ file MP3, M4A, WAV. Kích thước &lt; 50MB.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Visual Editor */}
        <div className="lg:col-span-2">
          <div className="bg-card/50 backdrop-blur-xl border border-border p-6 rounded-[2rem] shadow-xl h-full flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-indigo-500" /> Nội dung Câu hỏi
              </h2>
            </div>
            
            {!examData ? (
              <div className="flex justify-center items-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>
            ) : (
              <div className="flex flex-col gap-8 flex-1 overflow-y-auto pr-2">
                {examData.sections?.map((section: any, sIndex: number) => {
                  const mondais = section.mondai || section.parts || [];
                  return (
                    <div key={section.section_id || sIndex} className="flex flex-col gap-4">
                      <div className="flex items-center gap-3 pb-2 border-b border-border/50 sticky top-0 bg-card/95 z-10 py-2">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-black">{sIndex + 1}</div>
                        <h3 className="text-xl font-black text-indigo-500">{section.name}</h3>
                      </div>
                      
                      {mondais.map((mondai: any, mIndex: number) => (
                        <div key={mondai.mondai_id || mIndex} className="ml-4 md:ml-8 pl-4 md:pl-6 border-l-2 border-border/50 flex flex-col gap-6 mb-8">
                          {/* Mondai Meta */}
                          <div className="flex flex-col gap-3 bg-foreground/5 p-4 rounded-xl">
                            <input 
                              type="text" 
                              value={mondai.title || mondai.name || ""} 
                              onChange={(e) => updateMondai(sIndex, mIndex, mondai.title !== undefined ? "title" : "name", e.target.value)}
                              className="text-lg font-bold bg-transparent outline-none border-b border-border focus:border-indigo-500 py-1"
                              placeholder="Tên bài (VD: Mondai 1)"
                            />
                            <textarea 
                              value={mondai.instruction || mondai.description || ""}
                              onChange={(e) => updateMondai(sIndex, mIndex, mondai.instruction !== undefined ? "instruction" : "description", e.target.value)}
                              className="w-full text-sm font-medium bg-background border border-border rounded-lg p-3 outline-none focus:border-indigo-500 min-h-[80px]"
                              placeholder="Hướng dẫn làm bài..."
                            />
                            {mondai.passage && (
                              <textarea 
                                value={typeof mondai.passage === 'string' ? mondai.passage : mondai.passage.content || ""}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  if (typeof mondai.passage === 'string') updateMondai(sIndex, mIndex, "passage", val);
                                  else updateMondai(sIndex, mIndex, "passage", { content: val });
                                }}
                                className="w-full text-sm leading-relaxed bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 outline-none focus:border-indigo-500 min-h-[120px]"
                                placeholder="Nội dung đoạn văn đọc hiểu..."
                              />
                            )}
                          </div>

                          {/* Questions */}
                          <div className="flex flex-col gap-6 mt-2">
                            {(mondai.questions || []).map((q: any, qIndex: number) => {
                              const correctAns = q.correct_answer !== undefined ? q.correct_answer : q.correct_answer_index;
                              
                              return (
                                <div key={q.question_id || q.id || qIndex} className="bg-card border border-border p-4 md:p-5 rounded-2xl shadow-sm flex flex-col gap-4 transition-all hover:border-indigo-500/30">
                                  <div className="flex flex-col md:flex-row md:items-start gap-3">
                                    <span className="font-bold text-foreground/50 text-sm md:mt-3 shrink-0">Câu {q.number || qIndex + 1}</span>
                                    <textarea 
                                      value={q.question || q.question_text || ""}
                                      onChange={(e) => updateQuestion(sIndex, mIndex, qIndex, q.question !== undefined ? "question" : "question_text", e.target.value)}
                                      className="flex-1 font-bold text-base bg-background border border-border rounded-lg p-3 outline-none focus:border-indigo-500 min-h-[80px]"
                                      placeholder="Nội dung câu hỏi..."
                                    />
                                  </div>

                                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-3 md:pl-12">
                                    {(q.choices || []).map((choice: string, cIndex: number) => (
                                      <div key={cIndex} className="flex items-center gap-2">
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border transition-colors cursor-pointer shrink-0 ${correctAns === (cIndex + 1) ? 'bg-emerald-500 border-emerald-500 text-white shadow-sm shadow-emerald-500/30' : 'bg-foreground/5 border-border text-foreground/50 hover:bg-foreground/10'}`}
                                          onClick={() => updateQuestion(sIndex, mIndex, qIndex, q.correct_answer !== undefined ? "correct_answer" : "correct_answer_index", cIndex + 1)}
                                          title="Nhấn để chọn làm đáp án đúng"
                                        >
                                          {cIndex + 1}
                                        </div>
                                        <input 
                                          type="text" 
                                          value={choice}
                                          onChange={(e) => updateChoice(sIndex, mIndex, qIndex, cIndex, e.target.value)}
                                          className={`flex-1 text-sm bg-background border rounded-lg p-2.5 outline-none transition-colors ${correctAns === (cIndex + 1) ? 'border-emerald-500/50 focus:border-emerald-500 bg-emerald-500/5 font-semibold' : 'border-border focus:border-indigo-500'}`}
                                          placeholder={`Lựa chọn ${cIndex + 1}`}
                                        />
                                      </div>
                                    ))}
                                  </div>

                                  <div className="md:pl-12 mt-2">
                                    <div className="flex flex-col gap-2 bg-blue-500/5 border border-blue-500/20 p-3 rounded-xl">
                                      <label className="text-xs font-bold text-blue-500 flex items-center gap-1">
                                        <MessageSquare className="w-3.5 h-3.5" /> Giải thích đáp án
                                      </label>
                                      <textarea 
                                        value={q.answer_explanation || q.explanation || ""}
                                        onChange={(e) => updateQuestion(sIndex, mIndex, qIndex, q.answer_explanation !== undefined ? "answer_explanation" : "explanation", e.target.value)}
                                        className="w-full text-sm bg-background border border-border rounded-lg p-3 outline-none focus:border-blue-500 min-h-[60px]"
                                        placeholder="Nhập lời giải thích..."
                                      />
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
