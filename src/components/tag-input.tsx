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
import { useDebounce } from "use-debounce"; // We'll use debounce from a helper library

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

    // Using useDebounce to delay the state update for tags (debounce input for a more stable UI)
    const [debouncedTags] = useDebounce(tags, 300); // 300ms debounce time to avoid rapid state changes

    // Notify parent component about tag changes only after debounce
    useEffect(() => {
        if (onChange) onChange(debouncedTags); // Send debounced tags to parent component
    }, [debouncedTags, onChange]);

    // Change handler for input field
    const handleInputChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setTagInput(e.target.value);
        },
        [setTagInput]
    );

    // Add tag handler
    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === "Enter" && tagInput.trim()) {
                e.preventDefault(); // Prevent form submission or other default behavior
                addTag(e); // Add the tag
            }
        },
        [tagInput, addTag] // Make sure the `tagInput` and `addTag` are updated correctly
    );

    const handleAddTagClick = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.preventDefault();
            addTag(e); // Add the tag on click
        },
        [addTag]
    );

    return (
        <div>
            <label className="block text-sm font-medium mb-1">Tags</label>
            <div className="flex gap-2 mb-2">
                <Input
                    type="text"
                    value={tagInput}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown} // Use the correct event type
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
                <p className="text-red-500 text-xs">
                    Tags cannot exceed {MAX_TAG_LENGTH} characters.
                </p>
            )}
            {tags.length === MAX_TAGS && (
                <p className="text-red-500 text-xs">Max tags reached.</p>
            )}
            {tagInput.trim().length > 0 && !/^[a-zA-Z0-9]*$/.test(tagInput) && (
                <p className="text-red-500 text-xs">
                    Tags can only contain letters and numbers.
                </p>
            )}

            {/* Tags Display */}
            <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag, index) => (
                    <Badge
                        key={index}
                        className="flex items-center space-x-1"
                        size="sm"
                    >
                        <span className="truncate max-w-[80px]" title={tag}>
                            {tag}
                        </span>
                        <button type="button" onClick={() => removeTag(tag)}>
                            <XIcon size={14} />
                        </button>
                    </Badge>
                ))}
            </div>
        </div>
    );
};
