import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

interface Report {
  _id: string;
  title: string;
  sektor: string;
  subsektor: string;
  status: "in_progress" | "done" | "perbaikan" | "ditolak";
  createdAt: string;
}

export default function Dashboard() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFlowButton, setShowFlowButton] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Selalu tampilkan alert setiap masuk / refresh halaman
    Swal.fire({
      title: "Selamat Datang di Dashboard",
      text: "Di sini Anda dapat melihat semua laporan yang telah Anda kirimkan dan statusnya.",
      icon: "info",
      confirmButtonText: "Mengerti",
      confirmButtonColor: "#F15A24",
    }).then(() => {
      // Tampilkan tombol alur setelah alert ditutup
      setShowFlowButton(true);
    });

    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:3000/report/user", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        setReports(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch reports", err);
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const showUsageFlow = () => {
    Swal.fire({
      title: "Alur Pemakaian Dashboard",
      html: `
        <div class="text-center">
          <img 
            src="/path-to-your-flow-image.png" 
            alt="Alur Pemakaian Dashboard" 
            class="mx-auto mb-4 max-w-full h-auto"
            style="max-height: 400px;"
          />
          <p class="text-gray-600">Berikut adalah alur penggunaan dashboard laporan</p>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: "Tutup",
      confirmButtonColor: "#F15A24",
      width: 800,
    });
  };

  const statusCounts = {
    total: reports.length,
    done: reports.filter((r) => r.status === "done").length,
    in_progress: reports.filter((r) => r.status === "in_progress").length,
    perbaikan: reports.filter((r) => r.status === "perbaikan").length,
    ditolak: reports.filter((r) => r.status === "ditolak").length,
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-6 mt-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            Laporan Saya
          </h1>
          <p className="text-gray-500 mt-1">
            Pantau status laporan yang telah Anda kirim
          </p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          {showFlowButton && (
            <button
              onClick={showUsageFlow}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-[#1E3A8A] hover:bg-[#1E40AF] text-white transition-all shadow-sm hover:shadow-md w-full justify-center md:w-auto"
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
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              SOP
            </button>
          )}
          <Link to="/upload" className="w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium bg-[#F15A24] text-white hover:bg-orange-600 transition-all shadow-sm hover:shadow-md w-full justify-center">
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Tambah Laporan Baru
            </button>
          </Link>
          <Link to="/" className="w-full md:w-auto">
            <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all w-full justify-center">
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
            </button>
          </Link>
        </div>
      </div>

      {/* Ringkasan Statistik */}
      {reports.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Laporan</h3>
            <p className="mt-1 text-2xl font-bold text-gray-900">
              {statusCounts.total}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-medium text-gray-500">Selesai</h3>
            <p className="mt-1 text-2xl font-bold text-green-600">
              {statusCounts.done}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-medium text-gray-500">
              Sedang Diproses
            </h3>
            <p className="mt-1 text-2xl font-bold text-yellow-600">
              {statusCounts.in_progress}
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <h3 className="text-sm font-medium text-gray-500">Perlu Revisi</h3>
            <p className="mt-1 text-2xl font-bold text-blue-600">
              {statusCounts.perbaikan}
            </p>
          </div>
        </div>
      )}

      {/* Tabel */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="inline-block h-10 w-10 animate-spin rounded-full border-4 border-solid border-[#F15A24] border-r-transparent"></div>
              <span className="text-gray-500">Memuat laporan Anda...</span>
            </div>
          </div>
        ) : reports.length === 0 ? (
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
              Belum ada laporan
            </h3>
            <p className="mt-1 text-gray-500">
              Anda belum mengirimkan laporan apapun
            </p>
            <Link
              to="/upload"
              className="mt-4 inline-block px-4 py-2 text-sm font-medium rounded-lg bg-[#F15A24] text-white hover:bg-orange-600 transition"
            >
              Kirim Laporan Pertama Anda
            </Link>
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
                {reports.map((report) => (
                  <tr
                    key={report._id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.createdAt).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 max-w-xs truncate">
                      {report.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.sektor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {report.subsektor}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          report.status === "done"
                            ? "bg-green-100 text-green-800"
                            : report.status === "in_progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : report.status === "perbaikan"
                            ? "bg-blue-100 text-blue-800"
                            : report.status === "ditolak"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {report.status === "in_progress"
                          ? "Sedang Diproses"
                          : report.status === "done"
                          ? "Selesai"
                          : report.status === "perbaikan"
                          ? "Perlu Revisi"
                          : report.status === "ditolak"
                          ? "Ditolak"
                          : "Tidak Diketahui"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          if (report.status === "perbaikan") {
                            navigate(`/edit/${report._id}`);
                          } else {
                            Swal.fire({
                              icon: "info",
                              title: "Tidak Bisa Diedit",
                              text: "Anda hanya bisa mengedit laporan yang memerlukan revisi.",
                              confirmButtonColor: "#F15A24",
                            });
                          }
                        }}
                        className={`inline-flex items-center px-3 py-1.5 border rounded-md text-sm font-medium ${
                          report.status === "perbaikan"
                            ? "bg-blue-600 text-white hover:bg-blue-700 border-transparent"
                            : "bg-gray-100 text-gray-500 border-gray-300 cursor-not-allowed"
                        } transition-colors`}
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
