import { NextRequest, NextResponse } from "next/server";
import Movie from "@/models/Movie";
import Vote from "@/models/Vote";
import Comment from "@/models/Comment";
import { connectDB } from "@/lib/mongodb";

// GET PARTICULAR MOVIE DETAILS
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;

  try {
    // 1️⃣ Find all comments for this movie, sorted by newest first
    const movie = await Movie.find({ _id: id })
    if(!movie){
      return NextResponse.json({error:"No movie found"},{status:400});
    }

    return NextResponse.json({ movie });
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

// vote a movie(upvote/downvote)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params;
  const userId = req.headers.get("x-user-id");
  try {
    const body = await req.json();
    const { vote_type } = body;

    const movie = await Movie.findById(id);
    if (!movie)
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });

    if (!vote_type) {
      return NextResponse.json(
        { error: "movie_id and vote_type are required" },
        { status: 400 }
      );
    }

    if (!["up", "down"].includes(vote_type)) {
      return NextResponse.json(
        { error: 'vote_type must be "up" or "down"' },
        { status: 400 }
      );
    }

    // Check if user already voted on this movie
    const existingVote = await Vote.findOne({ user_id: userId, movie_id: id });

    if (existingVote) {
      // Update existing vote
      existingVote.vote_type = vote_type as "up" | "down";
      existingVote.created_at = new Date();
      await existingVote.save();
      return NextResponse.json({ message: "Vote updated", vote: existingVote });
    } else {
      // Create new vote
      const newVote = await Vote.create({
        user_id: userId,
        movie_id: id,
        vote_type,
      });
      return NextResponse.json({ message: "Vote created", vote: newVote });
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

// ✅ UPDATE MOVIE (PUT)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params; // must await
  const userId = req.headers.get("x-user-id");
  const role = req.headers.get("x-user-role");

  try {
    const body = await req.json();
    const { title, description } = body;
    if (!title || !description) {
      return NextResponse.json(
        { error: "title, description are required" },
        { status: 400 }
      );
    }

    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 2️⃣ Find the movie
    const movie = await Movie.findById(id);
    if (!movie)
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });

    // 3️⃣ Check ownership
    if (movie.added_by.toString() !== userId && role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: You cannot edit this movie" },
        { status: 403 }
      );
    }

    // 4️⃣ Update allowed fields
    const updatedMovie = await Movie.findByIdAndUpdate(
      id,
      body, // only fields provided in body will be updated
      { new: true, runValidators: true }
    );

    return NextResponse.json({ message: "Movie updated", movie: updatedMovie });
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

// ✅ DELETE MOVIE (DELETE)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await connectDB();
  const { id } = await params; // must await
  const userId = req.headers.get("x-user-id");
  const role = req.headers.get("x-user-role");

  try {
    if (!userId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1️⃣ Find the movie
    const movie = await Movie.findById(id);
    if (!movie)
      return NextResponse.json({ error: "Movie not found" }, { status: 404 });

    // 2️⃣ Check ownership or admin role
    if (movie.added_by.toString() !== userId && role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden: You cannot delete this movie" },
        { status: 403 }
      );
    }

    // 3️⃣ Delete related votes
    await Vote.deleteMany({ movie_id: movie._id });

    // 4️⃣ Delete related comments
    await Comment.deleteMany({ movie_id: movie._id });

    // 5️⃣ Delete the movie itself
    const deletedMovie = await Movie.findByIdAndDelete(id);
    if (!deletedMovie) {
      return NextResponse.json({ message: "Movie not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Movie and related data deleted successfully",
    });
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
