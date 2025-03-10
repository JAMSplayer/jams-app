import React, { useCallback, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X as XIcon } from "lucide-react";
import {
    useTagManager,
    MAX_TAGS,
    MAX_TAG_LENGTH,
} from "../hooks/use-tag-manager";
import { useDebounce } from "use-debounce";

interface TagInputProps {
    initialTags?: string[];
    onChange?: (tags: string[]) => void;
}

export const TagInput: React.FC<TagInputProps> = ({
    initialTags = [],
    onChange,
}) => {
    const { tags, tagInput, setTagInput, addTag, removeTag } =
        useTagManager(initialTags);
    const [debouncedTags] = useDebounce(tags, 300);

    useEffect(() => {
        if (onChange) onChange(debouncedTags);
    }, [debouncedTags, onChange]);

    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setTagInput(e.target.value);
        },
        [setTagInput]
    );

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && tagInput.trim()) {
                e.preventDefault();
                addTag(e);
            }
        },
        [tagInput, addTag]
    );

    const handleAddTagClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            addTag(e);
        },
        [addTag]
    );

    return (
        <div className="w-full flex flex-col md:flex-row gap-4">
            {/* Tag Input on the Left */}
            <div className="w-full md:w-1/2">
                <label className="block text-sm font-medium mb-1">Tags</label>
                <div className="flex gap-2">
                    <Input
                        type="text"
                        value={tagInput}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Add a tag"
                        className="flex-1"
                        disabled={tags.length >= MAX_TAGS}
                    />
                    <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={handleAddTagClick}
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

            {/* Tags Display on the Right */}
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
