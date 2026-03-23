
"use client";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/dist/client/link";
import Image from "next/image";
import { Suspense } from "react";
import { User } from "lucide-react";

function AllPostsGrid() {
  const data = useQuery(api.posts.getPosts);

  if (data && data.length === 0) {
    return (
      <p className="text-center text-muted-foreground text-lg">
        No articles yet.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {data?.map((post) => {
        const imageUrl = post.imageUrl
          || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNu9uulWIgqP6ax8ikiM4eQUf2cNqGtOMkaQ&s";

        return (
          <Card key={post._id} className="pt-0 flex flex-col">
            <div className="relative aspect-video w-full overflow-hidden">
              <Image
                src={imageUrl}
                alt="Blog Post Image"
                fill
                className="rounded-t-lg object-cover"
              />
            </div>
            <CardContent className="px-6 flex-1">
              <Link href={`/blog/${post._id}`}>
                <h1 className="text-2xl font-bold hover:text-primary">
                  {post.title}
                </h1>
              </Link>
              <p className="text-muted-foreground line-clamp-3">{post.body}</p>
              <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{post.authorName || "Unknown"}</span>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 px-6 mt-auto">
              <Link
                className={buttonVariants({ className: "flex-1" })}
                href={`/blog/${post._id}`}
              >
                Read More
              </Link>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="pt-0">
          <Skeleton className="h-48 w-full rounded-t-lg" />
          <CardContent className="pt-4">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full mb-1" />
            <Skeleton className="h-4 w-5/6" />
          </CardContent>
          <CardFooter>
            <Skeleton className="h-10 w-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          All Articles
        </h1>
        <p className="pt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
          Browse articles from all authors.
        </p>
      </div>
      <Suspense fallback={<GridSkeleton />}>
        <AllPostsGrid />
      </Suspense>
    </div>
  );
}
