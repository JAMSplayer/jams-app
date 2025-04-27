import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X as XIcon } from "lucide-react";

export const MAX_TAGS = 5;
export const MAX_TAG_LENGTH = 20;

interface TagInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
}

export const TagInput: React.FC<TagInputProps> = ({ tags, onChange }) => {
    const [tagInput, setTagInput] = useState<string>("");

    const addTag = () => {
        const trimmedTag = tagInput.trim().toLowerCase();
        const isValidTag = /^[a-zA-Z0-9]+$/.test(trimmedTag);

        if (
            isValidTag &&
            trimmedTag &&
            trimmedTag.length <= MAX_TAG_LENGTH &&
            !tags.includes(trimmedTag) &&
            tags.length < MAX_TAGS
        ) {
            onChange([...tags, trimmedTag]);
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter((tag) => tag !== tagToRemove));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <div className="w-full flex flex-col md:flex-row gap-4">
            {/* Input + Add Button */}
            <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium mb-1">Tags</label>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a tag"
                        className="flex-1"
                        disabled={tags.length >= MAX_TAGS}
                    />
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={addTag}
                        disabled={
                            tags.length >= MAX_TAGS ||
                            tagInput.trim().length === 0 ||
                            tagInput.trim().length > MAX_TAG_LENGTH ||
                            !/^[a-zA-Z0-9]*$/.test(tagInput.trim())
                        }
                    >
                        Add
                    </Button>
                </div>

                {/* Validation Messages */}
                {tagInput.trim().length > MAX_TAG_LENGTH && (
                    <p className="text-red-500 text-xs mt-1">
                        Tags cannot exceed {MAX_TAG_LENGTH} characters.
                    </p>
                )}
                {tags.length === MAX_TAGS && (
                    <p className="text-red-500 text-xs mt-1">
                        Max tags reached.
                    </p>
                )}
                {tagInput.trim().length > 0 &&
                    !/^[a-zA-Z0-9]*$/.test(tagInput) && (
                        <p className="text-red-500 text-xs mt-1">
                            Tags can only contain letters and numbers.
                        </p>
                    )}
            </div>

            {/* Tag Badges */}
            <div className="w-full md:w-1/2 flex flex-wrap gap-2 items-start p-3 min-h-[50px]">
                {tags.length === 0 ? (
                    <p className="text-gray-500 text-sm">No tags added.</p>
                ) : (
                    tags.map((tag, index) => (
                        <Badge
                            key={index}
                            className="flex items-center space-x-1"
                            size="sm"
                        >
                            <span className="truncate max-w-[80px]" title={tag}>
                                {tag}
                            </span>
                            <button
                                type="button"
                                onClick={() => removeTag(tag)}
                            >
                                <XIcon size={14} />
                            </button>
                        </Badge>
                    ))
                )}
            </div>
        </div>
    );
};
