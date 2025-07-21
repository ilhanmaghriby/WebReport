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
        const response = await fetch("http://localhost:3000/report/verified");
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
              className="title-font sm:text-4xl text-3xl mb-4 font-bold text-gray-900"
            >
              Inventarisasi Data Kerusakan Pascabencana (SIAP)
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="mb-8 leading-relaxed text-gray-800"
            >
              Sistem digital berbasis web yang menjadi platform terpadu untuk
              inventarisasi data kerusakan pascabencana, terintegrasi dengan
              data Kartu Inventaris Barang (KIB) melalui kalobrasi OPD teknis di
              Kabupaten Pidie Jaya
            </motion.p>
          </div>
        </motion.div>

        {/* Scroll Down Arrow */}
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={bounceTransition}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
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
          <div className="text-center text-gray-500 text-lg mt-20">
            Belum ada data yang masuk atau diverifikasi
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
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
