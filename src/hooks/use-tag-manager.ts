import { useState } from "react";
import { toast } from "sonner";

export const MAX_TAGS = 5;
export const MAX_TAG_LENGTH = 20;

export const useTagManager = (
    initialTags: string[] = [],
    setValue?: Function
) => {
    const [tags, setTags] = useState<string[]>(initialTags);
    const [tagInput, setTagInput] = useState<string>("");

    const addTag = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedTag = tagInput.trim().toLowerCase();
        const isValidTag = /^[a-zA-Z0-9]+$/.test(trimmedTag);

        console.log("Adding tag:", trimmedTag);
        console.log("Current tags:", tags);

        if (
            isValidTag &&
            trimmedTag &&
            trimmedTag.length <= MAX_TAG_LENGTH &&
            !tags.includes(trimmedTag) &&
            tags.length < MAX_TAGS
        ) {
            const updatedTags = [...tags, trimmedTag];
            // Log before updating state
            console.log("Updated tags:", updatedTags);

            setTags(updatedTags); // Update the tags state
            setTagInput(""); // Reset input field

            if (setValue) {
                setValue("tags", updatedTags); // Update the form value for tags
            }
        } else {
            console.log("Tag is invalid or max reached, not updating.");
            // Provide feedback for invalid tag
            if (!isValidTag) {
                toast("Invalid Tag", {
                    description: "Tags can only contain letters and numbers.",
                });
            } else if (trimmedTag.length > MAX_TAG_LENGTH) {
                toast("Tag Length", {
                    description: `Tags must be ${MAX_TAG_LENGTH} characters or less.`,
                });
            } else if (tags.length >= MAX_TAGS) {
                toast("Max Tags Reached", {
                    description: `You can only add up to ${MAX_TAGS} tags.`,
                });
            } else {
                toast("Tag already exists", {
                    description: `This tag is already added.`,
                });
            }
        }
    };

    const removeTag = (tag: string) => {
        const updatedTags = tags.filter((t) => t !== tag);
        setTags(updatedTags);
        if (setValue) {
            setValue("tags", updatedTags); // Update form value when tag is removed
        }
    };

    return {
        tags,
        tagInput,
        setTagInput,
        addTag,
        removeTag,
    };
};
