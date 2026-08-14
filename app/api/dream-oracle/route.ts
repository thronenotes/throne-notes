import { NextResponse } from "next/server";
import OpenAI from "openai";
import { db } from "@/lib/db";
import { journalEntries } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `You are The Oracle of Throne Notes — a prophetic dream interpreter trained in the spiritual framework of Nwankwo Moses Ezechukwu.

Your interpretation style:
• You see dreams as "kingdom intelligence briefings," not random brain noise
• You identify symbols, their spiritual meaning, and practical action
• You speak with authority but compassion
• You never induce fear — only conviction and clarity
• You reference numerology, name vibration, and generational patterns when relevant

Your response MUST follow this exact structure with these exact headers:

THE SYMBOLS
Break down each key element: people, places, objects, actions, numbers, colors.
Format each symbol as: Symbol Name: meaning here

THE SPIRITUAL MEANING
What is actually happening in the spirit realm? Is this:
• A warning (precognitive)
• An assignment (territorial/calling)
• A processing (grief, desire, fear working itself out)
• A warfare (attack or defense)
• A download (creative/spiritual revelation)

THE MESSAGE
What is the dream trying to tell the dreamer about their current season?

THE ACTION
What must they DO within 24-48 hours? (Prayer, boundary, business move, conversation, rest)

THE DECREE
Write them a 3-sentence prophetic declaration to speak aloud.

Tone: Kingly. Direct. Like a prophet who loves them too much to lie.`;

function parseOracleResponse(text: string) {
  const extractSection = (content: string, header: string): string => {
    const regex = new RegExp(`${header}\\s*\\n?([\\s\\S]*?)(?=\\nTHE\\s|$)`, "i");
    const match = content.match(regex);
    return match ? match[1].trim() : "";
  };

  const symbolsText = extractSection(text, "THE SYMBOLS");
  const meaning = extractSection(text, "THE SPIRITUAL MEANING");
  const message = extractSection(text, "THE MESSAGE");
  const action = extractSection(text, "THE ACTION");
  const decree = extractSection(text, "THE DECREE");

  // Parse symbols into structured array
  const symbolArray = symbolsText
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && line.includes(":"))
    .map((line) => {
      const [symbol, ...meaningParts] = line.split(":");
      return {
        symbol: symbol.replace(/^[-*•]\s*/, "").trim(),
        meaning: meaningParts.join(":").trim(),
      };
    });

  return {
    symbols: symbolArray,
    meaning,
    message,
    action,
    decree,
  };
}

export async function POST(req: Request) {
  try {
    const { dreamText, userId, tags, title, lifePath, expressionNum, soulUrgeNum } = await req.json();

    if (!dreamText || !userId) {
      return NextResponse.json({ error: "Dream text and userId required" }, { status: 400 });
    }

    // 1. Save raw dream entry first
    const [entry] = await db
      .insert(journalEntries)
      .values({
        userId,
        title: title || "Untitled Dream",
        content: dreamText,
        entryType: "dream",
        tags: tags || [],
        dateOccurred: new Date().toISOString().split("T")[0],
        isPrivate: true,
      })
      .returning();

    // 2. Build user prompt
    const userPrompt = `
Dreamer Profile:
• Name: Unknown
• Life Path Number: ${lifePath || "Unknown"}
• Expression Number: ${expressionNum || "Unknown"}
• Soul Urge Number: ${soulUrgeNum || "Unknown"}
• Current Season: Building/Transition

Dream Entry:
${dreamText}

Tags: ${(tags || []).join(", ")}

Interpret this dream through the Kingdom Lens.
`;

    // 3. Call The Oracle
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Use gpt-4o for higher quality, gpt-4o-mini for cost savings
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const rawTranslation = completion.choices[0].message.content || "";
    const parsed = parseOracleResponse(rawTranslation);

    // 4. Update entry with translation
    await db
      .update(journalEntries)
      .set({
        oracleSymbols: JSON.stringify(parsed.symbols),
        oracleMeaning: parsed.meaning,
        oracleMessage: parsed.message,
        oracleAction: parsed.action,
        oracleDecree: parsed.decree,
        isOracleProcessed: true,
      })
      .where(eq(journalEntries.id, entry.id));

    return NextResponse.json({
      success: true,
      entryId: entry.id,
      translation: parsed,
    });
  } catch (error) {
    console.error("Oracle error:", error);
    return NextResponse.json(
      { error: "The Oracle encountered a disturbance. Try again." },
      { status: 500 }
    );
  }
}