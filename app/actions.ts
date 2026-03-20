"use server";
import z from "zod";
import { postSchema } from "./schemas/blog";
import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
import { Id } from "@/convex/_generated/dataModel";

export async function createBlogAction(data: z.infer<typeof postSchema>) {
  const parsed = postSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Something went wrong");
  }

  // Upload image if provided
  let storageId: Id<"_storage"> | undefined = undefined;
  try {
    if (parsed.data.image) {
      const imageUrl = await fetchAuthMutation(
        api.posts.generateImageUploadURL,
        {}
      );
      const uploadResult = await fetch(imageUrl, {
        method: "POST",
        headers: {
          "Content-Type": parsed.data.image.type || "application/octet-stream",
        },
        body: parsed.data.image,
      });
      if (!uploadResult.ok) {
        throw new Error("Failed to upload image");
      }
      const uploadData = await uploadResult.json();
      storageId = uploadData.storageId;
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }

  // Create the blog post
  await fetchAuthMutation(api.posts.createPost, {
    body: parsed.data.content,
    title: parsed.data.title,
    storageId: storageId,
  });
  redirect("/");
}

export async function updateBlogAction(
  postId: Id<"post">,
  data: z.infer<typeof postSchema>
) {
  const parsed = postSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error("Something went wrong");
  }

  let storageId: Id<"_storage"> | undefined = undefined;
  try {
    if (parsed.data.image) {
      const imageUrl = await fetchAuthMutation(
        api.posts.generateImageUploadURL,
        {}
      );
      const uploadResult = await fetch(imageUrl, {
        method: "POST",
        headers: {
          "Content-Type": parsed.data.image.type || "application/octet-stream",
        },
        body: parsed.data.image,
      });
      if (!uploadResult.ok) {
        throw new Error("Failed to upload image");
      }
      const uploadData = await uploadResult.json();
      storageId = uploadData.storageId;
    }
  } catch (error) {
    console.error("Error uploading image:", error);
    throw new Error("Failed to upload image");
  }

  await fetchAuthMutation(api.posts.updatePost, {
    postId,
    body: parsed.data.content,
    title: parsed.data.title,
    ...(storageId !== undefined && { storageId }),
  });
  redirect(`/blog/${postId}`);
}