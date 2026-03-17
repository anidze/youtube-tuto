"use server";
import z from "zod";
import { postSchema } from "./schemas/blog";
import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";
import { redirect } from "next/navigation";
   

export async function createBlogAction(data: z.infer<typeof postSchema>){
const parsed =postSchema.safeParse(data);
if(!parsed.success){
    throw new Error("Something went wrong");
}
await fetchAuthMutation(
    api.posts.createPost,
    {
        body: parsed.data.content,
        title: parsed.data.title,
    }
);
redirect("/");
}