"use client";
import { useEffect } from "react";
import { useDrawStore } from "./store";

export type SyncMessage = {
  type: "winners" | "prizes" | "participants" | "cage";
  payload: any;
};

const CHANNEL = "draw-sync";

export function useSyncAcrossTabs(role: "control" | "audience" = "audience") {
  useEffect(() => {
    const bc = new BroadcastChannel(CHANNEL);
    const unsub = useDrawStore.subscribe((s, prev) => {
      if (role !== "control") return; // only control broadcasts
      if (s.winners !== prev.winners)
        bc.postMessage({
          type: "winners",
          payload: s.winners,
        } satisfies SyncMessage);
      if (s.prizes !== prev.prizes)
        bc.postMessage({
          type: "prizes",
          payload: s.prizes,
        } satisfies SyncMessage);
      if (s.participants !== prev.participants)
        bc.postMessage({
          type: "participants",
          payload: s.participants,
        } satisfies SyncMessage);
      if (
        s.cageDisplay !== prev.cageDisplay ||
        s.cageHistory !== prev.cageHistory
      )
        bc.postMessage({
          type: "cage",
          payload: { display: s.cageDisplay, history: s.cageHistory },
        } satisfies SyncMessage);
    });

    const onMsg = (ev: MessageEvent<SyncMessage>) => {
      const msg = ev.data;
      switch (msg.type) {
        case "winners":
          useDrawStore.setState({ winners: msg.payload });
          break;
        case "prizes":
          useDrawStore.setState({ prizes: msg.payload });
          break;
        case "participants":
          useDrawStore.setState({ participants: msg.payload });
          break;
        case "cage":
          useDrawStore.setState({
            cageDisplay: msg.payload.display,
            cageHistory: msg.payload.history,
          });
          break;
      }
    };
    bc.addEventListener("message", onMsg);
    return () => {
      unsub();
      bc.removeEventListener("message", onMsg);
      bc.close();
    };
  }, [role]);
}
