"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles } from "lucide-react";
import { useDrawStore } from "@/lib/store";
import { DEMO_PROGRAMS, THEMES } from "@/lib/type";
import { Link } from "react-router-dom";
export default function Shell({ children }: { children: React.ReactNode }) {
  const programId = useDrawStore((s) => s.programId);
  const setProgramId = useDrawStore((s) => s.setProgramId);
  const themeKey = (DEMO_PROGRAMS.find((p) => p.id === programId)?.theme ??
    "tet") as keyof typeof THEMES;
  return (
    <div className={`min-h-screen ${THEMES[themeKey].pageBg}`}>
      <header className="sticky top-0 z-20 border-b bg-gradient-to-r from-white/70 to-white/70 backdrop-blur">
        <div
          className={`h-0.5 w-full bg-gradient-to-r ${THEMES[themeKey].header}`}
        />
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold tracking-tight text-lg">
            <Sparkles className="h-5 w-5" />
            Lucky Draw
          </div>
          <div className="flex items-center gap-3">
            <Select value={programId} onValueChange={setProgramId}>
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Chọn chương trình" />
              </SelectTrigger>
              <SelectContent>
                {DEMO_PROGRAMS.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={
                          p.status === "open"
                            ? "default"
                            : p.status === "upcoming"
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {p.status}
                      </Badge>
                      <span>{p.title}</span>
                      <Badge variant="outline">
                        {p.type === "cage" ? "Lồng cầu" : "Online"}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link to="/control">
              <Button variant="secondary">Control</Button>
            </Link>
            <Link to="/audience">
              <Button>Audience</Button>
            </Link>
          </div>
        </div>
      </header>
      {children}
      <footer className="py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Lucky Draw
      </footer>
    </div>
  );
}
