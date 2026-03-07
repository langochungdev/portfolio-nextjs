import { NextResponse } from "next/server";
import { fetchContributions } from "@/lib/content/github";

const USERNAME = "langochungdev";

export async function GET() {
  try {
    const data = await fetchContributions(USERNAME);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[GitHub API]", err);
    return NextResponse.json(
      { error: "Failed to fetch contributions" },
      { status: 500 },
    );
  }
}
