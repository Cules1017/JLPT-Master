import Link from "next/link";
import { LayoutDashboard, BookOpen, Users, LogOut, ChevronLeft, CreditCard } from "lucide-react";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const navItems = [
    { name: "Tổng quan", href: "/admin", icon: LayoutDashboard },
    { name: "Đề thi", href: "/admin/exams", icon: BookOpen },
    { name: "Người dùng", href: "/admin/users", icon: Users },
    { name: "Gói cước", href: "/admin/plans", icon: CreditCard },
  ];

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col">
        <div className="p-6 border-b border-border">
          <h2 className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
            Admin Panel
          </h2>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-foreground/5 transition-colors font-semibold">
                <item.icon className="w-5 h-5 text-indigo-500" />
                {item.name}
              </div>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-border flex flex-col gap-2">
          <Link href="/">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-foreground/5 transition-colors font-semibold text-foreground/60">
              <ChevronLeft className="w-5 h-5" />
              Về trang chủ
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8 relative">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
