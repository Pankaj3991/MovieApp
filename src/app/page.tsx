"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useRouter } from "next/navigation";

type Movie = {
  _id: string;
  title: string;
  description: string;
  upvotes?: number;
  downvotes?: number;
};

export default function MoviesList() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [load,setLoad] = useState(false);
  const router = useRouter();

  useEffect(() => {
    loadMovies();
  }, [page, load]);

  const loadMovies = async () => {
    setLoading(true);
    const res = await fetch(`/api/movies?page=${page}&limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      setMovies(data.movies);
      setTotalPages(data.total || 1);
    }
    setLoading(false);
  };

  const handleVote = async (movieId: string, voteType: "up" | "down") => {
    const res = await fetch(`/api/movies/${movieId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vote_type: voteType }),
    });

    if (!res.ok) return;
    setLoad(!load);
  };

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">All Movies</h1>

      <div className="flex justify-evenly flex-wrap">
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="relative bg-white rounded-xl border shadow p-4 flex flex-col w-full sm:w-1/2 md:w-1/4 m-2 cursor-pointer"
            onClick={() => router.push(`/movies/${movie._id}`)}
          >
            <div className="flex flex-col h-full">
              <h2 className="text-xl font-semibold mb-2">{movie.title}</h2>
              <p className="text-gray-600 flex-grow">{movie.description}</p>
            </div>

            <div className="flex justify-end items-center mt-3 space-x-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(movie._id, "up");
                }}
                className="flex items-center space-x-1 p-1 text-green-600 hover:bg-green-100 rounded"
              >
                <ThumbsUp size={18} />
                <span>{movie.upvotes || 0}</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleVote(movie._id, "down");
                }}
                className="flex items-center space-x-1 p-1 text-red-600 hover:bg-red-100 rounded"
              >
                <ThumbsDown size={18} />
                <span>{movie.downvotes || 0}</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex space-x-2 mt-4">
        <button
          disabled={page <= 1}
          onClick={() => setPage(page - 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="px-3 py-1">
          Page {page} of {totalPages}
        </span>
        <button
          disabled={page >= totalPages}
          onClick={() => setPage(page + 1)}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
