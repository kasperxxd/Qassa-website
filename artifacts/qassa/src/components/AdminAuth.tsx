import { useEffect, useState, type ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Lock, LogOut } from "lucide-react";
import { toast } from "sonner";

const API_BASE = `${import.meta.env.BASE_URL}api`.replace(/\/+/g, "/");

type AuthState = "loading" | "anon" | "authed";

interface AdminAuthProps {
  children: (logout: () => Promise<void>) => ReactNode;
}

export function AdminAuth({ children }: AdminAuthProps) {
  const [state, setState] = useState<AuthState>("loading");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function checkAuth() {
    try {
      const res = await fetch(`${API_BASE}/admin/me`, {
        credentials: "same-origin",
      });
      setState(res.ok ? "authed" : "anon");
    } catch {
      setState("anon");
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!password) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/admin/login`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        let msg = "كلمة المرور غير صحيحة";
        try {
          const data = await res.json();
          if (typeof data?.error === "string") msg = data.error;
        } catch {
          /* ignore */
        }
        toast.error(msg);
        setPassword("");
        return;
      }
      setPassword("");
      setState("authed");
      toast.success("تم تسجيل الدخول");
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    try {
      await fetch(`${API_BASE}/admin/logout`, {
        method: "POST",
        credentials: "same-origin",
      });
    } catch {
      /* ignore */
    }
    setState("anon");
    toast.success("تم تسجيل الخروج");
  }

  if (state === "loading") {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (state === "anon") {
    return (
      <div className="flex items-center justify-center py-16 px-4">
        <Card className="w-full max-w-md border-2">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <Lock className="h-7 w-7 text-primary" />
            </div>
            <CardTitle className="text-2xl">لوحة تحكم قصّة</CardTitle>
            <p className="text-sm text-muted-foreground">
              أدخل كلمة المرور للوصول إلى لوحة التحكم
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-password">كلمة المرور</Label>
                <Input
                  id="admin-password"
                  type="password"
                  autoFocus
                  dir="ltr"
                  className="text-left"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={submitting}
                  data-testid="input-admin-password"
                />
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={submitting || !password}
                data-testid="button-admin-login"
              >
                {submitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "دخول"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children(handleLogout)}</>;
}

export function AdminLogoutButton({ onLogout }: { onLogout: () => Promise<void> }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onLogout}
      data-testid="button-admin-logout"
    >
      <LogOut className="h-4 w-4 ml-2" />
      تسجيل الخروج
    </Button>
  );
}
