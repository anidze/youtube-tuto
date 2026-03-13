'use client';

import { postSchema } from "@/app/schemas/blog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "convex/react";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

export default function CreateRoute() {
    const mutation=useMutation(api.posts.createPost);
        const form= useForm({
            resolver: zodResolver(postSchema),
            defaultValues: {
                title:"",
                content:"",
            }
        });
        function onSubmit(data: z.infer<typeof postSchema>) {
            mutation({
                title: data.title,
                body: data.content,
            })

        }
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Create Post
        </h1>
        <p className="text-xl text-muted-foreground pt-4">
          Share your thoughts with the big world
        </p>
      </div>
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Create Blog Article</CardTitle>
          <CardDescription>Create a new blog article</CardDescription>
        </CardHeader>
<CardContent>
    <form onSubmit={form.handleSubmit(onSubmit)}>
                <FieldGroup className="gap-y-4">
            <Controller name="title" control={form.control} render={({field,fieldState})=>(
                <Field>
                    <FieldLabel>Title</FieldLabel>
                    
                        <Input aria-invalid={fieldState.invalid} placeholder="Enter title" {...field} /> 
                        {fieldState.error && <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>}
                   
                </Field>
            )}/>
        </FieldGroup>
                <FieldGroup className="mt-2">
            <Controller name="content" control={form.control} render={({field,fieldState})=>(
                <Field>
                    <FieldLabel>Content</FieldLabel>
                    
                        <Textarea aria-invalid={fieldState.invalid} placeholder="Enter content" {...field} /> 
                        {fieldState.error && <p className="text-red-500 text-sm mt-1">{fieldState.error.message}</p>}
                   
                </Field>
            )}/>
            <Button type="submit" className="mt-4">Create Post</Button>
        </FieldGroup>
    </form>
</CardContent>
      </Card>
    </div>
  );
}
