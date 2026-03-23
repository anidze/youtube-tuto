"use client";

import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface WikipediaData {
  title: string;
  html: string;
  url: string;
}

export default function WikipediaArticle({ title }: { title: string }) {
  const [data, setData] = useState<WikipediaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!title) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchWikipedia() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `/api/wikipedia?title=${encodeURIComponent(title)}`,
          { signal: controller.signal }
        );
        const json = await res.json();

        if (!res.ok) {
          setError(json.notFound ? "notFound" : json.error);
          return;
        }

        setData(json);
      } catch (err: unknown) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError("Failed to load Wikipedia article");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchWikipedia();

    return () => controller.abort();
  }, [title]);

  if (loading) {
    return (
      <div className="mt-12 border-t pt-8">
        <Skeleton className="h-8 w-64 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6 mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-4/6 mb-2" />
        <Skeleton className="h-40 w-full mt-4" />
      </div>
    );
  }

  if (error === "notFound" || !data) {
    return (
      <div className="mt-12 border-t pt-8 text-center text-muted-foreground">
        <p className="text-lg">
          Wikipedia article for &quot;{title}&quot; was not found.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-12 border-t pt-8 text-center text-destructive">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="mt-12 border-t pt-8">
      <div
        className="wikipedia-content prose prose-sm dark:prose-invert max-w-none"
        dangerouslySetInnerHTML={{ __html: data.html }}
      />
    </div>
  );
}
