import { NextRequest, NextResponse } from "next/server";
import { queryBackendAssistant } from "@/lib/backend-client";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, tab, ui_context } = body;

    if (!question) {
      return NextResponse.json(
        { error: "Question is required" },
        { status: 400 }
      );
    }

    const response = await queryBackendAssistant({
      question,
      tab,
      ui_context,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error in backend-assistant route:", error);
    return NextResponse.json(
      {
        answer: "Assistant error",
        plan: {},
        count: 0,
        preview: [],
        found: false,
        status: "error",
      },
      { status: 500 }
    );
  }
}
