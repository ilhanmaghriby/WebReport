import React, { useEffect, useState } from "react";
import ReportCard from "./Card";
import { motion } from "framer-motion";

interface ReportData {
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
const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
    },
  },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.8 } },
};

const bounceTransition = {
  y: {
    duration: 0.8,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeOut" as const,
  },
};

const Home: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${import.meta.env.VITE_BACKEND_URL}/report/verified`
        );
        const data = await response.json();

        const doneReports: ReportData[] = data.map((item: any) => ({
          _id: item._id,
          title: item.title,
          sektor: item.sektor,
          subsektor: item.subsektor,
          uploadedBy: item.userId?.username || "Unknown",
          prasaranaItems: item.prasaranaItems || [],
        }));

        setReportData(doneReports);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <main className="flex-grow">
      <section
        className="min-h-screen flex items-center justify-center text-white relative"
        style={{
          background: "linear-gradient(to bottom, #ffe0b2, #ffffff)",
        }}
      >
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeIn}
          className="container mx-auto flex px-5 py-24 items-center justify-center flex-col"
        >
          <div className="text-center lg:w-2/3 w-full">
            <motion.h1
              variants={itemVariants}
              className="font-poppins font-extrabold  text-3xl md:text-4xl tracking-wide mb-4 text-gray-900"
            >
              Inventarisasi Data Kerusakan Pascabencana (SIAP)
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="font-inter  text-base md:text-lg leading-relaxed text-gray-800 mb-8"
            >
              Sistem digital berbasis web yang menjadi platform terpadu untuk
              inventarisasi data kerusakan pascabencana, terintegrasi dengan
              data{" "}
              <span className="italic font-medium">
                Kartu Inventaris Barang (KIB)
              </span>{" "}
              melalui kolaborasi OPD teknis di Kabupaten Pidie Jaya.
            </motion.p>
          </div>
        </motion.div>

        {/* Scroll Down Arrow */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={bounceTransition}
          className="absolute bottom-10  transform -translate-x-1/2 cursor-pointer"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-gray-600 hover:text-gray-800 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </section>

      {/* Content Section */}
      <div className="content-section mx-auto p-8">
        {isLoading ? (
          <div className="flex justify-center items-center mt-20">
            <div
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent"
              role="status"
            >
              <span className="sr-only">Loading...</span>
            </div>
          </div>
        ) : reportData.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-24 w-24 text-gray-400 mb-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-2xl font-medium text-gray-600 mb-2">
              Belum ada data yang masuk atau diverifikasi
            </h3>
            <p className="text-gray-500 max-w-md">
              Saat ini tidak ada laporan kerusakan yang telah diverifikasi.
              Silakan periksa kembali nanti.
            </p>
          </motion.div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1  gap-8 ">
            {reportData.map((report) => (
              <ReportCard
                key={report._id}
                _id={report._id}
                title={report.title}
                sektor={report.sektor}
                subsektor={report.subsektor}
                prasaranaItems={report.prasaranaItems}
                uploadedBy={report.uploadedBy}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default Home;
