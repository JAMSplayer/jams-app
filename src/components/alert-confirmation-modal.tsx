import { Button } from "@/components/ui/button"; // Use your button component
import Portal from "./portal";

type AlertConfirmationModalProps = {
    title: string;
    description: string;
    onConfirm: () => void;
    onCancel: () => void;
};

export const AlertConfirmationModal: React.FC<AlertConfirmationModalProps> = ({
    title,
    description,
    onConfirm,
    onCancel,
}) => {
    return (
        <Portal>
            <div className="fixed inset-0 bg-black backdrop-blur-sm bg-opacity-60 flex items-center justify-center z-40">
                <div className="bg-background border p-6 rounded-lg shadow-lg w-full max-w-sm m-4">
                    {/* Title */}
                    <h2 className="text-xl font-semibold mb-4">{title}</h2>

                    {/* Description */}
                    <div className="text-sm text-gray-600 mb-6 whitespace-pre-wrap">
                        {description}
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end space-x-4">
                        <Button
                            onClick={onCancel}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onConfirm}
                            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            </div>
        </Portal>
    );
};
