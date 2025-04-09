export type LogStore = {
    logs: string[];
    addLog: (message: string) => void;
    clearLogs: () => void;
};
