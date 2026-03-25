import { NextResponse } from "next/server";
import { getPublicPinned } from "@/lib/skill-service";

export async function GET() {
  try {
    const payload = await getPublicPinned();
    return NextResponse.json(payload);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
