"use client";

import { useState, useEffect } from "react";
import { Loader2, Shield, User, ShieldAlert, X } from "lucide-react";

type UserSummary = {
  id: string;
  email: string;
  name: string | null;
  role: "ADMIN" | "USER" | "GUEST";
  createdAt: string;
  _count: { histories: number };
  subscriptions: {
    id: string;
    endDate: string;
    status: string;
    plan: { id: string; name: string; cycles: any };
  }[];
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Grant Plan Modal State
  const [grantModal, setGrantModal] = useState<{ show: boolean; user?: UserSummary }>({ show: false });
  // Map planId -> selectedCycleIndex
  const [selectedPlans, setSelectedPlans] = useState<Record<string, number>>({});
  const [processingGrant, setProcessingGrant] = useState(false);

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
      
      const plansRes = await fetch("/api/plans");
      if (plansRes.ok) {
        const pData = await plansRes.json();
        setPlans(pData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, currentRole: string) => {
    const newRole = currentRole === "ADMIN" ? "USER" : "ADMIN";
    
    if (!confirm(`Bạn có chắc muốn cấp quyền ${newRole} cho người dùng này?`)) return;

    try {
      const res = await fetch("/api/admin/users", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Update failed");
      }

      alert("Cập nhật quyền thành công!");
      fetchUsers();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  const handleGrantPlan = async () => {
    if (!grantModal.user || Object.keys(selectedPlans).length === 0) return;

    const plansToGrant = [];
    for (const [planId, cycleIndex] of Object.entries(selectedPlans)) {
      const plan = plans.find(p => p.id === planId);
      if (plan && plan.cycles && plan.cycles.length > cycleIndex) {
        plansToGrant.push({
          planId,
          durationDays: plan.cycles[cycleIndex].durationDays || 30
        });
      }
    }

    if (plansToGrant.length === 0) return;
    
    setProcessingGrant(true);
    try {
      const res = await fetch("/api/admin/users/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: grantModal.user.id,
          plans: plansToGrant
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Grant failed");
      }

      alert("Cấp gói thành công!");
      setGrantModal({ show: false });
      fetchUsers();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    } finally {
      setProcessingGrant(false);
    }
  };

  const handleRevokePlan = async (subId: string, planName: string) => {
    if (!confirm(`Bạn có chắc muốn thu hồi gói "${planName}" của người dùng này?`)) return;

    try {
      const res = await fetch(`/api/admin/users/subscriptions/${subId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Revoke failed");
      }

      alert("Thu hồi gói thành công!");
      fetchUsers();
    } catch (err: any) {
      alert("Lỗi: " + err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-black mb-2">Quản lý Người dùng</h1>
        <p className="text-foreground/60">Quản lý tài khoản và phân quyền quản trị trị viên.</p>
      </div>

      <div className="bg-card/50 backdrop-blur-xl border border-border rounded-[2rem] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-foreground/5">
                <th className="p-4 font-bold text-foreground/80">Người dùng</th>
                <th className="p-4 font-bold text-foreground/80">Email</th>
                <th className="p-4 font-bold text-foreground/80">Vai trò</th>
                <th className="p-4 font-bold text-foreground/80">Gói đang có</th>
                <th className="p-4 font-bold text-foreground/80">Số lượt thi</th>
                <th className="p-4 font-bold text-foreground/80 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-foreground/60">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-foreground/60">
                    Chưa có người dùng nào.
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="border-b border-border/50 hover:bg-foreground/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 shrink-0">
                          <User className="w-5 h-5" />
                        </div>
                        <span className="font-semibold">{user.name || "Chưa cập nhật"}</span>
                      </div>
                    </td>
                    <td className="p-4 text-foreground/80">{user.email}</td>
                    <td className="p-4">
                      {user.role === "ADMIN" ? (
                        <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm font-bold border border-emerald-500/20 inline-flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" /> ADMIN
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-foreground/5 text-foreground/70 rounded-lg text-sm font-bold border border-foreground/10 inline-flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> USER
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {user.subscriptions && user.subscriptions.length > 0 ? (
                        <div className="flex flex-col gap-1.5">
                          {user.subscriptions.map(sub => (
                            <div key={sub.id} className="inline-flex items-center gap-2 px-2 py-1 bg-amber-500/10 text-amber-600 rounded-lg text-xs font-bold border border-amber-500/20 w-fit">
                              <span>{sub.plan.name} ({new Date(sub.endDate).toLocaleDateString("vi-VN")})</span>
                              <button 
                                onClick={() => handleRevokePlan(sub.id, sub.plan.name)}
                                className="p-0.5 hover:bg-amber-500/20 rounded transition-colors"
                                title="Thu hồi gói"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-foreground/40 text-sm">Không có gói</span>
                      )}
                    </td>
                    <td className="p-4 text-foreground/60 font-medium">
                      {user._count.histories} lượt
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => {
                            setGrantModal({ show: true, user });
                            setSelectedPlans({});
                          }}
                          className="px-4 py-2 rounded-xl text-sm font-bold bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 transition-colors"
                        >
                          Cấp Gói
                        </button>
                        <button 
                          onClick={() => handleRoleChange(user.id, user.role)}
                          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
                            user.role === "ADMIN" 
                              ? "bg-rose-500/10 hover:bg-rose-500/20 text-rose-500" 
                              : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500"
                          }`}
                        >
                          {user.role === "ADMIN" ? "Hạ quyền" : "Lên ADMIN"}
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

      {grantModal.show && grantModal.user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-background border border-border p-6 rounded-2xl max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Cấp / Gia hạn gói cho {grantModal.user.name || grantModal.user.email}</h3>
            
            <div className="flex flex-col gap-4">
              <label className="block text-sm font-medium">Chọn các gói cước</label>
              <div className="max-h-60 overflow-y-auto pr-2 flex flex-col gap-3">
                {plans.map(p => {
                  const isChecked = selectedPlans[p.id] !== undefined;
                  const existingSub = grantModal.user?.subscriptions?.find(sub => sub.plan.id === p.id);
                  return (
                    <div key={p.id} className="p-3 border border-border rounded-xl bg-foreground/5 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <label className="flex items-center gap-3 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedPlans({ ...selectedPlans, [p.id]: 0 });
                              } else {
                                const newPlans = { ...selectedPlans };
                                delete newPlans[p.id];
                                setSelectedPlans(newPlans);
                              }
                            }}
                            className="w-5 h-5 rounded border-border text-indigo-500 focus:ring-indigo-500"
                          />
                          <span className="font-bold">{p.name} {existingSub && <span className="text-foreground/50 text-sm font-normal">(Gia hạn)</span>}</span>
                        </label>
                        {existingSub && (
                          <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                            Đến {new Date(existingSub.endDate).toLocaleDateString("vi-VN")}
                          </span>
                        )}
                      </div>

                      {isChecked && (
                        <div className="pl-8">
                          <select 
                            value={selectedPlans[p.id]}
                            onChange={(e) => setSelectedPlans({ ...selectedPlans, [p.id]: Number(e.target.value) })}
                            className="w-full p-2 text-sm rounded-lg border border-border bg-background"
                          >
                            {p.cycles?.map((c: any, i: number) => (
                              <option key={i} value={i}>{c.name} ({c.durationDays} ngày)</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button 
                onClick={() => setGrantModal({ show: false })}
                className="px-4 py-2 font-bold rounded-lg bg-foreground/10"
              >
                Hủy
              </button>
              <button 
                onClick={handleGrantPlan}
                disabled={processingGrant || Object.keys(selectedPlans).length === 0}
                className="px-4 py-2 font-bold rounded-lg bg-indigo-500 text-white disabled:opacity-50 flex items-center gap-2"
              >
                {processingGrant && <Loader2 className="w-4 h-4 animate-spin" />}
                Xác nhận cấp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
