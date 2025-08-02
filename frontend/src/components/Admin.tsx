import { useEffect, useState, type JSX } from "react";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import { exportToExcel } from "./exportToExcel";
import JSZip from "jszip";
import { saveAs } from "file-saver";

type StatusType = "done" | "in_progress" | "perbaikan" | "ditolak";

type Member = {
  id: string;
  title: string;
  sektor: string;
  subsektor: string;
  totalKerusakanDanKerugian: number;
  createdAt: string;
  userId: {
    _id: string;
    username: string;
  };
  status: StatusType;
};

function StatusBadge({ status }: { status: StatusType }) {
  const badgeMap: Record<
    StatusType,
    { text: string; bg: string; color: string; icon: JSX.Element }
  > = {
    done: {
      text: "Selesai",
      bg: "bg-green-50",
      color: "text-green-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      ),
    },
    in_progress: {
      text: "Sedang Diproses",
      bg: "bg-yellow-50",
      color: "text-yellow-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
    perbaikan: {
      text: "Butuh Revisi",
      bg: "bg-blue-50",
      color: "text-blue-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
    },
    ditolak: {
      text: "Ditolak",
      bg: "bg-red-50",
      color: "text-red-700",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 mr-1"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      ),
    },
  };

  const badge = badgeMap[status];

  return (
    <div
      className={`${badge.bg} ${badge.color} px-3 py-1 rounded-full text-xs font-medium inline-flex items-center`}
    >
      {badge.icon}
      {badge.text}
    </div>
  );
}

export default function Admin() {
  const [members, setMembers] = useState<Member[]>([]);
  const [dropdownIdx, setDropdownIdx] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error(
            "Token tidak ditemukan. Silakan login terlebih dahulu."
          );
        }
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/report`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        const formatted = data.map((item: any) => ({
          id: item._id,
          title: item.title,
          sektor: item.sektor,
          subsektor: item.subsektor,
          createdAt: item.createdAt,
          totalKerusakanDanKerugian: item.totalKerusakanDanKerugian,
          userId: item.userId,
          status: item.status,
        }));

        setMembers(formatted);
      } catch (err) {
        console.error("Gagal mengambil data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredMembers = members.filter(
    (member) =>
      member.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.userId?.username
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      member.sektor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.subsektor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownloadImagesAsZip = async (id: string, title: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/report/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error("Gagal mengambil data laporan.");
      const detail = await res.json();

      const allImages: string[] =
        detail.prasaranaItems?.flatMap((item: any) => item.images || []) || [];

      if (allImages.length === 0) {
        Swal.fire(
          "Tidak Ada Gambar",
          "Laporan ini tidak memiliki gambar.",
          "info"
        );
        return;
      }

      const zip = new JSZip();
      const folder = zip.folder("gambar")!;

      for (const relativeUrl of allImages) {
        const fullUrl = `${import.meta.env.VITE_BACKEND_URL}/${relativeUrl}`;
        const filename = relativeUrl.split("/").pop() || "gambar.jpg";

        const imageRes = await fetch(fullUrl);
        const blob = await imageRes.blob();

        folder.file(filename, blob);
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      saveAs(zipBlob, `${title || "laporan"}_gambar.zip`);
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal", "Tidak dapat mengunduh gambar.", "error");
    }
  };

  const handleChangeProgress = async (idx: number, value: StatusType) => {
    const member = filteredMembers[idx];

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/report/${member.id}/verify`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: value }),
        }
      );

      if (!res.ok) throw new Error("Gagal memperbarui status");

      const updated = await res.json();

      setMembers((prev) =>
        prev.map((m) =>
          m.id === member.id ? { ...m, status: updated.status } : m
        )
      );
      setDropdownIdx(null);

      Swal.fire({
        icon: "success",
        title: "Status Berhasil Diperbarui",
        confirmButtonColor: "#F15A24",
      });
    } catch (error) {
      console.error(error);
      Swal.fire({
        icon: "error",
        title: "Gagal Memperbarui",
        text: "Status laporan gagal diperbarui.",
        confirmButtonColor: "#F15A24",
      });
    }
  };

  useEffect(() => {
    const close = () => setDropdownIdx(null);
    if (dropdownIdx !== null) {
      window.addEventListener("click", close);
      return () => window.removeEventListener("click", close);
    }
  }, [dropdownIdx]);

  const handleDelete = async (idx: number) => {
    const member = filteredMembers[idx];

    const result = await Swal.fire({
      title: "Hapus laporan ini?",
      text: "Tindakan ini tidak dapat dibatalkan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#F15A24",
      cancelButtonColor: "#6B7280",
      confirmButtonText: "Ya, hapus!",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/report/${member.id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          method: "DELETE",
        }
      );

      if (!res.ok) throw new Error("Gagal menghapus laporan");

      setMembers((prev) => prev.filter((m) => m.id !== member.id));

      Swal.fire("Berhasil!", "Laporan berhasil dihapus.", "success");
    } catch (error) {
      console.error(error);
      Swal.fire("Gagal!", "Terjadi kesalahan saat menghapus laporan.", "error");
    }
  };

  const handleViewClick = async (id: string) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/report/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const detail = await res.json();

      const title = detail?.title || "Laporan_Kerusakan";
      await exportToExcel([detail], title);
    } catch (err) {
      console.error("Gagal mengambil data:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengambil detail laporan.",
        confirmButtonColor: "#F15A24",
      });
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6 mt-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Manajemen Laporan
          </h1>
          <p className="text-gray-500">
            Kelola dan tinjau semua laporan yang telah dikirim
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Cari laporan..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Link
            to="/"
            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Beranda
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="flex flex-col items-center gap-4">
            <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#F15A24] border-r-transparent"></div>
            <span className="text-gray-500">Memuat laporan...</span>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {filteredMembers.length === 0 ? (
            <div className="p-8 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium text-gray-700">
                Tidak ada laporan ditemukan
              </h3>
              <p className="mt-1 text-gray-500">
                Coba ubah kata kunci pencarian atau filter
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Waktu Unggah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pengirim
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Judul
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sektor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sub Sektor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.map((m, idx) => (
                    <tr
                      key={m.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(m.createdAt).toLocaleString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {m.userId?.username || "-"}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 max-w-xs">
                        {m.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {m.sektor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {m.subsektor}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={m.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleViewClick(m.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-[#F15A24] hover:bg-orange-700 focus:outline-none"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          Lihat
                        </button>
                        <button
                          onClick={() =>
                            handleDownloadImagesAsZip(m.id, m.title)
                          }
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-[#1E3A8A] hover:bg-[#1E40AF] focus:outline-none transition-colors duration-200"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-4 w-4 mr-1"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                            />
                          </svg>
                          Unduh Gambar
                        </button>

                        <div className="relative inline-block text-left">
                          <button
                            type="button"
                            className="inline-flex items-center p-1.5 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setDropdownIdx(idx === dropdownIdx ? null : idx);
                            }}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                              />
                            </svg>
                          </button>

                          {dropdownIdx === idx && (
                            <div
                              className="absolute right-0 z-50 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
                              style={{
                                position: "fixed",
                                top: "auto",
                                bottom: "auto",
                                right: "auto",
                              }}
                            >
                              <div
                                className="py-1"
                                role="menu"
                                aria-orientation="vertical"
                              >
                                <button
                                  onClick={() =>
                                    handleChangeProgress(idx, "done")
                                  }
                                  className="flex items-center px-4 py-2 text-sm text-green-700 hover:bg-green-50 w-full text-left"
                                  role="menuitem"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                  Tandai Selesai
                                </button>
                                <button
                                  onClick={() =>
                                    handleChangeProgress(idx, "in_progress")
                                  }
                                  className="flex items-center px-4 py-2 text-sm text-yellow-700 hover:bg-yellow-50 w-full text-left"
                                  role="menuitem"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  Tandai Sedang Diproses
                                </button>
                                <button
                                  onClick={() =>
                                    handleChangeProgress(idx, "perbaikan")
                                  }
                                  className="flex items-center px-4 py-2 text-sm text-blue-700 hover:bg-blue-50 w-full text-left"
                                  role="menuitem"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                  Minta Revisi
                                </button>
                                <button
                                  onClick={() =>
                                    handleChangeProgress(idx, "ditolak")
                                  }
                                  className="flex items-center px-4 py-2 text-sm text-red-700 hover:bg-red-50 w-full text-left"
                                  role="menuitem"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                  Tolak Laporan
                                </button>
                                <div className="border-t border-gray-100"></div>
                                <button
                                  onClick={() => handleDelete(idx)}
                                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                  role="menuitem"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4 mr-2"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                  Hapus Laporan
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
