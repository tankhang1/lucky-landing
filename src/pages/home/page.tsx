import Shell from "@/components/draw/Shell";
import ProgramInfo from "@/components/draw/ProgramInfo";
import { useDrawStore } from "@/lib/store";
import { DEMO_PROGRAMS, THEMES } from "@/lib/type";

export default function HomePage() {
  const programId = useDrawStore((s) => s.programId);
  const program = DEMO_PROGRAMS.find((p) => p.id === programId);
  const themeKey = (program?.theme ?? "tet") as keyof typeof THEMES;
  return (
    <Shell>
      <main className="container mx-auto px-4 py-6 space-y-6">
        <ProgramInfo program={program} themeKey={themeKey} />
      </main>
    </Shell>
  );
}
