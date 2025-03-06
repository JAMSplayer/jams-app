import { LogStore } from "@/types/logs-store";
import { create } from "zustand";

export const frontendLogsStore = create<LogStore>((set) => {
    const savedLogs = localStorage.getItem("frontned-logs");
    const initialLogs = savedLogs ? JSON.parse(savedLogs) : [];

    return {
        logs: initialLogs,
        addLog: (message: string) =>
            set((state) => {
                const newLogs = [...state.logs, message];
                localStorage.setItem("frontned-logs", JSON.stringify(newLogs));
                return { logs: newLogs };
            }),
        clearLogs: () => {
            localStorage.removeItem("frontned-logs");
            set({ logs: [] });
        },
    };
});
