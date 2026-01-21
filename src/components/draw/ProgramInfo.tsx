import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { THEMES } from "@/lib/type";
import type { TCampaign } from "@/react-query/services/campaign/campaign.service";
import { CalendarClock } from "lucide-react";

export default function ProgramInfo({
  program,
  themeKey,
}: {
  program?: TCampaign;
  themeKey: keyof typeof THEMES;
}) {
  if (!program) return null;
  return (
    <Card className="overflow-hidden border-0 shadow-lg ring-2 ring-primary/20 px-6">
      <div className="grid lg:grid-cols-[380px_1fr]">
        <div className="relative rounded-2xl overflow-hidden">
          {program.image_banner ? (
            <img
              src={program.image_banner}
              alt={program.name}
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="h-full w-full bg-muted" />
          )}
        </div>
        <div className="p-6 max-h-[300px] overflow-y-auto">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge
              variant={
                program.status === 1
                  ? "default"
                  : program.status === 2
                    ? "outline"
                    : "secondary"
              }
            >
              {program.status === 1
                ? "Đang diễn ra"
                : program.status === 2
                  ? "Kết thúc"
                  : "Sắp diễn ra"}
            </Badge>
            <Badge variant="outline">{program.code}</Badge>
            <Badge>{program.type === 0 ? "Lồng cầu" : "Online"}</Badge>
          </div>
          <div
            className={`text-2xl font-extrabold bg-clip-text text-transparent ${THEMES[themeKey].title}`}
          >
            {program.name}
          </div>
          {program.description_short && (
            <div className="relative mt-auto pt-5 border-t border-border/40">
              <div className="flex items-start gap-2 text-sm text-muted-foreground/80">
                <CalendarClock className="w-4 h-4 mt-0.5 shrink-0 text-primary/60" />
                <div
                  className="prose prose-sm dark:prose-invert max-w-none [&>p]:m-0 [&>p]:leading-normal whitespace-pre-line"
                  dangerouslySetInnerHTML={{
                    __html: program.description_short,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
