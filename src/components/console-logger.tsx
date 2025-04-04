import { frontendLogsStore } from "@/store/frontend-logs-store";
import { useEffect, useRef } from "react";

export default function ConsoleLogger() {
    const logs = frontendLogsStore((state) => state.logs);
    const clearLogs = frontendLogsStore((state) => state.clearLogs);
    const logEndRef = useRef<HTMLDivElement>(null);

    // auto scroll to latest log
    useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [logs]);

    return (
        <div className="p-3 bg-black text-green-400 font-mono text-sm h-64 overflow-y-auto">
            <button
                onClick={clearLogs}
                className="bg-red-500 text-white px-3 py-1 mb-2 rounded fixed right-8"
            >
                Clear Logs
            </button>
            {logs.map((log, index) => (
                <div key={index}>{log}</div>
            ))}
            <div ref={logEndRef} />
        </div>
    );
}
