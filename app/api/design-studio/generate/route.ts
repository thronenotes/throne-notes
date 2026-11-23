import { NextResponse } from "next/server";

const GEMINI_MODEL = "gemini-3.8-flash";

const FORMAT_INSTRUCTIONS: Record<string, string> = {
  proposal:
    "Create a professional business proposal. Include an executive summary, a clear scope of work broken into sections, deliverables, and a pricing table with itemized amounts.",
  pitch:
    "Create a persuasive pitch deck document. Focus on the problem, the solution, the unique value, market opportunity, and a strong closing call to action.",
  report:
    "Create a structured report. Include an introduction, findings organized into logical sections, analysis, and a conclusion with recommendations.",
  onepager:
    "Create a concise one-page document. Keep it tight: a strong headline, a short summary, 3-5 key sections with brief content, and one clear call to action.",
};

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "GEMINI_API_KEY not configured" },
        { status: 500 }
      );
    }

    const body = await req.json();
    const { prompt, format, images, currentDoc, refinement } = body as {
      prompt?: string;
      format?: string;
      images?: { mimeType: string; data: string }[];
      currentDoc?: unknown;
      refinement?: string;
    };

    const formatKey = format && FORMAT_INSTRUCTIONS[format] ? format : "proposal";

    let textInstruction: string;

    if (currentDoc && refinement) {
      // AI refinement mode: revise the existing document
      textInstruction = `You are an elite designer and copywriter. The user has an existing document (JSON below) and wants you to revise it.

EXISTING DOCUMENT:
${JSON.stringify(currentDoc)}

REVISION REQUEST:
${refinement}

Apply the requested changes precisely. Keep everything else intact unless the revision implies changing it. Improve wording quality where touched. Return the FULL revised document in the exact same JSON structure.

Return ONLY valid JSON matching this exact structure (no markdown fences, no commentary):
{
  "title": "string",
  "subtitle": "string",
  "executiveSummary": "string",
  "sections": [
    { "heading": "string", "paragraphs": ["string"], "bullets": ["string"], "imageIndex": 0 }
  ],
  "pricing": [{ "item": "string", "amount": "string" }],
  "callToAction": "string"
}

Rules: sections must have 3-6 entries; paragraphs and bullets arrays may be empty but must exist; imageIndex is optional (index into attached images); pricing amounts as strings like "$1,500".`;
    } else {
      // Fresh generation mode
      if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
        return NextResponse.json(
          { error: "Prompt is required" },
          { status: 400 }
        );
      }

      const imageNote =
        images && images.length > 0
          ? `\n\nThe user attached ${images.length} image(s). They are included with this request — look at them and weave them into the design. For any section where an attached image belongs visually, set that section's "imageIndex" to the 0-based index of the image.`
          : "";

      textInstruction = `You are an elite designer and copywriter, like Gamma.app. The user will describe what they want, and you generate a complete, polished, beautifully-written document.

FORMAT: ${formatKey.toUpperCase()}
${FORMAT_INSTRUCTIONS[formatKey]}

USER REQUEST:
${prompt}
${imageNote}

Write with confidence and specificity — no lorem ipsum, no placeholders like [Client Name]; invent realistic, concrete details that fit the request. Make it feel premium.

Return ONLY valid JSON matching this exact structure (no markdown fences, no commentary):
{
  "title": "string",
  "subtitle": "string",
  "executiveSummary": "string",
  "sections": [
    { "heading": "string", "paragraphs": ["string"], "bullets": ["string"], "imageIndex": 0 }
  ],
  "pricing": [{ "item": "string", "amount": "string" }],
  "callToAction": "string"
}

Rules: sections must have 3-6 entries; each section should have 1-2 paragraphs and/or 3-5 bullets; paragraphs and bullets arrays may be empty but must exist; imageIndex is optional (index into attached images); pricing amounts as strings like "$1,500"; include pricing only if it fits the request (otherwise an empty array).`;
    }

    // Build multimodal parts: text first, then any attached images
    const parts: unknown[] = [{ text: textInstruction }];
    if (images && Array.isArray(images)) {
      for (const img of images.slice(0, 4)) {
        if (img?.data && img?.mimeType) {
          parts.push({
            inlineData: {
              mimeType: img.mimeType,
              data: img.data,
            },
          });
        }
      }
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.8,
          },
        }),
      }
    );

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", geminiRes.status, errText);
      let message = `Gemini API error (${geminiRes.status})`;
      try {
        const errJson = JSON.parse(errText);
        if (errJson?.error?.message) message = errJson.error.message;
      } catch {
        // keep generic message
      }
      return NextResponse.json({ error: message }, { status: 502 });
    }

    const geminiData = await geminiRes.json();
    const rawText =
      geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    let doc;
    try {
      doc = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      try {
        doc = JSON.parse(cleaned);
      } catch {
        console.error("Failed to parse Gemini output:", rawText.slice(0, 500));
        return NextResponse.json(
          { error: "AI returned an unreadable response — please try again" },
          { status: 502 }
        );
      }
    }

    // Normalize shape so the frontend never breaks
    const normalized = {
      title: typeof doc.title === "string" ? doc.title : "Untitled Document",
      subtitle: typeof doc.subtitle === "string" ? doc.subtitle : "",
      executiveSummary:
        typeof doc.executiveSummary === "string" ? doc.executiveSummary : "",
      sections: Array.isArray(doc.sections)
        ? doc.sections.map((s: Record<string, unknown>) => ({
            heading: typeof s.heading === "string" ? s.heading : "Section",
            paragraphs: Array.isArray(s.paragraphs)
              ? s.paragraphs.filter((p: unknown) => typeof p === "string")
              : [],
            bullets: Array.isArray(s.bullets)
              ? s.bullets.filter((b: unknown) => typeof b === "string")
              : [],
            imageIndex:
              typeof s.imageIndex === "number" ? s.imageIndex : undefined,
          }))
        : [],
      pricing: Array.isArray(doc.pricing)
        ? doc.pricing.map((p: Record<string, unknown>) => ({
            item: typeof p.item === "string" ? p.item : "Item",
            amount: typeof p.amount === "string" ? p.amount : "$0",
          }))
        : [],
      callToAction:
        typeof doc.callToAction === "string" ? doc.callToAction : "",
    };

    return NextResponse.json({ doc: normalized });
  } catch (err) {
    console.error("Design studio generate error:", err);
    return NextResponse.json(
      { error: "Something went wrong generating the design" },
      { status: 500 }
    );
  }
}