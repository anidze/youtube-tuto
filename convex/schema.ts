import { defineSchema, defineTable} from "convex/server";
import { v } from "convex/values";
export default defineSchema({
  post: defineTable({
    title: v.string(),
    body: v.string(),
    authorId: v.string(),
    authorName: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    likes: v.optional(v.number()),
  }),
  comment: defineTable({
    postId: v.id("post"),
    author: v.string(),
    body: v.string(),
  }),
});