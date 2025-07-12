import React, { useState } from "react";
import MapViewer from "./MapViewer";
import { exportToExcel } from "./exportToExcel";
import Swal from "sweetalert2";

interface ReportCardProps {
  _id: string;
  title: string;
  sektor: string;
  subsektor: string;
  uploadedBy: string;
  prasaranaItems?: {
    prasarana: string;
    kodeBarang: string;
    lokasi: string;
    latitude?: number;
    longitude?: number;
    images?: string[];
  }[];
}

const ReportCard: React.FC<ReportCardProps> = ({
  _id,
  title,
  sektor,
  subsektor,
  uploadedBy,
  prasaranaItems = [],
}) => {
  const [showMap, setShowMap] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Gabungkan semua gambar dari prasaranaItems
  const allImages: string[] = prasaranaItems.flatMap(
    (item) => item.images || []
  );

  // Ambil lokasi dari setiap prasarana
  const mapLocations = prasaranaItems
    .map((item) =>
      item.latitude !== undefined && item.longitude !== undefined
        ? { latitude: item.latitude, longitude: item.longitude }
        : null
    )
    .filter((loc) => loc !== null) as { latitude: number; longitude: number }[];

  const handleImageClick = () => {
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
  };

  const handleExportExcel = async () => {
    try {
      const res = await fetch(`http://localhost:3000/report/${_id}`);
      const detail = await res.json();

      const title = detail?.title || "Laporan_Kerusakan";
      await exportToExcel([detail], title);
    } catch (err) {
      console.error("Gagal ekspor Excel:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Gagal mengambil data laporan.",
      });
    }
  };

  const handleOpenMap = () => {
    const validLocation = mapLocations.some(
      (loc) => loc.latitude !== 0 || loc.longitude !== 0
    );

    if (!validLocation) {
      Swal.fire({
        icon: "warning",
        title: "Koordinat Tidak Tersedia",
        text: "Koordinat tidak tersedia untuk laporan ini.",
      });
    } else {
      setShowMap(true);
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col md:flex-row w-full h-auto md:h-[280px] overflow-hidden transition-all hover:shadow-lg"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Gambar */}
      <div className="w-full md:w-[300px] h-[200px] md:h-full flex items-center justify-center bg-gray-100 relative overflow-hidden">
        {allImages.length > 0 ? (
          <>
            <img
              src={`http://localhost:3000/${allImages[currentImageIndex]}`}
              alt="Image"
              className={`w-full h-full object-cover cursor-pointer transition-transform duration-300 ${
                isHovering ? "scale-105" : "scale-100"
              }`}
              onClick={handleImageClick}
            />
            {allImages.length > 1 && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs">
                {currentImageIndex + 1}/{allImages.length}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-100 to-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Konten */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="space-y-2 overflow-hidden">
          <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
            {title}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Sektor
              </p>
              <p className="text-gray-800 font-medium truncate text-sm">
                {sektor}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Sub Sektor
              </p>
              <p className="text-gray-800 font-medium truncate text-sm">
                {subsektor}
              </p>
            </div>

            <div className="bg-gray-50 p-3 rounded-lg col-span-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Diupload Oleh
              </p>
              <p className="text-gray-800 font-medium truncate text-sm">
                {uploadedBy}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-4">
          <button
            onClick={handleOpenMap}
            className="flex items-center gap-1 border border-[#2C2F4A] text-[#2C2F4A] px-4 py-2 rounded-lg hover:bg-[#EFEFF7] transition-all hover:shadow-sm"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Peta
          </button>
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-1 bg-[#F15A24] text-white px-4 py-2 rounded-lg hover:bg-orange-600 shadow hover:shadow-md transition-all"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Lihat Data
          </button>
        </div>
      </div>

      {/* Modal Map */}
      {showMap && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-4xl relative mx-4">
            <button
              onClick={() => setShowMap(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-full hover:bg-gray-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
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
            </button>
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Location Map
            </h3>
            <div className="h-[500px]">
              <MapViewer prasaranaItems={prasaranaItems} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportCard;
