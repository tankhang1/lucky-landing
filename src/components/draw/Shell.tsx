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
import { useDrawStore } from "@/lib/store";
import { THEMES } from "@/lib/type";
import { Link } from "react-router-dom";
import Logo from "@/assets/logo.png";
import { useGetListCampaign } from "@/react-query/queries/campaign/campaign";
import Loading from "@/assets/loading.gif";
import { useEffect, useState } from "react";
import type { TCampaign } from "@/react-query/services/campaign/campaign.service";
export default function Shell({ children }: { children: React.ReactNode }) {
  const { data: programs, isPending: isLoadingProgram } = useGetListCampaign();
  const programId = useDrawStore((s) => s.programId);
  const setProgramId = useDrawStore((s) => s.setProgramId);
  const setProgram = useDrawStore((s) => s.setProgram);
  const [selectedProgram, setSelectedProgram] = useState<TCampaign | null>(
    null,
  );
  const themeKey = (programs?.find((p) => p.id === programId)?.status ??
    1) as keyof typeof THEMES;
  useEffect(() => {
    if (programs && programs.length > 0) {
      setProgram(programs);
      setProgramId(programs[0].id);
      setSelectedProgram(programs[0]);
    }
  }, [programs]);
  return (
    <div className={`min-h-screen ${THEMES[themeKey].pageBg}`}>
      <header className="sticky top-0 z-20 border-b bg-gradient-to-r from-white/70 to-white/70 backdrop-blur">
        <div
          className={`h-0.5 w-full bg-gradient-to-r ${THEMES[themeKey].header}`}
        />
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold tracking-tight text-lg ">
            <img src={Logo} className="w-36" />
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={programId.toString()}
              onValueChange={(value) => {
                setProgramId(+value);
                setSelectedProgram(
                  programs?.find((item) => item.id.toString() == value) || null,
                );
              }}
            >
              <SelectTrigger className="w-72">
                <SelectValue placeholder="Chọn chương trình" />
              </SelectTrigger>
              <SelectContent>
                {isLoadingProgram && (
                  <div className="flex justify-center items-center">
                    <img src={Loading} className="w-7" />
                  </div>
                )}

                {programs?.map((p) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    <div className="flex items-center gap-2">
                      {/* <Badge
                        variant={
                          p.status === 1
                            ? "default"
                            : p.status === 2
                            ? "secondary"
                            : "outline"
                        }
                      >
                        {p.status === 1
                          ? "Đang hoạt động"
                          : p.status === 2
                          ? "Kết thúc"
                          : "Sắp diễn ra"}
                      </Badge> */}
                      <span>{p.name}</span>
                      <Badge variant="outline">
                        {p?.type === 0 ? "Lồng cầu" : "Online"}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Link to="/control">
              <Button variant="secondary">Control</Button>
            </Link>
            {/* {selectedProgram && (
              <Link
                to={`/audience/${selectedProgram.code}/${selectedProgram.type}`}
              >
                <Button>Audience</Button>
              </Link>
            )} */}
            {selectedProgram && (
              <Link
                to={`/audience-v1/${selectedProgram.code}/${selectedProgram.type}`}
              >
                <Button>Audience</Button>
              </Link>
            )}
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
