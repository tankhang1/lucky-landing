import { Card, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { THEMES, type Program } from "@/lib/type";

export default function ProgramInfo({
  program,
  themeKey,
}: {
  program?: Program;
  themeKey: keyof typeof THEMES;
}) {
  if (!program) return null;
  return (
    <Card className="overflow-hidden border-0 shadow-lg ring-2 ring-primary/20">
      <div className="grid lg:grid-cols-[380px_1fr]">
        <div className="relative">
          {program.banner ? (
            <img
              src={program.banner}
              alt={program.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
        </div>
        <div className="p-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge
              variant={
                program.status === "open"
                  ? "default"
                  : program.status === "upcoming"
                  ? "secondary"
                  : "outline"
              }
            >
              {program.status}
            </Badge>
            <Badge variant="outline">{program.code}</Badge>
            <Badge>{program.type === "cage" ? "Lồng cầu" : "Online"}</Badge>
          </div>
          <div
            className={`text-2xl font-extrabold bg-clip-text text-transparent ${THEMES[themeKey].title}`}
          >
            {program.title}
          </div>
          {program.description ? (
            <CardDescription className="mt-1">
              {program.description}
            </CardDescription>
          ) : null}
          {program.rules?.length ? (
            <ul className="mt-4 grid sm:grid-cols-2 gap-2 text-sm">
              {program.rules.map((r, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </Card>
  );
}
