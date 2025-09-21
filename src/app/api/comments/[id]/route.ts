import { NextRequest, NextResponse } from "next/server";
import Comment from "@/models/Comment";
import { connectDB } from "@/lib/mongodb";

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

    // 1️⃣ Find the comment
    const comment = await Comment.findById(id);
    if (!comment) {
      return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
    }

    // 2️⃣ Authorize: only comment creator or admin can delete
    if (comment.user_id.toString() !== userId && role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 3️⃣ Delete comment
    await Comment.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Comment deleted successfully' });
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