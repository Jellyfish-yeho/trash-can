import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
    const { text } = await request.json() as { text: string };

    if (!text?.trim()) {
        return NextResponse.json({ error: "텍스트가 없습니다." }, { status: 400 });
    }

    const params = new URLSearchParams({
        q: text,
        langpair: "en|ko",
    });

    const res = await fetch(`https://api.mymemory.translated.net/get?${params}`);

    if (!res.ok) {
        return NextResponse.json({ error: "번역 실패" }, { status: 500 });
    }

    const data = await res.json();

    if (data.responseStatus !== 200) {
        return NextResponse.json({ error: "번역 실패" }, { status: 500 });
    }

    return NextResponse.json({ translated: data.responseData.translatedText });
}