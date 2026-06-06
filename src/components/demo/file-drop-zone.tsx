"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

const ACCEPTED_EXTENSIONS = [
  ".txt",
  ".md",
  ".csv",
  ".json",
  ".ts",
  ".tsx",
  ".js",
  ".jsx",
  ".py",
  ".pdf",
];

export type UploadedFile = {
  name: string;
  text: string;
  status: "ready" | "error" | "loading";
  error?: string;
};

type FileDropZoneProps = {
  onContextChange: (combinedText: string) => void;
};

async function readTextFile(file: File): Promise<string> {
  return file.text();
}

async function readPdfFile(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/parse-pdf", { method: "POST", body: formData });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? "PDF parse failed");
  }
  const data = await res.json();
  return `[PDF: ${file.name}, ${data.pages} pages]\n${data.text}`;
}

function isAccepted(file: File): boolean {
  const ext = "." + file.name.split(".").pop()?.toLowerCase();
  return ACCEPTED_EXTENSIONS.includes(ext);
}

export function FileDropZone({ onContextChange }: FileDropZoneProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [dragging, setDragging] = useState(false);

  const updateCombined = useCallback(
    (nextFiles: UploadedFile[]) => {
      const combined = nextFiles
        .filter((f) => f.status === "ready")
        .map((f) => `\n--- ${f.name} ---\n${f.text}`)
        .join("\n\n");
      onContextChange(combined);
    },
    [onContextChange],
  );

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const incoming = Array.from(fileList).filter(isAccepted);
      if (incoming.length === 0) return;

      const placeholders: UploadedFile[] = incoming.map((f) => ({
        name: f.name,
        text: "",
        status: "loading",
      }));

      setFiles((prev) => {
        const next = [...prev, ...placeholders];
        return next;
      });

      for (let i = 0; i < incoming.length; i++) {
        const file = incoming[i];
        try {
          const isPdf = file.name.toLowerCase().endsWith(".pdf");
          const text = isPdf ? await readPdfFile(file) : await readTextFile(file);
          setFiles((prev) => {
            const idx = prev.findIndex(
              (f) => f.name === file.name && f.status === "loading",
            );
            if (idx === -1) return prev;
            const next = [...prev];
            next[idx] = { name: file.name, text, status: "ready" };
            updateCombined(next);
            return next;
          });
        } catch (err) {
          setFiles((prev) => {
            const idx = prev.findIndex(
              (f) => f.name === file.name && f.status === "loading",
            );
            if (idx === -1) return prev;
            const next = [...prev];
            next[idx] = {
              name: file.name,
              text: "",
              status: "error",
              error: err instanceof Error ? err.message : "Failed to read file",
            };
            return next;
          });
        }
      }
    },
    [updateCombined],
  );

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          void processFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          dragging
            ? "border-accent bg-accent/5"
            : "border-border bg-secondary/20",
        )}
      >
        <p className="text-sm font-medium text-foreground">
          Drop files here or choose files
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          .txt, .md, .json, .ts, .py, .pdf and more
        </p>
        <label className="mt-4 cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90">
          Choose files
          <input
            type="file"
            multiple
            className="hidden"
            accept={ACCEPTED_EXTENSIONS.join(",")}
            onChange={(e) => {
              if (e.target.files) void processFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </label>
      </div>

      {files.length > 0 && (
        <ul className="space-y-2">
          {files.map((file, i) => (
            <li
              key={`${file.name}-${i}`}
              className="flex items-center justify-between rounded-lg border border-border px-3 py-2 text-sm"
            >
              <span className="truncate text-foreground">{file.name}</span>
              <span
                className={cn(
                  "text-xs",
                  file.status === "ready" && "text-green-600",
                  file.status === "loading" && "text-muted-foreground",
                  file.status === "error" && "text-red-500",
                )}
              >
                {file.status === "ready" && `${file.text.length.toLocaleString()} chars`}
                {file.status === "loading" && "Processing…"}
                {file.status === "error" && (file.error ?? "Error")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
