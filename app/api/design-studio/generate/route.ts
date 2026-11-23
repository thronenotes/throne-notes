import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { prompt, format, images, currentDoc, refinement } = await req.json();
    if (!prompt && !refinement) {
      return NextResponse.json({ error: "Missing prompt" }, { status: 400 });
    }
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
    }

    const formatGuide: Record<string, string> = {
      proposal: "a business proposal with an executive summary, scope sections, a pricing/investment table, and a call to action",
      pitch: "a pitch deck outline — punchy sections that sell an idea, each section is one 'slide'",
      report: "a professional report or document with clear sections and bullet points",
      onepager: "a short, punchy one-page document",
    };

    const hasImages = Array.isArray(images) && images.length > 0;
    const isRefinement = currentDoc && refinement;

    const instruction = `You are a world-class document designer and copywriter.
${isRefinement
  ? `The user already has the document below and wants a revision applied to it.

CURRENT DOCUMENT (JSON):
${JSON.stringify(currentDoc)}

REQUESTED REVISION: "${refinement}"

Apply the revision and return the FULL updated document in the exact same JSON schema. Change only what the revision asks for — keep everything else intact.`
  : `Create ${formatGuide[format] || formatGuide.proposal}.`}

Return ONLY valid JSON matching this exact schema — no markdown, no code fences:
{
  "title": "string",
  "subtitle": "string",
  "executiveSummary": "string (2-3 sentences)",
  "sections": [
    { "heading": "string", "paragraphs": ["string"], "bullets": ["string"], "imageIndex": null }
  ],
  "pricing": [ { "item": "string", "amount": "string (number only, no symbols)" } ],
  "callToAction": "string"
}

Rules:
- 3 to 6 sections depending on the request.
- Only include "pricing" if the document involves selling services or products.
- Only include "bullets" arrays where bullet points make sense; otherwise use "paragraphs".
- Write in a confident, premium tone. No fluff.
- Currency amounts must be plain numbers.
${hasImages ? `- The user attached ${images.length} image(s) (indexed 0 to ${images.length - 1}). Look at them. If an image belongs in a section (e.g., a logo, product photo, inspiration), set that section's "imageIndex" to the image's index number. Otherwise leave it null. Reference what you see in the images where relevant.` : ""}
${!isRefinement ? `\nUSER REQUEST: ${prompt}` : ""}`;

    // Build parts: text + images
    const parts: any[] = [{ text: instruction }];
    if (hasImages) {
      for (const img of images) {
        const [header, data] = img.split(",");
        const mimeType = header?.match(/data:(.*?);/)?.[1] || "image/png";
        if (data) parts.push({ inlineData: { mimeType, data } });
      }
    }

    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
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

    const geminiData = await geminiRes.json();
    if (!geminiRes.ok) {
      console.error("Gemini error:", geminiData);
      return NextResponse.json({ error: geminiData?.error?.message || "AI generation failed" }, { status: 500 });
    }

    const rawText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    let doc;
    try {
      doc = JSON.parse(rawText);
    } catch {
      const cleaned = rawText.replace(/```json|```/g, "").trim();
      doc = JSON.parse(cleaned);
    }

    return NextResponse.json({ success: true, doc });
  } catch (error: any) {
    console.error("Design studio error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}