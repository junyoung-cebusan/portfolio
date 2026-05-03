import {
  extractReadableDocumentText,
  getReadableDocumentTitle,
  validateReadableDocument,
} from "@/lib/llm/document-reader";
import type { ApiErrorResponse, ReadDocumentResponse } from "@/lib/api/contracts";

export const runtime = "nodejs";
export const maxDuration = 30;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to read document.";
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get("content-type") ?? "";

    if (!contentType.includes("multipart/form-data")) {
      return Response.json(
        {
          error: "Unsupported request type. Upload a document as form data.",
        } satisfies ApiErrorResponse,
        { status: 400 },
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");

    if (!(file instanceof File)) {
      return Response.json(
        {
          error: "Missing file. Upload a PDF or .docx file as 'file'.",
        } satisfies ApiErrorResponse,
        { status: 400 },
      );
    }

    validateReadableDocument(file);

    const text = await extractReadableDocumentText(file);

    if (!text) {
      return Response.json(
        {
          error: "Could not extract text from the uploaded document.",
        } satisfies ApiErrorResponse,
        { status: 400 },
      );
    }

    return Response.json({
      title: getReadableDocumentTitle(file),
      text,
    } satisfies ReadDocumentResponse);
  } catch (error) {
    console.error("[api/read-document] failed to read uploaded document", {
      error,
    });

    return Response.json(
      { error: getErrorMessage(error) } satisfies ApiErrorResponse,
      { status: 400 },
    );
  }
}
