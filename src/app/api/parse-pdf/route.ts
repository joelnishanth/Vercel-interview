import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      return NextResponse.json(
        { error: "Only PDF files are supported" },
        { status: 400 },
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "PDF must be under 10MB" },
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfParseModule = await import("pdf-parse");
    const pdfParse =
      "default" in pdfParseModule && pdfParseModule.default
        ? pdfParseModule.default
        : pdfParseModule;
    const data = await (pdfParse as (buf: Buffer) => Promise<{ text: string; numpages: number }>)(buffer);

    return NextResponse.json({
      text: data.text,
      pages: data.numpages,
      filename: file.name,
    });
  } catch (error) {
    console.error("[parse-pdf]", error);
    return NextResponse.json(
      { error: "Failed to parse PDF" },
      { status: 500 },
    );
  }
}
