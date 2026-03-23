import { NextRequest, NextResponse } from "next/server";
import DOMPurify from "isomorphic-dompurify";

export async function GET(request: NextRequest) {
  const title = request.nextUrl.searchParams.get("title");

  if (!title || title.trim().length === 0) {
    return NextResponse.json(
      { error: "title parameter is required" },
      { status: 400 }
    );
  }

  const sanitizedTitle = title.trim();

  const params = new URLSearchParams({
    action: "parse",
    page: sanitizedTitle,
    prop: "text",
    format: "json",
    origin: "*",
    disableeditsection: "true",
    disabletoc: "false",
  });

  const wikiUrl = `https://en.wikipedia.org/w/api.php?${params.toString()}`;

  try {
    const response = await fetch(wikiUrl, {
      headers: { "User-Agent": "BlogApp/1.0 (Wikipedia Article Viewer)" },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch from Wikipedia" },
        { status: 502 }
      );
    }

    const data = await response.json();

    if (data.error) {
      return NextResponse.json(
        { error: "Article not found", notFound: true },
        { status: 404 }
      );
    }

    const rawHtml = data.parse?.text?.["*"] ?? "";
    const pageTitle = data.parse?.title ?? sanitizedTitle;

    const cleanHtml = DOMPurify.sanitize(rawHtml, {
      ADD_TAGS: ["figure", "figcaption", "summary", "details"],
      ADD_ATTR: ["target", "rel"],
      FORBID_TAGS: ["style", "script", "iframe", "form", "input", "button", "img"],
      FORBID_ATTR: ["onerror", "onclick", "onload", "onmouseover"],
    });

    // Remove all image-related containers (figure, thumb, image wrappers)
    let processedHtml = cleanHtml
      .replace(/<figure[^>]*>[\s\S]*?<\/figure>/gi, "")
      .replace(/<div[^>]*class="[^"]*thumb[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, "")
      .replace(/<div[^>]*class="[^"]*tmulti[^"]*"[^>]*>[\s\S]*?<\/div>\s*<\/div>/gi, "")
      .replace(/<a[^>]*class="[^"]*image[^"]*"[^>]*>[\s\S]*?<\/a>/gi, "");

    // Remove unwanted sections by splitting HTML on <h2 boundaries
    const unwantedSections = [
      "see also", "references", "external links", "personal life",
      "list of pioneers in computer science"
    ];

    // Split on <h2 tags while preserving the delimiter
    const parts = processedHtml.split(/(?=<h2[\s>])/i);
    const filteredParts = parts.filter((part) => {
      // Extract text content from the h2 heading (first line)
      const h2Match = part.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
      if (!h2Match) return true; // Keep parts without h2 (intro content)
      // Strip HTML tags to get plain text of heading
      const headingText = h2Match[1].replace(/<[^>]*>/g, "").trim().toLowerCase();
      return !unwantedSections.some((s) => headingText.includes(s));
    });
    processedHtml = filteredParts.join("");

    const articleUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(pageTitle.replace(/ /g, "_"))}`;

    return NextResponse.json(
      { title: pageTitle, html: processedHtml, url: articleUrl },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch Wikipedia article" },
      { status: 500 }
    );
  }
}
