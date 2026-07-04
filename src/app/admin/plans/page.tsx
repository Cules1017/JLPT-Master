"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader2, Check, ShieldCheck, Clock, Tag, Palette, Star } from "lucide-react";

type PlanCycle = {
  name: string;
  durationDays: number;
  price: number;
  originalPrice: number | null;
};

type Plan = {
  id: string;
  name: string;
  cycles: PlanCycle[];
  features: string[];
  isActive: boolean;
  metadata?: {
    tagline?: string;
    isPopular?: boolean;
    themeColor?: string;
  };
};

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const defaultCycle: PlanCycle = { name: "1 Tháng", durationDays: 30, price: 99000, originalPrice: null };
  
  const [formData, setFormData] = useState<{
    name: string;
    cycles: PlanCycle[];
    features: string[];
    isActive: boolean;
    metadata: {
      tagline: string;
      isPopular: boolean;
      themeColor: string;
    };
  }>({
    name: "",
    cycles: [{ ...defaultCycle }],
    features: [""],
    isActive: true,
    metadata: { tagline: "", isPopular: false, themeColor: "amber" }
  });
  const [saving, setSaving] = useState(false);

  const fetchPlans = async () => {
    try {
      const res = await fetch("/api/admin/plans");
      const data = await res.json();
      setPlans(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const openNewForm = () => {
    setEditingId(null);
    setFormData({ 
      name: "", 
      cycles: [{ ...defaultCycle }], 
      features: [""], 
      isActive: true,
      metadata: { tagline: "", isPopular: false, themeColor: "amber" }
    });
    setShowForm(true);
  };

  const openEditForm = (plan: Plan) => {
    setEditingId(plan.id);
    setFormData({
      name: plan.name,
      cycles: Array.isArray(plan.cycles) && plan.cycles.length > 0 ? plan.cycles : [{ ...defaultCycle }],
      features: plan.features.length ? plan.features : [""],
      isActive: plan.isActive,
      metadata: {
        tagline: plan.metadata?.tagline || "",
        isPopular: plan.metadata?.isPopular || false,
        themeColor: plan.metadata?.themeColor || "amber"
      }
    });
    setShowForm(true);
  };

  // --- Features Handlers ---
  const handleFeatureChange = (index: number, val: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = val;
    setFormData({ ...formData, features: newFeatures });
  };
  const addFeatureRow = () => setFormData({ ...formData, features: [...formData.features, ""] });
  const removeFeatureRow = (index: number) => {
    const newFeatures = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: newFeatures.length ? newFeatures : [""] });
  };

  // --- Cycles Handlers ---
  const handleCycleChange = (index: number, field: keyof PlanCycle, val: string | number | null) => {
    const newCycles = [...formData.cycles];
    newCycles[index] = { ...newCycles[index], [field]: val };
    setFormData({ ...formData, cycles: newCycles });
  };
  const addCycleRow = () => setFormData({ ...formData, cycles: [...formData.cycles, { name: "", durationDays: 30, price: 0, originalPrice: null }] });
  const removeCycleRow = (index: number) => {
    const newCycles = formData.cycles.filter((_, i) => i !== index);
    setFormData({ ...formData, cycles: newCycles.length ? newCycles : [{ ...defaultCycle }] });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Clean data
    const cleanFeatures = formData.features.filter(f => f.trim() !== "");
    const cleanCycles = formData.cycles.map(c => ({
      ...c,
      originalPrice: c.originalPrice && c.originalPrice > 0 ? Number(c.originalPrice) : null,
      price: Number(c.price),
      durationDays: Number(c.durationDays)
    }));
    
    const payload = {
      ...formData,
      features: cleanFeatures,
      cycles: cleanCycles
    };

    try {
      const url = editingId ? `/api/admin/plans/${editingId}` : "/api/admin/plans";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error("Lỗi lưu gói cước");
      
      setShowForm(false);
      fetchPlans();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xóa gói cước này?")) return;
    try {
      await fetch(`/api/admin/plans/${id}`, { method: "DELETE" });
      fetchPlans();
    } catch (err) {
      alert("Lỗi xóa");
    }
  };

  const formatMoney = (n: number) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black mb-2">Quản lý Gói cước (Plans)</h1>
          <p className="text-foreground/60">Cấu hình các gói Premium, chu kỳ và lợi ích.</p>
        </div>
        <button 
          onClick={openNewForm}
          className="flex items-center gap-2 px-6 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-colors"
        >
          <Plus className="w-5 h-5" /> Thêm Gói Mới
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-[2rem] p-6 shadow-xl mb-4 animate-in slide-in-from-top-4 fade-in duration-300">
          <h2 className="text-xl font-black mb-6 flex items-center gap-2"><Star className="w-5 h-5 text-indigo-500"/> {editingId ? "Sửa Gói Cước" : "Tạo Gói Cước Mới"}</h2>
          <form onSubmit={handleSave} className="flex flex-col gap-8">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div>
                <label className="block text-sm font-bold mb-1">Tên gói cước</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-border outline-none focus:border-indigo-500 transition-colors" placeholder="VD: Gói VIP Pro" />
              </div>

              <div>
                <label className="block text-sm font-bold mb-1">Slogan / Tagline ngắn</label>
                <input type="text" value={formData.metadata.tagline} onChange={e => setFormData({...formData, metadata: {...formData.metadata, tagline: e.target.value}})} className="w-full px-4 py-3 rounded-xl bg-foreground/5 border border-border outline-none focus:border-indigo-500 transition-colors" placeholder="VD: Lựa chọn tốt nhất cho Newbie" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold mb-2 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-indigo-500"/> Tông màu chủ đạo
                </label>
                <div className="flex gap-3">
                  {['amber', 'indigo', 'rose', 'emerald', 'cyan', 'violet'].map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, metadata: {...formData.metadata, themeColor: color}})}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${formData.metadata.themeColor === color ? 'border-foreground scale-110' : 'border-transparent opacity-50 hover:opacity-100'}`}
                      style={{ backgroundColor: `var(--${color}-500, ${color})` }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              <div className="flex flex-col justify-center gap-2">
                <label className="block text-sm font-bold flex items-center gap-2">
                  <Star className="w-4 h-4 text-indigo-500"/> Bật cờ "Best Seller" (Nổi bật)
                </label>
                <label className="flex items-center gap-2 cursor-pointer mt-1">
                  <input type="checkbox" checked={formData.metadata.isPopular} onChange={e => setFormData({...formData, metadata: {...formData.metadata, isPopular: e.target.checked}})} className="w-5 h-5 accent-indigo-500" />
                  <span className="font-semibold text-foreground/80">Kích hoạt hiệu ứng phát sáng cho gói này</span>
                </label>
              </div>
            </div>

            {/* Cycles List */}
            <div className="bg-foreground/5 p-5 rounded-[1.5rem] border border-border/50">
              <label className="block text-sm font-black mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500"/> Các chu kỳ thanh toán
              </label>
              <div className="flex flex-col gap-3">
                {formData.cycles.map((cycle, i) => (
                  <div key={i} className="flex flex-wrap items-end gap-3 bg-card p-3 rounded-xl border border-border shadow-sm">
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-xs font-semibold mb-1 text-foreground/60">Tên chu kỳ</label>
                      <input required type="text" value={cycle.name} onChange={e => handleCycleChange(i, 'name', e.target.value)} className="w-full px-3 py-2 rounded-lg bg-foreground/5 border border-border outline-none focus:border-indigo-500 text-sm font-medium" placeholder="VD: 1 Tháng" />
                    </div>
                    <div className="w-24">
                      <label className="block text-xs font-semibold mb-1 text-foreground/60">Số ngày</label>
                      <input required type="number" value={cycle.durationDays || ''} onChange={e => handleCycleChange(i, 'durationDays', Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-foreground/5 border border-border outline-none focus:border-indigo-500 text-sm" placeholder="30" />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-xs font-semibold mb-1 text-foreground/60">Giá bán (VNĐ)</label>
                      <input required type="number" value={cycle.price || ''} onChange={e => handleCycleChange(i, 'price', Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-foreground/5 border border-border outline-none focus:border-indigo-500 text-sm font-bold" placeholder="99000" />
                    </div>
                    <div className="flex-1 min-w-[120px]">
                      <label className="block text-xs font-semibold mb-1 text-foreground/60">Giá gốc (VNĐ)</label>
                      <input type="number" value={cycle.originalPrice || ''} onChange={e => handleCycleChange(i, 'originalPrice', Number(e.target.value))} className="w-full px-3 py-2 rounded-lg bg-foreground/5 border border-border outline-none focus:border-indigo-500 text-sm" placeholder="150000" />
                    </div>
                    <button type="button" onClick={() => removeCycleRow(i)} className="p-2.5 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500/20 transition-colors"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addCycleRow} className="mt-4 px-4 py-2 bg-indigo-500/10 text-indigo-500 font-bold text-sm rounded-lg hover:bg-indigo-500/20 transition-colors flex items-center gap-1"><Plus className="w-4 h-4"/> Thêm chu kỳ</button>
            </div>

            {/* Features List */}
            <div>
              <label className="block text-sm font-black mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-500"/> Quyền lợi (Features)
              </label>
              <div className="flex flex-col gap-2">
                {formData.features.map((feat, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={feat} onChange={e => handleFeatureChange(i, e.target.value)} className="flex-1 max-w-xl px-4 py-2.5 rounded-xl bg-foreground/5 border border-border outline-none focus:border-indigo-500 transition-colors text-sm font-medium" placeholder="Mô tả quyền lợi..." />
                    <button type="button" onClick={() => removeFeatureRow(i)} className="p-2.5 bg-rose-500/10 text-rose-500 rounded-xl hover:bg-rose-500/20 transition-colors"><Trash2 className="w-5 h-5"/></button>
                  </div>
                ))}
              </div>
              <button type="button" onClick={addFeatureRow} className="mt-3 px-4 py-2 bg-indigo-500/10 text-indigo-500 font-bold text-sm rounded-lg hover:bg-indigo-500/20 transition-colors flex items-center gap-1 w-fit"><Plus className="w-4 h-4"/> Thêm quyền lợi</button>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <input type="checkbox" id="isActive" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} className="w-5 h-5 accent-indigo-500" />
              <label htmlFor="isActive" className="font-bold cursor-pointer">Kích hoạt (Hiển thị gói này cho User)</label>
            </div>

            <div className="flex gap-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-6 py-3 bg-foreground/10 font-bold rounded-xl hover:bg-foreground/20 transition-colors">Hủy bỏ</button>
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-8 py-3 bg-indigo-500 text-white font-bold rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 shadow-lg shadow-indigo-500/20">
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />} Lưu Gói Cước
              </button>
            </div>
          </form>
        </div>
      )}

      {/* List Plans */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-full flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-indigo-500" /></div>
        ) : plans.length === 0 ? (
          <div className="col-span-full text-center py-12 text-foreground/50">Chưa có gói cước nào. Hãy tạo một gói mới!</div>
        ) : (
          plans.map(plan => {
            const themeColor = plan.metadata?.themeColor || 'indigo';
            const isPopular = plan.metadata?.isPopular;
            
            return (
            <div key={plan.id} className={`bg-card border ${isPopular ? 'border-indigo-500' : 'border-border'} rounded-[2rem] p-6 lg:p-8 shadow-xl relative overflow-hidden transition-all hover:shadow-2xl`}>
              {!plan.isActive && <div className="absolute top-4 left-4 px-2 py-1 bg-rose-500/10 text-rose-500 text-xs font-bold rounded-md">Đã ẩn</div>}
              {isPopular && <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-black uppercase tracking-wider rounded-full shadow-lg">Best Seller</div>}
              
              <div className="flex justify-between items-start mb-6 mt-4">
                <div>
                  <h3 className="text-3xl font-black mb-1" style={{ color: `var(--${themeColor}-500, currentColor)` }}>{plan.name}</h3>
                  {plan.metadata?.tagline && <p className="text-foreground/60 font-medium text-sm">{plan.metadata.tagline}</p>}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEditForm(plan)} className="p-2.5 text-foreground/50 hover:text-indigo-500 bg-foreground/5 rounded-xl transition-colors"><Edit className="w-5 h-5" /></button>
                  <button onClick={() => handleDelete(plan.id)} className="p-2.5 text-foreground/50 hover:text-rose-500 bg-foreground/5 rounded-xl transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>
              </div>

              {/* Display Cycles */}
              <div className="mb-8">
                <p className="text-sm font-bold text-foreground/60 mb-3 uppercase tracking-wider flex items-center gap-2"><Tag className="w-4 h-4"/> Bảng giá</p>
                <div className="flex flex-col gap-3">
                  {Array.isArray(plan.cycles) && plan.cycles.map((cycle, idx) => (
                    <div key={idx} className={`flex items-center justify-between p-4 rounded-2xl border transition-colors ${isPopular ? 'bg-indigo-500/5 border-indigo-500/20' : 'bg-foreground/5 border-foreground/5 hover:border-foreground/20'}`}>
                      <div>
                        <div className="font-bold text-lg">{cycle.name}</div>
                        <div className="text-xs text-foreground/50 font-medium">{cycle.durationDays} ngày sử dụng</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-foreground">{formatMoney(cycle.price)}</div>
                        {cycle.originalPrice && cycle.originalPrice > cycle.price && (
                          <div className="text-xs text-foreground/40 line-through">{formatMoney(cycle.originalPrice)}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Display Features */}
              <div>
                <p className="text-sm font-bold text-foreground/60 mb-3 uppercase tracking-wider flex items-center gap-2"><ShieldCheck className="w-4 h-4"/> Quyền lợi</p>
                <ul className="flex flex-col gap-3">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm font-medium">
                      <Check className="w-5 h-5 shrink-0" style={{ color: `var(--${themeColor}-500, currentColor)` }} />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )})
        )}
      </div>
    </div>
  );
}
