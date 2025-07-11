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

  const scrollToContent = () => {
    const contentSection = document.querySelector(".content-section");
    contentSection?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="flex-grow">
      {/* Hero Section - Full Screen */}
      <section className="min-h-screen flex items-center justify-center text-gray-600 body-font relative">
        <div className="container mx-auto flex px-5 py-24 items-center justify-center flex-col">
          <div className="text-center lg:w-2/3 w-full">
            <h1 className="title-font sm:text-4xl text-3xl mb-4 font-medium text-gray-900">
              Microdosing synth tattooed vexillologist
            </h1>
            <p className="mb-8 leading-relaxed">
              Meggings kinfolk echo park stumptown DIY, kale chips beard
              jianbing tousled. Chambray dreamcatcher trust fund, kitsch vice
              godard disrupt ramps hexagon mustache umami snackwave tilde
              chillwave ugh. Pour-over meditation PBR&amp;B pickled ennui celiac
              mlkshk freegan photo booth af fingerstache pitchfork.
            </p>
          </div>
        </div>

        {/* Scroll Down Arrow */}
        <div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer"
          onClick={scrollToContent}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-gray-500 hover:text-gray-700 transition-colors"
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
        </div>
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
