import { NextRequest, NextResponse } from "next/server";
import Movie from "@/models/Movie";
import { connectDB } from "@/lib/mongodb";
import { PipelineStage } from "mongoose";

export async function POST(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    // 1️⃣ Connect to DB
    await connectDB();

    // 2️⃣ Parse JSON body
    const body = await req.json();
    const { title, description } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "title, description are required" },
        { status: 400 }
      );
    }

    // 3️⃣ Create new movie
    const movie = await Movie.create({
      title,
      description,
      added_by: userId,
    });

    // 4️⃣ Respond with created movie
    return NextResponse.json({ movie }, { status: 201 });
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

export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const search = req.nextUrl.searchParams.get("search") || "";
    const page = parseInt(req.nextUrl.searchParams.get("page") || "1", 10);
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10", 10);
    const skip = (page - 1) * limit;

    const pipeline: PipelineStage[] = [
      {
        $match: search ? { title: { $regex: search, $options: "i" } } : {},
      },
      {
        $lookup: {
          from: "votes",
          localField: "_id",
          foreignField: "movie_id",
          as: "votes",
        },
      },
      {
        $addFields: {
          upvotes: {
            $size: {
              $filter: {
                input: "$votes",
                as: "v",
                cond: { $eq: ["$$v.vote_type", "up"] },
              },
            },
          },
          downvotes: {
            $size: {
              $filter: {
                input: "$votes",
                as: "v",
                cond: { $eq: ["$$v.vote_type", "down"] },
              },
            },
          },
        },
      },
      {
        $addFields: {
          netVotes: { $subtract: ["$upvotes", "$downvotes"] },
        },
      },
      { $sort: { netVotes: -1, created_at: -1 } },
      { $skip: skip },
      { $limit: limit },
      {
        $project: {
          title: 1,
          description: 1,
          added_by: 1,
          created_at: 1,
          upvotes: 1,
          downvotes: 1,
          netVotes: 1,
        },
      },
    ];

    const movies = await Movie.aggregate(pipeline);

    const totalCountPipeline: PipelineStage[] = [
      {
        $match: search ? { title: { $regex: search, $options: "i" } } : {},
      },
      { $count: "count" },
    ];

    const totalCountResult = await Movie.aggregate(totalCountPipeline);
    const totalCount = totalCountResult[0]?.count || 0;

    return NextResponse.json({
      page,
      limit,
      total: totalCount,
      movies,
    });
  } catch (err: unknown) {
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  }
}

