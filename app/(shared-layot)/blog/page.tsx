"use client";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useQuery, useMutation } from "convex/react";
import Link from "next/dist/client/link";
import Image from "next/image";
import { Suspense } from "react";
import { authClient } from "@/lib/auth-client";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

function BlogGrid() {
  const data = useQuery(api.posts.getPosts);
  const deletePost = useMutation(api.posts.deletePost);
  const { data: session } = authClient.useSession();

  const handleDelete = async (postId: Id<"post">) => {
    try {
      await deletePost({ postId });
      toast.success("Post deleted successfully");
    } catch (error) {
      toast.error("Failed to delete post");
      console.error(error);
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {data?.map((post) => {
        const imageUrl = post.imageUrl
          || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNu9uulWIgqP6ax8ikiM4eQUf2cNqGtOMkaQ&s";
        
        return (
        <Card key={post._id} className="pt-0 flex flex-col">
          <div className="relative h-48 w-full overflow-hidden">
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
          </CardContent>
          <CardFooter className="flex gap-2 px-6 mt-auto">
            <Link
              className={buttonVariants({
                className: "flex-1",
              })}
              href={`/blog/${post._id}`}
            >
              Read More
            </Link>
            {session && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      this blog post.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className={buttonVariants()}>
                      No
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className={buttonVariants({ variant: "destructive" })}
                      onClick={() => handleDelete(post._id)}
                    >
                      Yes
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </CardFooter>
        </Card>
        );
      })}
    </div>
  );
}

function BlogGridSkeleton() {
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

export default function BlogPage() {
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
      <Suspense fallback={<BlogGridSkeleton />}>
        <BlogGrid />
      </Suspense>
    </div>
  );
}
