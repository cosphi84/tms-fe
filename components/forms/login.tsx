"use client"

import {useRouter, useSearchParams} from "next/navigation";
import {Controller, useForm} from "react-hook-form";
import {LoginFormValues, LoginSchema} from "@/schemas/login";
import {zodResolver} from "@hookform/resolvers/zod"
import {cn} from "@/lib/utils";
import {Card, CardHeader, CardContent, CardFooter, CardDescription} from "@/components/ui/card";
import {FieldGroup, Field, FieldLabel, FieldError} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import React from "react";
import {Button} from "@/components/ui/button";
import {LogIn} from "lucide-react";
import {useLogin} from "@/queries/auth";
import {toast} from "sonner";



export function FrmLogin({ className, ...props}: React.ComponentProps<"div">) {
    const {mutate: login, isPending} = useLogin();
    const router = useRouter();
    const sparam = useSearchParams();

    const theForm = useForm<LoginFormValues>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {email: "", password: ""}
    });

    const onSubmit = (v: LoginFormValues) => {
        login(v, {
            onSuccess: ()=>{
                toast.success("Login successful");
                const prev = sparam.get("prev");
                const hash = window.location.hash;  // hash not in searchParams, window is fine here
                const target = prev
                    ? `${decodeURIComponent(prev)}${hash}`
                    : "/";
                router.push(target);
            }
        })
    }

    return (
        <div className={cn("flex flex-col gap-6", className)} {...props}>
            <Card className="rounded-2xl">
                <CardHeader>
                    <CardDescription>
                        TMS Login
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form id={"frmLogin"} onSubmit={theForm.handleSubmit(onSubmit)} className={"space-y-8"} noValidate>
                        <FieldGroup>

                            {/*----- Form Email --- */}
                            <Controller
                                name={"email"}
                                control={theForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={"frmLogin-email"}>
                                            Email
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id={"frmLogin-email"}
                                            type="email"
                                            placeholder="Your email here"
                                            autoComplete="email"        // ✅ was "off"
                                            aria-invalid={fieldState.invalid}
                                            aria-label="Email"
                                            className="rounded"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            {/*----- Form Password --- */}
                            <Controller
                                name={"password"}
                                control={theForm.control}
                                render={({ field, fieldState }) => (
                                    <Field data-invalid={fieldState.invalid}>
                                        <FieldLabel htmlFor={"frmLogin-password"}>
                                            Password
                                        </FieldLabel>
                                        <Input
                                            {...field}
                                            id={"frmLogin-password"}
                                            type="password"
                                            placeholder="Your secret password"
                                            autoComplete="current-password"        // ✅ was "off"
                                            aria-invalid={fieldState.invalid}
                                            aria-label="Password"
                                            className="rounded"
                                        />
                                        {fieldState.invalid && (
                                            <FieldError errors={[fieldState.error]} />
                                        )}
                                    </Field>
                                )}
                            />

                            {/*----- Login Button ---- */}
                            <Field orientation="horizontal" className="justify-center">
                                <Button
                                    type="submit"
                                    form="frmLogin"
                                    disabled={isPending}  // ✅ prevent double submit
                                    className="bg-primary rounded-md w-1/2 cursor-pointer hover:bg-gray-700 dark:hover:bg-gray-300"
                                >
                                    <LogIn className="h-6 w-6" />
                                    {  isPending ? "Signing in..." : "Log In"}  {/* ✅ loading state */}
                                </Button>
                            </Field>

                        </FieldGroup>
                    </form>
                </CardContent>
                <CardFooter>
                    <p className="text-xs text-center w-full">
                        Tools Management System (TMS) operated by{" "}

                        <a href="mailto:seid_mc-pl@seid.sharp-world.com"
                           target="_blank"
                           rel="noopener noreferrer"  // ✅ security: target="_blank" needs this
                        >
                            SEID CS Planning
                        </a>
                    </p>
                </CardFooter>
            </Card>
        </div>
    )
}