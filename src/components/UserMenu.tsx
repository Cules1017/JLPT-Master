"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { User, LogOut, LayoutDashboard } from "lucide-react";

export function UserMenu() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="w-8 h-8 rounded-full bg-secondary animate-pulse" />;
  }

  if (!session) {
    return (
      <Link href="/login">
        <button className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-full hover:bg-primary/90 transition-colors">
          Đăng nhập
        </button>
      </Link>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-2 p-1.5 pr-3 bg-secondary rounded-full hover:bg-secondary/80 transition-colors">
        <div className="w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center">
          <User className="w-4 h-4" />
        </div>
        <span className="text-sm font-medium hidden md:block">
          {session.user?.name || session.user?.email?.split('@')[0]}
        </span>
      </button>

      <div className="absolute right-0 mt-2 w-48 bg-card border border-border shadow-lg rounded-xl overflow-hidden opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="p-3 border-b border-border/50">
          <p className="text-sm font-bold truncate">{session.user?.name}</p>
          <p className="text-xs text-foreground/60 truncate">{session.user?.email}</p>
        </div>
        
        <div className="p-1">
          {session.user?.role === "ADMIN" && (
            <Link href="/admin">
              <button className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-secondary rounded-lg transition-colors">
                <LayoutDashboard className="w-4 h-4" />
                Quản trị viên
              </button>
            </Link>
          )}
          
          <button 
            onClick={() => signOut()}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
