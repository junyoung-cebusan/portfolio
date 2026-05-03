import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { getData as getPdfWorkerData } from "pdf-parse/worker";

const PDF_MIME_TYPES = new Set(["application/pdf"]);
const DOCX_MIME_TYPES = new Set([
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024;

let isPdfWorkerConfigured = false;

const MIN_REPEAT_COUNT = 2;
const PAGE_MARKER_PATTERN = /^--\s*\d+\s+of\s+\d+\s*--$/;

function configurePdfWorker() {
  if (isPdfWorkerConfigured) return;

  PDFParse.setWorker(getPdfWorkerData());
  isPdfWorkerConfigured = true;
}

function getNormalizedLineKey(line: string) {
  return line.replace(/\s+/g, " ").trim().toLowerCase();
}

function getRepeatedLineKeys(lines: string[]) {
  const counts = new Map<string, number>();

  for (const line of lines) {
    const key = getNormalizedLineKey(line);
    if (!key || PAGE_MARKER_PATTERN.test(key)) continue;

    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return new Set(
    [...counts.entries()]
      .filter(([, count]) => count > MIN_REPEAT_COUNT)
      .map(([key]) => key),
  );
}

function removeRepeatedLines(text: string) {
  const lines = text.split("\n");
  const repeatedLineKeys = getRepeatedLineKeys(lines);
  const seenLineKeys = new Set<string>();

  return lines
    .filter((line) => {
      const key = getNormalizedLineKey(line);
      if (!key || PAGE_MARKER_PATTERN.test(key)) return true;

      if (repeatedLineKeys.has(key)) {
        return false;
      }

      if (seenLineKeys.has(key)) {
        return false;
      }

      seenLineKeys.add(key);
      return true;
    })
    .join("\n");
}

function normalizeExtractedText(text: string) {
  const normalized = text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return removeRepeatedLines(normalized)
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function isPdfDocument(file: File) {
  return (
    PDF_MIME_TYPES.has(file.type) || file.name.toLowerCase().endsWith(".pdf")
  );
}

export function isDocxDocument(file: File) {
  return (
    DOCX_MIME_TYPES.has(file.type) ||
    file.name.toLowerCase().endsWith(".docx")
  );
}

export function getReadableDocumentTitle(file: File) {
  return file.name.replace(/\.[^/.]+$/, "");
}

export function validateReadableDocument(file: File) {
  if (!isPdfDocument(file) && !isDocxDocument(file)) {
    throw new Error("Unsupported file type. Please upload a PDF or .docx file.");
  }

  if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
    throw new Error("File is too large. Please upload a document under 10 MB.");
  }
}

async function extractPdfText(fileBuffer: Buffer) {
  configurePdfWorker();

  const parser = new PDFParse({ data: fileBuffer });

  try {
    const result = await parser.getText();
    return normalizeExtractedText(result.text);
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(fileBuffer: Buffer) {
  const result = await mammoth.extractRawText({ buffer: fileBuffer });
  return normalizeExtractedText(result.value);
}

export async function extractReadableDocumentText(file: File) {
  validateReadableDocument(file);

  const fileBuffer = Buffer.from(await file.arrayBuffer());

  if (isPdfDocument(file)) {
    return extractPdfText(fileBuffer);
  }

  if (isDocxDocument(file)) {
    return extractDocxText(fileBuffer);
  }

  throw new Error("Unsupported file type. Please upload a PDF or .docx file.");
}
