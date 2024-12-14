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
import { recoverAccountSchema } from "@/form-schemas/recover-account-schema";
import { Input } from "@/components/ui/input";
import { RecoverAccountUser } from "@/types/account-user";
import { registerUser } from "@/backend/logic";

interface RecoverAccountPanelProps {
    onReturnToSignInPanelClicked: () => void;
}

const RecoverAccountPanel: React.FC<RecoverAccountPanelProps> = ({
    onReturnToSignInPanelClicked,
}) => {
    // ====================================================================================
    // Recover Account Form Functionality
    // ====================================================================================

    const recoverAccountForm = useForm<z.infer<typeof recoverAccountSchema>>({
        resolver: zodResolver(recoverAccountSchema),
        mode: "onChange",
        defaultValues: {
            secretKey: "",
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
    } = recoverAccountForm;

    type RecoverAccountFormData = z.infer<typeof recoverAccountSchema>;
    const onSubmit = (data: RecoverAccountFormData) => {
        console.log(data);

        const newUser: RecoverAccountUser = {
            secretKey: data.secretKey,
            username: data.username,
            password: data.password,
            dateCreated: new Date(),
            dateUpdated: new Date(),
        };

        // Proceed with account creation
        registerUser(newUser);
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
                    <div className="text-md">Recover Account</div>
                </div>
                <Form {...recoverAccountForm}>
                    <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="space-y-2 pt-4"
                    >
                        <FormField
                            control={control}
                            name="secretKey"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Secret Key</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your secret key"
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            {...register("secretKey")}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="username"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your username"
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            {...register("username")}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={control}
                            name="password"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Enter your password"
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
                            control={control}
                            name="confirmPassword"
                            render={() => (
                                <FormItem>
                                    <FormLabel>Confirm Password</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Confirm your password"
                                            type="password"
                                            autoCapitalize="off"
                                            autoComplete="off"
                                            autoCorrect="off"
                                            {...register("confirmPassword")}
                                        />
                                    </FormControl>

                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="pt-2">
                            <Button
                                type="submit"
                                className="mt-4 w-full"
                                disabled={!isValid}
                            >
                                Recover Account
                            </Button>
                        </div>
                    </form>
                </Form>
            </div>
        </div>
    );
};

export default RecoverAccountPanel;
