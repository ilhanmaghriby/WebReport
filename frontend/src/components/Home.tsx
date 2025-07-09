import React, { useEffect, useState } from "react";
import ReportCard from "./Card";

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
    <main className="flex-grow mt-16">
      <div className="mx-auto p-8">
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
          <div className="max-w-7xl mx-auto grid grid-cols-1 gap-6">
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
