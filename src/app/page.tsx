"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [skpd, setSkpd] = useState<string>("");

  const role = session?.user?.role || "guest"; // "admin" | "user" | "guest"

  // Load data dari backend
  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/upload")
        .then((res) => res.json())
        .then((data) => setFiles(data));
    }
  }, [status]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !skpd) return;

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("skpd", skpd);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (data.success) {
      setFiles([data.file, ...files]);
      setSelectedFile(null);
      setSkpd("");
      alert("File berhasil diupload!");
    } else {
      alert("Upload gagal: " + data.error);
    }
  };

  const handleVerifikasi = async (id: number, status: string, catatan: string) => {
    const res = await fetch("/api/verifikasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status, catatan }),
    });

    const data = await res.json();
    if (data.success) {
      setFiles(files.map((f) => (f.id === id ? data.file : f)));
    }
  };

  const handleAddCommentLink = async (id: number) => {
    const url = prompt("Masukkan link komentar:");
    if (!url) return;

    const res = await fetch("/api/comment-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, url }),
    });

    const data = await res.json();
    if (data.success) {
      setFiles(files.map((f) => (f.id === id ? { ...f, commentLink: url } : f)));
    }
  };

  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Memuat...</p>
      </main>
    );
  }

  if (!session) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
        <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-lg max-w-md text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome</h1>
          <p className="text-gray-600 mb-6">
            Silakan login untuk mengakses aplikasi.
          </p>
          <a
            href="/login"
            className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition"
          >
            Login
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 py-10 px-4">
      <h1 className="text-4xl font-extrabold mb-10 text-center text-blue-800 drop-shadow-md">
        Daftar SKPD & Status Verifikasi
      </h1>

      {/* Upload Box */}
      {(role === "user" || role === "admin") && (
        <div className="max-w-lg mx-auto bg-white p-6 rounded-2xl shadow-lg mb-12">
          <form onSubmit={handleUpload} className="space-y-4">
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            <input
              type="text"
              value={skpd}
              onChange={(e) => setSkpd(e.target.value)}
              placeholder="Masukkan nama SKPD"
              className="block w-full text-sm text-gray-700 border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />

            {selectedFile && (
              <div className="bg-gray-50 p-3 rounded-lg border border-gray-200 text-sm text-gray-700">
                <p className="font-medium text-blue-700">{selectedFile.name}</p>
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Upload
            </button>
          </form>
        </div>
      )}

      {/* 📌 Tabel */}
      <div className="overflow-x-auto max-w-6xl mx-auto">
        <table className="w-full text-sm text-left text-gray-600 border border-gray-200 rounded-lg shadow-md overflow-hidden">
          <thead className="bg-gradient-to-r from-blue-600 to-blue-500 text-white uppercase text-xs">
            <tr className="divide-x divide-blue-400">
              <th className="px-6 py-3">Nama File</th>
              <th className="px-6 py-3">SKPD</th>
              <th className="px-6 py-3">Uploader</th>
              <th className="px-6 py-3">Status & Komentar</th>
              <th className="px-6 py-3 text-center">Download & Komentar</th>
              {role === "admin" && <th className="px-6 py-3 text-center">Aksi</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {files.map((file, idx) => (
              <tr
                key={file.id}
                className={`${
                  idx % 2 === 0 ? "bg-blue-50" : "bg-white"
                } hover:bg-blue-100 transition divide-x divide-gray-200`}
              >
                {/* Nama File */}
                <td className="px-6 py-3">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:underline max-w-xs truncate"
                    title={file.nama}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      className="w-5 h-5 text-red-600 flex-shrink-0"
                    >
                      <path d="M6 2a2 2 0 0 0-2 2v16a2 
                               2 0 0 0 2 2h12a2 2 0 0 0 
                               2-2V8l-6-6H6zm7 1.5L18.5 
                               9H13V3.5zM8 13h2a1 1 0 
                               1 1 0 2H9v2a1 1 0 1 1-2 
                               0v-3a1 1 0 0 1 1-1zm5-1a1 
                               1 0 0 1 1 1v1a1 1 0 1 1-2 
                               0v-1a1 1 0 0 1 1-1zm3 2h1a1 
                               1 0 0 1 0 2h-1v1a1 1 0 1 
                               1-2 0v-3a1 1 0 0 1 2 0v0z" />
                    </svg>
                    <span className="truncate">{file.nama}</span>
                  </a>
                </td>

                {/* SKPD */}
                <td className="px-6 py-3">{file.skpd || "Belum diisi"}</td>

                {/* Uploader */}
                <td className="px-6 py-3">{file.uploader}</td>

                {/* Status & Komentar */}
                <td className="px-6 py-3">
                  {file.status ? (
                    <div className="flex flex-col">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold w-fit ${
                          file.status === "Disetujui"
                            ? "bg-green-100 text-green-700"
                            : file.status === "Ditolak"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {file.status}
                      </span>
                      {file.catatan && (
                        <p className="text-xs text-gray-600 mt-1">
                          <span className="font-semibold">Komentar:</span>{" "}
                          {file.catatan}
                        </p>
                      )}
                    </div>
                  ) : (
                    <span className="text-gray-500 text-sm italic">
                      Belum diverifikasi
                    </span>
                  )}
                </td>

                {/* Download & Komentar */}
                <td className="px-6 py-3 text-center flex flex-col gap-2 items-center">
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg shadow hover:bg-blue-700 transition"
                  >
                    Lihat PDF
                  </a>
                  {file.commentLink ? (
                    <a
                      href={file.commentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Link Komentar
                    </a>
                  ) : role === "admin" ? (
                    <button
                      onClick={() => handleAddCommentLink(file.id)}
                      className="text-sm text-gray-500 italic hover:underline"
                    >
                      Tambahkan Link Komentar
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400 italic">
                      Belum ada link komentar
                    </span>
                  )}
                </td>

                {/* Aksi Admin */}
                {role === "admin" && (
                  <td className="px-6 py-3 text-center">
                    <div className="flex gap-2 justify-center">
                      <button
                        onClick={() =>
                          handleVerifikasi(file.id, "Disetujui", "Valid dan sesuai")
                        }
                        className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg shadow hover:bg-green-700 transition"
                      >
                        Setujui
                      </button>
                      <button
                        onClick={() =>
                          handleVerifikasi(file.id, "Ditolak", "Data tidak lengkap")
                        }
                        className="px-3 py-1 bg-red-600 text-white text-sm rounded-lg shadow hover:bg-red-700 transition"
                      >
                        Tolak
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
