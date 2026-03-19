import { mutation, query } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";

// Create a new task with the given text
export const createPost = mutation({
  args: { title: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }
    const blogArticle = await ctx.db.insert("post", {
      title: args.title,
      body: args.body,
      authorId: user._id as string,
    });
    return blogArticle;
  },
});
export const getPosts = query({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query("post").order("desc").collect();
    return posts;
  },
});

export const deletePost = mutation({
  args: { postId: v.id("post") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new ConvexError("Post not found");
    }

    if (post.authorId !== user._id) {
      throw new ConvexError("Unauthorized: You can only delete your own posts");
    }

    await ctx.db.delete(args.postId);
    return { success: true };
  },
});