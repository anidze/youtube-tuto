import { mutation, query, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";

async function resolveAuthorName(ctx: QueryCtx, authorId: string, storedName?: string): Promise<string> {
  if (storedName) return storedName;
  try {
    const user = await authComponent.getAnyUserById(ctx, authorId);
    return (user as unknown as { name?: string })?.name || "Unknown";
  } catch {
    return "Unknown";
  }
}

// Create a new task with the given text
export const createPost = mutation({
  args: { title: v.string(), body: v.string(), storageId: v.optional(v.id("_storage")) },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }
    const blogArticle = await ctx.db.insert("post", {
      title: args.title,
      body: args.body,
      authorId: user._id as string,
      authorName: (user as unknown as { name: string }).name || "Unknown",
      imageStorageId: args.storageId,
    });
    return blogArticle;
  },
});
export const getPosts = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const posts = await ctx.db.query("post").order("desc").collect();
    return Promise.all(
      posts.map(async (post) => ({
        ...post,
        authorName: await resolveAuthorName(ctx, post.authorId, post.authorName ?? undefined),
        imageUrl: post.imageStorageId
          ? await ctx.storage.getUrl(post.imageStorageId)
          : null,
        isAuthor: user ? post.authorId === (user._id as string) : false,
      }))
    );
  },
});

export const getMyPosts = query({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      return [];
    }
    const posts = await ctx.db.query("post").order("desc").collect();
    const myPosts = posts.filter((post) => post.authorId === (user._id as string));
    return Promise.all(
      myPosts.map(async (post) => ({
        ...post,
        authorName: await resolveAuthorName(ctx, post.authorId, post.authorName ?? undefined),
        imageUrl: post.imageStorageId
          ? await ctx.storage.getUrl(post.imageStorageId)
          : null,
        isAuthor: true,
      }))
    );
  },
});

export const getPost = query({
  args: { postId: v.id("post") },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new ConvexError("Post not found");
    }
    const imageUrl = post.imageStorageId
      ? await ctx.storage.getUrl(post.imageStorageId)
      : null;
    return {
      ...post,
      authorName: await resolveAuthorName(ctx, post.authorId, post.authorName ?? undefined),
      imageUrl,
      isAuthor: user ? post.authorId === (user._id as string) : false,
    };
  },
});
export const generateImageUploadURL = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if(!user){
      throw new ConvexError("Not Authenticated");
    }
    // Generate and return the image upload URL here
    return await ctx.storage.generateUploadUrl();
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

    if (post.authorId !== (user._id as string)) {
      throw new ConvexError("Unauthorized: You can only delete your own posts");
    }

    await ctx.db.delete(args.postId);
    return { success: true };
  },
});

export const updatePost = mutation({
  args: {
    postId: v.id("post"),
    title: v.string(),
    body: v.string(),
    storageId: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await authComponent.safeGetAuthUser(ctx);
    if (!user) {
      throw new ConvexError("Not authenticated");
    }

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new ConvexError("Post not found");
    }

    if (post.authorId !== (user._id as string)) {
      throw new ConvexError("Unauthorized: You can only edit your own posts");
    }

    await ctx.db.patch(args.postId, {
      title: args.title,
      body: args.body,
      ...(args.storageId !== undefined && { imageStorageId: args.storageId }),
    });

    return { success: true };
  },
});

