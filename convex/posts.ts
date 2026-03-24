import { mutation, query, QueryCtx } from "./_generated/server";
import { ConvexError, v } from "convex/values";
import { authComponent } from "./auth";

interface AuthUser {
  _id: string;
  name: string;
  email: string;
}

function getUser(user: unknown): AuthUser {
  return user as AuthUser;
}

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
      authorId: getUser(user)._id,
      authorName: getUser(user).name || "Unknown",
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
        isAuthor: user ? post.authorId === getUser(user)._id : false,
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
    const myPosts = posts.filter((post) => post.authorId === getUser(user)._id);
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
      isAuthor: user ? post.authorId === getUser(user)._id : false,
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

    if (post.authorId !== getUser(user)._id) {
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

    if (post.authorId !== getUser(user)._id) {
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

export const likePost = mutation({
  args: { postId: v.id("post"), unlike: v.boolean() },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new ConvexError("Post not found");
    }
    const currentLikes = post.likes ?? 0;
    const newLikes = args.unlike
      ? Math.max(0, currentLikes - 1)
      : currentLikes + 1;
    await ctx.db.patch(args.postId, { likes: newLikes });
    return { likes: newLikes };
  },
});

export const getComments = query({
  args: { postId: v.id("post") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comment")
      .filter((q) => q.eq(q.field("postId"), args.postId))
      .order("desc")
      .collect();
  },
});

export const addComment = mutation({
  args: { postId: v.id("post"), author: v.string(), body: v.string() },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new ConvexError("Post not found");
    }
    return await ctx.db.insert("comment", {
      postId: args.postId,
      author: args.author.trim() || "Anonymous",
      body: args.body.trim(),
    });
  },
});

