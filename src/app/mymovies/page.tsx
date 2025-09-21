"use client";

import { useState, useEffect, useRef } from "react";
import { Pencil, Trash } from "lucide-react";

type Movie = {
  _id: string;
  title: string;
  description: string;
  added_by: string;
  created_at: string;
};

export default function MyMovies() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  // form state
  const [formData, setFormData] = useState({ title: "", description: "" });
  const [editMovieId, setEditMovieId] = useState<string | null>(null);
  const [load, setLoad] = useState(false);

  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadRole();
    console.log(role);
    if (role === "admin") {
      loadAdminMovies();
    } else if (role) {
      loadUserMovies();
    }
  }, [role, page,load]);

  const loadUserMovies = async () => {
    const res = await fetch("/api/mymovies");
    if (res.ok) {
      const data = await res.json();
      setMovies(data.movies);
      setTotalPages(data.total || 1);
    } else {
      console.log(res.statusText);
    }
  };

  const loadAdminMovies = async () => {
    const res = await fetch(`/api/movies?page=${page}&limit=${limit}`);
    if (res.ok) {
      const data = await res.json();
      setMovies(data.movies);
      setTotalPages(data.total || 1);
    } else {
      console.log(res.statusText);
    }
  };

  const loadRole = async () => {
    const res = await fetch("/api/auth/check");
    if (res.ok) {
      const data = await res.json();
      setRole(data.user?.role || null);
    } else {
      console.log(res.statusText);
    }
    setLoading(false);
  };

  const deleteMovie = async (id: string) => {
    const res = await fetch(`/api/movies/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Failed to delete movie");
      return;
    }
    setLoad(!load);
    setMovies((prev) => prev.filter((m) => m._id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert("Title is required");
      return;
    }

    if (editMovieId) {
      // update existing
      const res = await fetch(`/api/movies/${editMovieId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        alert("Failed to update movie");
        return;
      }
      setLoad(!load);
      setEditMovieId(null);
    } else {
      // add new
      const res = await fetch("/api/movies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        alert("Failed to add movie");
        return;
      }
      setLoad(!load);
    }

    setFormData({ title: "", description: "" });
  };

  const handleEdit = (movie: Movie) => {
    setEditMovieId(movie._id);
    setFormData({ title: movie.title, description: movie.description });

    // scroll to the form
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="p-4">
      {/* Add/Update movie form */}
      <div ref={formRef} className="mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {editMovieId ? "Update Movie" : "Add Movie"}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-wrap gap-2">
          <input
            type="text"
            placeholder="Title"
            className="border p-2 rounded flex-1 min-w-[200px]"
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Description"
            className="border p-2 rounded flex-1 min-w-[200px]"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-500 text-white rounded"
          >
            {editMovieId ? "Update" : "Add"}
          </button>
          {editMovieId && (
            <button
              type="button"
              onClick={() => {
                setEditMovieId(null);
                setFormData({ title: "", description: "" });
              }}
              className="px-4 py-2 bg-gray-400 text-white rounded"
            >
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Movies list */}
      <div className="flex flex-wrap gap-5">
        {movies.map((movie,index) => (
          <div
            key={index}
            className="relative bg-white rounded-xl border shadow p-4 flex flex-col w-full sm:w-1/2 md:w-1/4"
          >
            {/* Top-right icons */}
            <div className="absolute top-3 right-3 flex space-x-2">
              <button
                onClick={() => handleEdit(movie)}
                className="p-1 text-blue-500 hover:bg-blue-100 rounded"
              >
                <Pencil size={18} />
              </button>
              <button
                onClick={() => deleteMovie(movie._id)}
                className="p-1 text-red-500 hover:bg-red-100 rounded"
              >
                <Trash size={18} />
              </button>
            </div>

            {/* Card content */}
            <div className="flex flex-col h-full">
              <h2 className="text-xl font-semibold mb-2">{movie.title}</h2>
              <p className="text-gray-600 flex-grow">{movie.description}</p>
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
