import { Button } from "@/components/ui/button";
import { ArrowLeftIcon } from "lucide-react";

export default function SingleFilePanel({ onBack }: { onBack: () => void }) {
    return (
        <div>
            <div className="w-full sticky top-[3.5rem] bg-background z-50 border-b border-t border-secondary p-2 border-l">
                <div className="flex items-center space-x-2">
                    <Button
                        variant={"ghost"}
                        onClick={onBack} // Trigger the back function passed as a prop
                    >
                        <ArrowLeftIcon size={20} />
                    </Button>
                </div>
            </div>
            Single 2
        </div>
    );
}
