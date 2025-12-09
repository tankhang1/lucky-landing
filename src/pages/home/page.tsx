import Shell from "@/components/draw/Shell";
import ProgramInfo from "@/components/draw/ProgramInfo";
import { useDrawStore } from "@/lib/store";
import { THEMES } from "@/lib/type";

export default function HomePage() {
  const programId = useDrawStore((s) => s.programId);
  const programs = useDrawStore((s) => s.programs);
  const program = programs.find((p) => p.id === programId);
  const themeKey = (program?.status ?? 1) as keyof typeof THEMES;
  return (
    <Shell>
      <main className="container mx-auto px-4 py-6 space-y-6">
        {program && (
          <ProgramInfo
            program={{
              ...program,
              type: "cage",
            }}
            themeKey={themeKey}
          />
        )}
      </main>
    </Shell>
  );
}
