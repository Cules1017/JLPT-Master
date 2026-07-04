import { prisma } from "@/lib/prisma";
import { BookOpen, Users, Trophy, Activity } from "lucide-react";

export default async function AdminDashboardPage() {
  const totalExams = await prisma.exam.count();
  const totalUsers = await prisma.user.count();
  const totalHistories = await prisma.examHistory.count();
  const freeExams = await prisma.exam.count({ where: { accessLevel: "FREE" } });

  const stats = [
    {
      title: "Tổng số đề thi",
      value: totalExams,
      icon: BookOpen,
      color: "text-indigo-500",
      bg: "bg-indigo-500/10",
      border: "border-indigo-500/20"
    },
    {
      title: "Người dùng",
      value: totalUsers,
      icon: Users,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      title: "Lượt làm bài",
      value: totalHistories,
      icon: Activity,
      color: "text-rose-500",
      bg: "bg-rose-500/10",
      border: "border-rose-500/20"
    },
    {
      title: "Đề thi miễn phí",
      value: freeExams,
      icon: Trophy,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    }
  ];

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <header>
        <h1 className="text-3xl font-black mb-2">Tổng quan hệ thống</h1>
        <p className="text-foreground/60 font-medium">Theo dõi các chỉ số quan trọng của ứng dụng.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className={`p-6 rounded-[2rem] border ${stat.border} ${stat.bg} backdrop-blur-xl flex flex-col gap-4 shadow-lg`}>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center bg-background border border-border shadow-sm`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
            <div>
              <p className="text-foreground/60 font-semibold mb-1">{stat.title}</p>
              <h3 className="text-4xl font-black">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <div className="p-8 rounded-[2rem] border border-border bg-card/50 shadow-xl backdrop-blur-xl">
          <h2 className="text-xl font-bold mb-4">Chào mừng đến với Admin Panel</h2>
          <p className="text-foreground/80 leading-relaxed mb-6">
            Tại đây bạn có thể quản lý toàn bộ hệ thống thi JLPT. Sử dụng menu bên trái để điều hướng đến các tính năng quản lý đề thi (thêm/sửa/xóa/đặt giá), quản lý người dùng (phân quyền).
          </p>
          <div className="inline-flex px-4 py-2 bg-indigo-500/10 text-indigo-500 font-bold rounded-xl border border-indigo-500/20">
            Hệ thống đang hoạt động ổn định
          </div>
        </div>
      </div>
    </div>
  );
}
