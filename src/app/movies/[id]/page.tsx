"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type Movie = {
  _id: string;
  title: string;
  description: string;
  upvotes?: number;
  downvotes?: number;
};

type Comment = {
  _id: string;
  body: string;
};

export default function MoviePage() {
  const { id } = useParams();
  const [load,setLoad] = useState(false);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentInput, setCommentInput] = useState("");

  useEffect(() => {
    loadMovie();
    loadComments();
  }, [id,load]);

  const loadMovie = async () => {
    const res = await fetch(`/api/movies/${id}`);
    if (res.ok) {
      const data = await res.json();
      setMovie(data.movie[0]);
    }else{
        console.log(res.statusText);
    }
  };

  const loadComments = async () => {
    console.log(id);
const res = await fetch(`/api/comments?movie_id=${id}`);
    if (res.ok) {
      const data = await res.json();
      console.log(data);
      setComments(data.comments);
    }else{
        console.log(res.statusText);
    }
  };

  const handleAddComment = async () => {
    if (!commentInput.trim()) return;

    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ movie_id: id, comment: commentInput }),
    });

    if (!res.ok){console.log(res.statusText); return;}
    setLoad(!load);
    setCommentInput("");
  };

  const handleDeleteComment = async (commentId: string) => {
    const res = await fetch(`/api/comments/${commentId}`, { method: "DELETE" });
    if (!res.ok){console.log(res.statusText); return;}
    setLoad(!load);
  };

  if (!movie) return <p>Loading...</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{movie.title}</h1>
      <p className="text-gray-700 mb-4">{movie.description}</p>

      {/* Comments section */}
      <div className="mt-6">
        <h2 className="text-2xl font-semibold mb-2">Comments</h2>
        <div className="flex mb-4 space-x-2">
          <input
            type="text"
            value={commentInput}
            onChange={(e) => setCommentInput(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 border p-2 rounded"
          />
          <button
            onClick={handleAddComment}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            Add
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {comments.map((c) => (
            <div key={c._id} className="flex justify-between items-center border p-2 rounded">
              <p>{c.body}</p>
              <button
                onClick={() => handleDeleteComment(c._id)}
                className="text-red-500 hover:bg-red-100 p-1 rounded"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
