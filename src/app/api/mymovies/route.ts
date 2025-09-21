import { NextRequest, NextResponse } from "next/server";
import Movie from "@/models/Movie";
import { connectDB } from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    await connectDB();
    const movies = await Movie.find({added_by:userId});
    return NextResponse.json({ movies }, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }
}