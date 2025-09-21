import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Comment from "@/models/Comment";
import Movie from "@/models/Movie";

// GET ALL COMMENTS OF A MOVIE
export async function GET(req: NextRequest) {
  await connectDB();
  try {
    // 1️⃣ Find all comments for this movie, sorted by newest first
    const movie_id = req.nextUrl.searchParams.get("movie_id");
    if (!movie_id) {
      return NextResponse.json({ error: "provide movie id" }, { status: 400 });
    }

    const comments = await Comment.find({ movie_id })
      .sort({ created_at: -1 }) // newest first

      console.log(comments)
    return NextResponse.json({ comments });
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
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const userId = req.headers.get("x-user-id");

    const body = await req.json();
    const { movie_id, comment } = body;

    if (!movie_id || !comment) {
      return NextResponse.json(
        { error: "user_id, movie_id and comment are required" },
        { status: 400 }
      );
    }

    const movie = await Movie.findById(movie_id);
    if (!movie)
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });

    // Find if comment already exists for this user on this movie
    const existingComment = await Comment.findOne({
      user_id: userId,
      movie_id,
    });

    if (existingComment) {
      // Update existing comment
      existingComment.body = comment;
      existingComment.created_at = new Date(); // update timestamp
      await existingComment.save();

      return NextResponse.json({
        message: "Comment updated",
        comment: existingComment,
      });
    } else {
      // Create new comment
      const newComment = await Comment.create({
        user_id: userId,
        movie_id,
        body: comment,
      });

      return NextResponse.json({
        message: "Comment created",
        comment: newComment,
      });
    }
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
