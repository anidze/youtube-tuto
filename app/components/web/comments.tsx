"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { MessageCircle, Send, User } from "lucide-react";

export default function Comments({ postId }: { postId: Id<"post"> }) {
  const comments = useQuery(api.posts.getComments, { postId });
  const addComment = useMutation(api.posts.addComment);

  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;

    setSubmitting(true);
    try {
      await addComment({ postId, author: author.trim() || "Anonymous", body: body.trim() });
      setBody("");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-12 border-t pt-8">
      <h2 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <MessageCircle className="h-6 w-6" />
        Comments {comments && comments.length > 0 && `(${comments.length})`}
      </h2>

      <form onSubmit={handleSubmit} className="mb-8 space-y-4">
        <Input
          placeholder="Your name (optional)"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          maxLength={50}
        />
        <Textarea
          placeholder="Write a comment..."
          value={body}
          onChange={(e) => setBody(e.target.value)}
          required
          maxLength={1000}
          rows={3}
        />
        <Button type="submit" disabled={submitting || !body.trim()}>
          <Send className="mr-2 h-4 w-4" />
          {submitting ? "Posting..." : "Post Comment"}
        </Button>
      </form>

      <Separator className="mb-6" />

      {comments === undefined && (
        <p className="text-muted-foreground">Loading comments...</p>
      )}

      {comments && comments.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No comments yet. Be the first to comment!
        </p>
      )}

      <div className="space-y-4">
        {comments?.map((comment) => (
          <Card key={comment._id}>
            <CardContent className="pt-4">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-sm">{comment.author}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(comment._creationTime).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
