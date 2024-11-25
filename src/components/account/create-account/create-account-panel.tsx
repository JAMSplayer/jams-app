import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "../../ui/form";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAccountSchema } from "@/form-schemas/create-account-schema";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { RecentAccount } from "@/types/recent-account";
import { RegisterAccountUser } from "@/types/account-user";
import { registerUser } from "@/backend/logic";

interface CreateAccountPanelProps {
    onReturnToSignInPanelClicked: () => void;
}

const CreateAccountPanel: React.FC<CreateAccountPanelProps> = ({
    onReturnToSignInPanelClicked,
}) => {
    // ====================================================================================
    // Create Account Form Functionality
    // ====================================================================================

    const createAccountForm = useForm<z.infer<typeof createAccountSchema>>({
        resolver: zodResolver(createAccountSchema),
        defaultValues: {
            username: "",
            password: "",
            confirmPassword: "",
        },
    });

    // const { handleSubmit, control, formState, setValue, register }
    const { handleSubmit, control, formState } = createAccountForm;

    const [usernameAlreadyExistsError, setUsernameAlreadyExistsError] =
        useState<string | null>(null);
    const [confirmPasswordError, setConfirmPasswordError] = useState<
        string | null
    >(null);

    type CreateAccountFormData = z.infer<typeof createAccountSchema>;
    const onSubmit = (data: CreateAccountFormData) => {
        console.log(data);

        const newUser: RegisterAccountUser = {
            username: data.username,
            password: data.password,
            dateCreated: new Date(),
            dateUpdated: new Date(),
        };

        // Proceed with account creation
        registerUser(newUser);
    };
    const validatePasswords = (password: string, confirmPassword: string) => {
        if (password !== confirmPassword) {
            setConfirmPasswordError("Passwords do not match");
        } else {
            setConfirmPasswordError(null); // Clear error if passwords match
        }
    };

    // TODO currently we are using this as a way to store all existing accounts - get from the hook
    // recentAccountList, setRecentAccountList
    const [recentAccountList] = useState<RecentAccount[]>([]);

    const validateUsername = (username: string) => {
        const foundAccount = recentAccountList.find(
            (account) => account.username === username
        );

        if (foundAccount) {
            setUsernameAlreadyExistsError("This username already exists");
        } else {
            setUsernameAlreadyExistsError(null);
        }
    };

    const handleReturnToSignInPanelClicked = () => {
        onReturnToSignInPanelClicked();
    };

    return (
        <div className="flex flex-col w-full">
            <ArrowLeft
                size={16}
                className="cursor-pointer"
                onClick={handleReturnToSignInPanelClicked}
            />{" "}
            <div className="px-4">
                <div className="flex justify-center items-center">
                    <div className="text-md">Create Account</div>
                </div>
                <Form {...createAccountForm}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-2 pt-4"
                    >
                        <FormField
                            control={control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <>
                                        <FormControl>
                                            <Input
                                                placeholder="Enter your username"
                                                autoCapitalize="off"
                                                autoComplete="off"
                                                autoCorrect="off"
                                                {...field} // Spread field instead of using register directly
                                                onChange={(e) => {
                                                    field.onChange(e); // Update field value
                                                    validateUsername(
                                                        e.target.value
                                                    ); // Validate on change
                                                }}
                                            />
                                        </FormControl>
                                        {usernameAlreadyExistsError && (
                                            <p className="text-sm text-right">
                                                {usernameAlreadyExistsError}
                                            </p>
                                        )}
                                    </>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={createAccountForm.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your password"
                                            type="password"
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            {...field}
                                            onChange={(e) => {
                                                field.onChange(e); // Update field value
                                                validatePasswords(
                                                    e.target.value,
                                                    createAccountForm.watch(
                                                        "confirmPassword"
                                                    )
                                                ); // Validate on change
                                            }}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={createAccountForm.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <>
                                        <FormControl>
                                            <Input
                                                placeholder="Confirm your password"
                                                type="password"
                                                autoCapitalize="off"
                                                autoComplete="off"
                                                autoCorrect="off"
                                                {...field}
                                                onChange={(e) => {
                                                    field.onChange(e); // Update field value
                                                    validatePasswords(
                                                        createAccountForm.watch(
                                                            "password"
                                                        ),
                                                        e.target.value
                                                    ); // Validate on change
                                                }}
                                            />
                                        </FormControl>
                                        {confirmPasswordError && (
                                            <p className="text-sm text-right">
                                                {confirmPasswordError}
                                            </p>
                                        )}
                                    </>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                disabled={
                                    !formState.isValid ||
                                    confirmPasswordError != null
                                }
                            >
                                Create Account
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default CreateAccountPanel;
