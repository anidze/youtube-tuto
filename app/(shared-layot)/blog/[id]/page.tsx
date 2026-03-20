"use client";

import { buttonVariants } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery } from "convex/react";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/dist/client/link";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const post = useQuery(api.posts.getPost, {
    postId: id as Id<"post">,
  });

  if (post === undefined) {
    return (
      <div className="py-12 max-w-3xl mx-auto">
        <Skeleton className="h-8 w-24 mb-8" />
        <Skeleton className="h-[400px] w-full rounded-lg mb-8" />
        <Skeleton className="h-10 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    );
  }

  return (
    <div className="py-12 max-w-3xl mx-auto">
      <Link
        href="/blog"
        className={buttonVariants({ variant: "ghost", className: "mb-8" })}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Blog
      </Link>

      <div className="relative h-[400px] w-full overflow-hidden rounded-lg mb-8">
        <Image
          src={post.imageUrl
            || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNu9uulWIgqP6ax8ikiM4eQUf2cNqGtOMkaQ&s"
          }
          alt={post.title}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      <h1 className="text-4xl font-extrabold tracking-tight mb-4">
        {post.title}
      </h1>

      <p className="text-lg text-muted-foreground leading-relaxed whitespace-pre-wrap">
        {post.body}
      </p>
    </div>
  );
}
