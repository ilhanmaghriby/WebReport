import React, { useEffect, useState } from "react";
import ReportCard from "./Card";

interface ReportData {
  _id: string;
  title: string;
  sektor: string;
  subsektor: string;
  uploadedBy: string;
  lokasi: string;
  image?: string[];
  prasaranaItems?: {
    prasarana: string;
    kodeBarang: string;
    lokasi: string;
    latitude?: number;
    longitude?: number;
  }[];
}

const Home: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Tambahkan state loading

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true); // Mulai loading
        const response = await fetch("http://localhost:3000/report");
        const data = await response.json();

        const doneReports: ReportData[] = data
          .filter((item: any) => item.status === "done")
          .map((item: any) => ({
            _id: item._id,
            title: item.title,
            sektor: item.sektor,
            subsektor: item.subsektor,
            lokasi: item.lokasi,
            image: Array.isArray(item.image) ? item.image : [],
            prasaranaItems: item.prasaranaItems || [],
            uploadedBy: item.userId?.name || "Unknown",
          }));

        setReportData(doneReports);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false); // Selesai loading
      }
    };

    fetchData();
  }, []);

  return (
    <main className="flex-grow mt-16">
      <div className="mx-auto p-8">
        {isLoading ? (
          <div className="flex justify-center items-center mt-20">
            <div
              className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"
              role="status"
            >
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">
                Loading...
              </span>
            </div>
          </div>
        ) : reportData.length === 0 ? (
          <div className="text-center text-gray-500 text-lg mt-20">
            Belum ada data yang masuk atau diverifikasi
          </div>
        ) : (
          <div className="max-w-7xl mx-auto grid grid-cols-1  gap-6">
            {reportData.map((report) => (
              <ReportCard
                key={report._id}
                _id={report._id}
                title={report.title}
                sektor={report.sektor}
                subsektor={report.subsektor}
                image={report.image}
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
