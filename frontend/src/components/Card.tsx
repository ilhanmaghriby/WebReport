import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

// Animation variants
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
  },
};

const imageVariants = {
  initial: { opacity: 0 },
  enter: { opacity: 1, transition: { duration: 0.5 } },
  exit: { opacity: 0 },
};

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
  const [, setIsHovering] = useState(false);

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
      const res = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/report/${_id}`
      );
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
    <>
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        whileHover="hover"
        className="bg-white rounded-xl shadow-md border border-gray-200 flex flex-col md:flex-row w-full h-auto md:h-[280px] overflow-hidden"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Gambar */}
        <div className="w-full md:w-[300px] h-[200px] md:h-full flex items-center justify-center bg-gray-100 relative overflow-hidden">
          {allImages.length > 0 ? (
            <>
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImageIndex}
                  src={`${import.meta.env.VITE_BACKEND_URL}/${
                    allImages[currentImageIndex]
                  }`}
                  alt="Image"
                  variants={imageVariants}
                  initial="initial"
                  animate="enter"
                  exit="exit"
                  className={`w-full h-full object-cover cursor-pointer`}
                  onClick={handleImageClick}
                  whileHover={{ scale: 1.05 }}
                />
              </AnimatePresence>
              {allImages.length > 1 && (
                <motion.div
                  className="absolute bottom-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded-full text-xs"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  {currentImageIndex + 1}/{allImages.length}
                </motion.div>
              )}
            </>
          ) : (
            <motion.div
              className="w-full h-full flex items-center justify-center text-gray-500 bg-gradient-to-br from-gray-100 to-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
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
            </motion.div>
          )}
        </div>

        {/* Konten */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div className="space-y-2 overflow-hidden">
            <motion.h3
              className="text-xl font-bold text-gray-900 mb-2 line-clamp-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {title}
            </motion.h3>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Sektor", value: sektor },
                { label: "Sub Sektor", value: subsektor },
                { label: "Diupload Oleh", value: uploadedBy, span: 2 },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className={`bg-gray-50 p-3 rounded-lg ${
                    item.span ? "col-span-2" : ""
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
                    {item.label}
                  </p>
                  <p className="text-gray-800 font-medium truncate text-sm">
                    {item.value}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            className="flex justify-end gap-3 mt-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <motion.button
              onClick={handleOpenMap}
              className="flex items-center gap-1 border border-[#2C2F4A] text-[#2C2F4A] px-4 py-2 rounded-lg hover:bg-[#EFEFF7]"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
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
            </motion.button>
            <motion.button
              onClick={handleExportExcel}
              className="flex items-center gap-1 bg-[#F15A24] text-white px-4 py-2 rounded-lg hover:bg-orange-600 shadow"
              whileHover={{
                scale: 1.05,
                boxShadow: "0 4px 8px rgba(241, 90, 36, 0.3)",
              }}
              whileTap={{ scale: 0.95 }}
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
            </motion.button>
          </motion.div>
        </div>

        {/* Modal Map */}
      </motion.div>

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
    </>
  );
};

export default ReportCard;
