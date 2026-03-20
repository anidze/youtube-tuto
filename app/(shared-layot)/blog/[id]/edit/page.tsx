"use client";

import { updateBlogAction } from "@/app/actions";
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
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { useQuery } from "convex/react";
import z from "zod";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import Image from "next/image";

export default function EditPostPage() {
  const { id } = useParams<{ id: string }>();
  const { data: session, isPending: isSessionPending } =
    authClient.useSession();
  const [isTransitioning, startTransition] = useTransition();
  const router = useRouter();

  const post = useQuery(api.posts.getPost, {
    postId: id as Id<"post">,
  });

  const form = useForm({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      image: undefined,
    },
  });

  // Populate form when post data loads
  useEffect(() => {
    if (post) {
      form.reset({
        title: post.title,
        content: post.body,
        image: undefined,
      });
    }
  }, [post, form]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isSessionPending && !session) {
      router.push("/auth/login");
    }
  }, [session, isSessionPending, router]);

  function onSubmit(data: z.infer<typeof postSchema>) {
    startTransition(async () => {
      await updateBlogAction(id as Id<"post">, data);
    });
  }

  if (post === undefined) {
    return (
      <div className="py-12 max-w-xl mx-auto">
        <Skeleton className="h-8 w-24 mb-8" />
        <Skeleton className="h-full w-full rounded-lg" />
      </div>
    );
  }

  return (
    <div className="py-12">
      <div className="max-w-xl mx-auto mb-4">
        <Link
          href={`/blog/${id}`}
          className={buttonVariants({ variant: "ghost" })}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Post
        </Link>
      </div>
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Edit Post
        </h1>
        <p className="text-xl text-muted-foreground pt-4">
          Update your blog article
        </p>
      </div>
      <Card className="w-full max-w-xl mx-auto">
        <CardHeader>
          <CardTitle>Edit Blog Article</CardTitle>
          <CardDescription>Make changes to your blog post</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FieldGroup className="gap-y-4">
              <Controller
                name="title"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Title</FieldLabel>
                    <Input
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter title"
                      {...field}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </Field>
                )}
              />
            </FieldGroup>
            <FieldGroup className="mt-2">
              <Controller
                name="content"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>Content</FieldLabel>
                    <Textarea
                      aria-invalid={fieldState.invalid}
                      placeholder="Enter content"
                      {...field}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </Field>
                )}
              />

              {post.imageUrl && (
                <div className="mb-2">
                  <p className="text-sm text-muted-foreground mb-2">
                    Current image:
                  </p>
                  <Image
                    src={post.imageUrl}
                    alt="Current post image"
                    width={400}
                    height={300}
                    className="rounded-lg w-full h-auto"
                  />
                </div>
              )}

              <Controller
                name="image"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel>
                      {post.imageUrl ? "Replace Image" : "Image"}
                    </FieldLabel>
                    <Input
                      type="file"
                      aria-invalid={fieldState.invalid}
                      placeholder="Choose new image"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        field.onChange(file);
                      }}
                    />
                    {fieldState.error && (
                      <p className="text-red-500 text-sm mt-1">
                        {fieldState.error.message}
                      </p>
                    )}
                  </Field>
                )}
              />
              <Button disabled={isTransitioning} type="submit">
                {isTransitioning ? (
                  <>
                    <Loader2 className="animate-spin mr-2" />
                    Saving Changes
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
