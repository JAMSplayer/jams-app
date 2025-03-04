import { FrontendLogs } from "@/enums/frontend-logs";
import { frontendLogsStore } from "@/store/frontend-logs-store";
import { useEffect } from "react";

export default function ConsoleInterceptor() {
    const addLog = frontendLogsStore((state) => state.addLog);

    useEffect(() => {
        const captureLog = (type: FrontendLogs) => {
            return (...args: any[]) => {
                const message = `[${type.toUpperCase()}] ${args
                    .map((arg) =>
                        typeof arg === "object" ? JSON.stringify(arg) : arg
                    )
                    .join(" ")}`;

                addLog(message);
                originalConsole[type](...args);
            };
        };

        // store original console methods
        const originalConsole = {
            log: console.log,
            info: console.info,
            warn: console.warn,
            error: console.error,
        };

        // override console methods
        console.log = captureLog(FrontendLogs.Log);
        console.info = captureLog(FrontendLogs.Info);
        console.warn = captureLog(FrontendLogs.Warn);
        console.error = captureLog(FrontendLogs.Error);

        return () => {
            // restore original console methods on unmount
            console.log = originalConsole.log;
            console.warn = originalConsole.warn;
            console.error = originalConsole.error;
        };
    }, [addLog]);

    return null; // this component does not render anything
}
