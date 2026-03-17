"use client";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import Link from "next/dist/client/link";
import Image from "next/image";
export default function BlogPage() {
  const data = useQuery(api.posts.getPosts);
  return (
    <div className="py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Our Blog
        </h1>
        <p className="pt-4 max-w-2xl mx-auto text-xl text-muted-foreground">
          Insight, thought, and trend from our team.
        </p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {data?.map((post) => (
          <Card key={post._id} className="pt-0">
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNu9uulWIgqP6ax8ikiM4eQUf2cNqGtOMkaQ&s" alt="Blog Post Image"
              fill
              className="rounded-t-lg"/>
            </div>
            <CardContent>
                <Link href={`/blog/${post._id}`}>
                    <h1 className="tet-2xl font-bold hover:text-primary">{post.title}</h1>
                </Link>
                <p className="text-muted-foreground line-clamp-3">
                    {post.body}
                </p>
            </CardContent>
            <CardFooter>
                <Link className={buttonVariants({
                    className:"w-full"
                }) } href={`/blog/${post._id}`}>
                    Read More
                </Link>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
