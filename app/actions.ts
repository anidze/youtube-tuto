"use server";
import z from "zod";
import { postSchema } from "./schemas/blog";

   

export async function createBlogAction(data: z.infer<typeof postSchema>){

}