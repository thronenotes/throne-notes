import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    if (!audioFile) return NextResponse.json({ error: "No audio" }, { status: 400 });

    // TODO: Add OpenAI Whisper when API key is configured
    return NextResponse.json({
      text: "[Transcription ready — configure OPENAI_API_KEY in .env.local]",
      tags: ["#dream", "#prophecy"],
      confidence: 0.95,
    });
  } catch {
    return NextResponse.json({ error: "Transcription failed" }, { status: 500 });
  }
}
