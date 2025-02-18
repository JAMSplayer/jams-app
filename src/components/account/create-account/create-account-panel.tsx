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
import { RegisterAccountUser } from "@/types/account-user";
import { registerUser, signIn } from "@/backend/logic";
import { useTranslation } from "react-i18next";
import { listAccounts } from "@/backend/autonomi";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";

interface CreateAccountPanelProps {
    onReturnToSignInPanelClicked: () => void;
}

const CreateAccountPanel: React.FC<CreateAccountPanelProps> = ({
    onReturnToSignInPanelClicked,
}) => {
    // ====================================================================================
    // Create Account Form Functionality
    // ====================================================================================
    const { t } = useTranslation();

    const createAccountForm = useForm<z.infer<typeof createAccountSchema>>({
        resolver: zodResolver(createAccountSchema),
        mode: "onChange",
        defaultValues: {
            username: "",
            password: "",
            confirmPassword: "",
        },
    });

    const {
        handleSubmit,
        register,
        control,
        formState: { isValid },
    } = createAccountForm;

    const [usernameAlreadyExistsError, setUsernameAlreadyExistsError] =
        useState<string | null>(null);

    type CreateAccountFormData = z.infer<typeof createAccountSchema>;

    const [isLoading, setIsLoading] = useState(false);

    const onSubmit = async (data: CreateAccountFormData) => {
        console.log(data.username);
        if (!isUsernameValid(data.username)) {
            return;
        }

        setIsLoading(true);

        const newUser: RegisterAccountUser = {
            username: data.username,
            password: data.password,
            dateCreated: new Date(),
            dateUpdated: new Date(),
        };

        try {
            setIsLoading(true);

            const result = await registerUser(newUser);

            if (!result) {
                toast("Register Error", {
                    description: "Failed to register. Please try again.",
                });
                return;
            }

            try {
                const result = await signIn(newUser.username, newUser.password);
                if (!result) {
                    toast("Sign In Error", {
                        description: "Failed to sign in. Please try again.",
                    });
                    return;
                }
            } catch (error) {
                toast("Sign In Error", { description: "Sign-in failed:" });
            }
        } catch (error) {
            console.log("Register Error", {
                description: "Registration or Sign-in failed:",
                error,
            });
            toast("Register Error", {
                description: "Registration failed. Please try again",
            });
        } finally {
            setIsLoading(false);
        }
    };

    const isUsernameValid = async (username: string) => {
        try {
            const accounts = await listAccounts();

            if (!accounts) {
                setUsernameAlreadyExistsError(null);
                return false;
            }

            const foundAccount = accounts.find(
                ([accountUsername]) => accountUsername === username
            );

            if (foundAccount) {
                setUsernameAlreadyExistsError(t("thisUsernameAlreadyExists"));
                return false;
            } else {
                setUsernameAlreadyExistsError(null);
                return true;
            }
        } catch (error) {
            console.error("Error checking username:", error);
            return false;
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
                    <div className="text-md">{t("createAccount")}</div>
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
                                    <FormLabel>{t("username")}</FormLabel>
                                    <>
                                        <FormControl>
                                            <Input
                                                placeholder={t(
                                                    "enterYourUsername"
                                                )}
                                                autoCapitalize="off"
                                                autoComplete="off"
                                                autoCorrect="off"
                                                {...field} // Spread field instead of using register directly
                                                onChange={(e) => {
                                                    field.onChange(e); // Update field value
                                                    isUsernameValid(
                                                        e.target.value
                                                    ); // Validate on change
                                                }}
                                            />
                                        </FormControl>
                                        {usernameAlreadyExistsError && (
                                            <p className="text-destructive text-sm text-left">
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
                            render={() => (
                                <FormItem>
                                    <FormLabel>{t("password")}</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder={t("enterYourPassword")}
                                            type="password"
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            {...register("password")}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={createAccountForm.control}
                            name="confirmPassword"
                            render={() => (
                                <FormItem>
                                    <FormLabel>
                                        {t("confirmPassword")}
                                    </FormLabel>
                                    <>
                                        <FormControl>
                                            <Input
                                                placeholder={t(
                                                    "confirmYourPassword"
                                                )}
                                                type="password"
                                                autoCapitalize="off"
                                                autoComplete="off"
                                                autoCorrect="off"
                                                {...register("confirmPassword")}
                                            />
                                        </FormControl>
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
                                    isLoading ||
                                    !isValid ||
                                    usernameAlreadyExistsError !== null
                                }
                            >
                                {isLoading ? (
                                    <span className="inline-flex items-center gap-x-2">
                                        {"Loading"}
                                        <LoadingSpinner />
                                    </span>
                                ) : (
                                    t("createAccount")
                                )}
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default CreateAccountPanel;
