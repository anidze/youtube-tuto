"use client"
import { Card, CardTitle,CardHeader, CardDescription,CardContent } from "@/components/ui/card";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signUpSchema } from "@/app/schemas/auth";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import z from "zod";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Loader2 } from "lucide-react";

export default function SignUpPage () {
      const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const form= useForm({
        resolver: zodResolver(signUpSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
        }
    });
    function onSubmit(data: z.infer<typeof signUpSchema>) {
        startTransition( async()=>{await authClient.signUp.email({
    email: data.email,
    name: data.name,
    password: data.password,
          fetchOptions: { onSuccess:()=>{
                toast.success("Signd up successfully");   
                router.push("/");
              },
              onError:(err)=>{
                toast.error(err?.error?.message || "Failed to Signd up");
              },
    },
  });}
  
        )}
    return (
        <Card>
            <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>Create an Account to get started</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup className="gap-y-2">
                    <Controller name="name" control={form.control} render={({field,fieldState})=>(
                        <Field>
                            <FieldLabel>Name</FieldLabel>
                            
                                <Input aria-invalid={fieldState.invalid} placeholder="John Doe" {...field} /> 
                                {fieldState.error && <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>}
                           
                        </Field>
                    )}/>
                             <Controller name="email" control={form.control} render={({field,fieldState})=>(
                        <Field>
                            <FieldLabel>Email</FieldLabel>
                            
                                <Input aria-invalid={fieldState.invalid} placeholder="john.doe@example.com" {...field} /> 
                                {fieldState.error && <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>}
                           
                        </Field>
                    )}/>
                                   <Controller name="password" control={form.control} render={({field,fieldState})=>(
                        <Field>
                            <FieldLabel>Password</FieldLabel>
                            
                                <Input aria-invalid={fieldState.invalid} placeholder="********" type="password" {...field} /> 
                                {fieldState.error && <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>}
                           
                        </Field>
                    )}/>
                     <Button disabled={isPending} type="submit">{isPending ? <>
            <Loader2 className="animate-spin mr-2" />
            Logging in...
            </> : "Login"}</Button>
                </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}