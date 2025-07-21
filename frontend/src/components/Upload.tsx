import { useState, type ChangeEvent, type FormEvent, useEffect } from "react";
import { Link } from "react-router-dom";
import { dataJalan } from "./DataJalan";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

interface PrasaranaItem {
  prasarana: string;
  kodeBarang: string;
  lokasi: string;
  latitude: number;
  longitude: number;
  totalKerusakanDanKerugian: number;
  kerusakan: {
    berat: boolean;
    sedang: boolean;
    ringan: boolean;
  };
  dataKerusakan: {
    berat: number;
    sedang: number;
    ringan: number;
  };
  nilaiKerusakanKategori: {
    berat: number;
    sedang: number;
    ringan: number;
  };
  luasRataRata: number;
  satuan: string;
  hargaSatuan: number;
  perkiraanKerusakan: number;
  perkiraanKerugian: number;
  keterangan: string;
  images: File[];
}

interface InputFieldProps {
  label: string;
  name: string;
  value: string | number;
  onChange?: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  type?: string;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
}

export default function Upload() {
  const [data, setData] = useState({
    title: "",
    sektor: "",
    subsektor: "",
    sarana: "",
    prasaranaItems: [] as PrasaranaItem[],
    keterangan: "",
  });

  const [currentPrasarana, setCurrentPrasarana] = useState<PrasaranaItem>({
    prasarana: "",
    kodeBarang: "",
    lokasi: "",
    latitude: 0,
    longitude: 0,
    totalKerusakanDanKerugian: 0,
    kerusakan: {
      berat: false,
      sedang: false,
      ringan: false,
    },
    dataKerusakan: {
      berat: 0,
      sedang: 0,
      ringan: 0,
    },
    nilaiKerusakanKategori: {
      berat: 0,
      sedang: 0,
      ringan: 0,
    },
    luasRataRata: 0,
    satuan: "",
    hargaSatuan: 0,
    perkiraanKerusakan: 0,
    perkiraanKerugian: 0,
    keterangan: "",
    images: [],
  });

  const [formattedValues, setFormattedValues] = useState({
    dataBerat: "",
    dataSedang: "",
    dataRingan: "",
    nilaiBerat: "",
    nilaiSedang: "",
    nilaiRingan: "",
    perkiraanKerusakan: "",
    perkiraanKerugian: "",
    totalKerusakanDanKerugian: "",
  });

  const navigate = useNavigate();

  const addPrasarana = () => {
    if (!currentPrasarana.prasarana) return;

    // Calculate total before adding
    const total =
      currentPrasarana.perkiraanKerusakan + currentPrasarana.perkiraanKerugian;
    const prasaranaWithTotal = {
      ...currentPrasarana,
      totalKerusakanDanKerugian: total,
    };

    setData((prev) => ({
      ...prev,
      prasaranaItems: [...prev.prasaranaItems, prasaranaWithTotal],
    }));

    // Reset with all fields
    setCurrentPrasarana({
      prasarana: "",
      kodeBarang: "",
      lokasi: "",
      latitude: 0,
      longitude: 0,
      totalKerusakanDanKerugian: 0,
      kerusakan: {
        berat: false,
        sedang: false,
        ringan: false,
      },
      dataKerusakan: {
        berat: 0,
        sedang: 0,
        ringan: 0,
      },
      nilaiKerusakanKategori: {
        berat: 0,
        sedang: 0,
        ringan: 0,
      },
      luasRataRata: 0,
      satuan: "",
      hargaSatuan: 0,
      perkiraanKerusakan: 0,
      perkiraanKerugian: 0,
      keterangan: "",
      images: [],
    });

    // Also reset formatted values
    setFormattedValues({
      dataBerat: "",
      dataSedang: "",
      dataRingan: "",
      nilaiBerat: "",
      nilaiSedang: "",
      nilaiRingan: "",
      perkiraanKerusakan: "",
      perkiraanKerugian: "",
      totalKerusakanDanKerugian: "",
    });
  };

  const removePrasarana = (index: number) => {
    setData((prev) => ({
      ...prev,
      prasaranaItems: prev.prasaranaItems.filter((_, i) => i !== index),
    }));
  };

  const [imagePreviews, setImagePreviews] = useState<
    { file: File | string; url: string }[]
  >([]);

  useEffect(() => {
    if (data.sarana === "Transportasi Darat" && currentPrasarana.prasarana) {
      const matched = dataJalan.find(
        (item) => item.judul === currentPrasarana.prasarana
      );
      if (matched) {
        setCurrentPrasarana((prev) => ({
          ...prev,
          kodeBarang: matched.kode,
        }));
      }
    } else {
      setCurrentPrasarana((prev) => ({
        ...prev,
        kodeBarang: "",
      }));
    }
  }, [data.sarana, currentPrasarana.prasarana]);

  useEffect(() => {
    // Calculate perkiraan kerusakan automatically
    const perkiraanKerusakan =
      currentPrasarana.nilaiKerusakanKategori.berat +
      currentPrasarana.nilaiKerusakanKategori.sedang +
      currentPrasarana.nilaiKerusakanKategori.ringan;

    const total = perkiraanKerusakan + currentPrasarana.perkiraanKerugian;

    setCurrentPrasarana((prev) => ({
      ...prev,
      perkiraanKerusakan,
      totalKerusakanDanKerugian: total,
    }));

    setFormattedValues((prev) => ({
      ...prev,
      perkiraanKerusakan: formatRupiah(String(perkiraanKerusakan)),
      totalKerusakanDanKerugian: formatRupiah(String(total)),
    }));
  }, [
    currentPrasarana.nilaiKerusakanKategori.berat,
    currentPrasarana.nilaiKerusakanKategori.sedang,
    currentPrasarana.nilaiKerusakanKategori.ringan,
    currentPrasarana.dataKerusakan.berat,
    currentPrasarana.dataKerusakan.sedang,
    currentPrasarana.dataKerusakan.ringan,
    currentPrasarana.perkiraanKerugian,
  ]);

  useEffect(() => {
    // Buat preview untuk gambar baru
    const newPreviews = currentPrasarana.images.map((img) => {
      // Jika sudah ada preview untuk file ini, gunakan yang ada
      const existing = imagePreviews.find((p) =>
        typeof img === "string" ? p.file === img : p.file === img
      );
      return (
        existing || {
          file: img,
          url: typeof img === "string" ? img : URL.createObjectURL(img),
        }
      );
    });

    setImagePreviews(newPreviews);

    // Bersihkan preview yang tidak digunakan
    return () => {
      newPreviews.forEach((preview) => {
        if (typeof preview.file !== "string") {
          URL.revokeObjectURL(preview.url);
        }
      });
    };
  }, [currentPrasarana.images]);
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Validasi input utama
    if (
      !data.title ||
      !data.sektor ||
      !data.subsektor ||
      !data.sarana ||
      data.prasaranaItems.length === 0
    ) {
      Swal.fire({
        icon: "warning",
        title: "Lengkapi Semua Data",
        text: "Harap isi semua bagian form dan tambahkan minimal satu prasarana.",
      });
      return;
    }

    // Validasi untuk currentPrasarana jika ada yang belum ditambahkan
    const isCurrentFilled =
      currentPrasarana.prasarana &&
      currentPrasarana.kodeBarang &&
      currentPrasarana.lokasi;

    if (isCurrentFilled) {
      // Jika ada currentPrasarana yang belum ditambahkan, validasi juga
      if (
        !currentPrasarana.prasarana ||
        !currentPrasarana.kodeBarang ||
        !currentPrasarana.lokasi
      ) {
        Swal.fire({
          icon: "warning",
          title: "Lengkapi Data Prasarana",
          text: "Harap lengkapi data prasarana yang sedang diisi atau tambahkan ke daftar.",
        });
        return;
      }
    }

    try {
      let prasaranaItems = [...data.prasaranaItems];

      // Jika currentPrasarana sedang diisi (belum ditambahkan), tambahkan juga
      if (isCurrentFilled) {
        const total =
          currentPrasarana.perkiraanKerusakan +
          currentPrasarana.perkiraanKerugian;

        prasaranaItems.push({
          ...currentPrasarana,
          totalKerusakanDanKerugian: total,
        });
      }

      const formData = new FormData();

      // Isi data utama
      formData.append("title", data.title);
      formData.append("sektor", data.sektor);
      formData.append("subsektor", data.subsektor);
      formData.append("sarana", data.sarana);
      formData.append("keterangan", data.keterangan);

      // Siapkan prasarana tanpa gambar untuk dikirim sebagai JSON
      const itemsWithoutImages = prasaranaItems.map((item, index) => ({
        ...item,
        images: item.images.map((_, i) => `prasarana_${index}_img_${i}`),
      }));

      formData.append("prasaranaItems", JSON.stringify(itemsWithoutImages));

      // Tambahkan gambar-gambar prasarana ke FormData
      prasaranaItems.forEach((item, index) => {
        item.images.forEach((img, i) => {
          formData.append(`prasarana_${index}_img_${i}`, img);
        });
      });

      const res = await fetch("http://localhost:3000/report", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: formData,
      });

      if (!res.ok) {
        // Jika response tidak OK, throw error dan tidak lanjut ke success handler
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || "Gagal mengirim data ke server");
      }

      const result = await res.json();
      console.log("Sukses:", result);

      Swal.fire({
        title: "Berhasil!",
        text: "Data berhasil dikirim.",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/dashboard");
      });
    } catch (err: any) {
      console.error("Error:", err);

      // Membersihkan preview gambar jika submit gagal
      setImagePreviews([]);
      setCurrentPrasarana((prev) => ({
        ...prev,
        images: [],
      }));

      Swal.fire({
        title: "Gagal!",
        text: err?.message || "Gagal mengirim data.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target as
      | HTMLInputElement
      | HTMLTextAreaElement
      | HTMLSelectElement;
    const { name, value, type } = target;
    const checked =
      type === "checkbox" ? (target as HTMLInputElement).checked : undefined;

    // Jika field termasuk dalam prasarana (e.g., prasarana.nama)
    if (name.startsWith("prasarana.")) {
      const fieldName = name.split(".")[1];
      setCurrentPrasarana((prev) => ({
        ...prev,
        [fieldName]: value,
      }));
      return;
    }

    // Ceklis tingkat kerusakan
    if (["berat", "sedang", "ringan"].includes(name)) {
      setCurrentPrasarana((prev) => ({
        ...prev,
        kerusakan: {
          ...prev.kerusakan,
          [name]: checked,
        },
        tingkatKerusakan: name,
      }));
      return;
    }

    // Nilai kerusakan per kategori (nilaiBerat, nilaiSedang, nilaiRingan)
    if (["nilaiBerat", "nilaiSedang", "nilaiRingan"].includes(name)) {
      const rawValue = value.replace(/[^0-9]/g, "");
      const numericValue = Number(rawValue);
      const kategori = name.replace("nilai", "").toLowerCase();

      setCurrentPrasarana((prev) => ({
        ...prev,
        nilaiKerusakanKategori: {
          ...prev.nilaiKerusakanKategori,
          [kategori]: numericValue,
        },
      }));

      setFormattedValues((prev) => ({
        ...prev,
        [name]: formatRupiah(value),
      }));
      return;
    }

    // Data kerusakan jumlah unit (dataBerat, dataSedang, dataRingan)
    if (["dataBerat", "dataSedang", "dataRingan"].includes(name)) {
      const kategori = name.replace("data", "").toLowerCase();
      const numericValue = Number(value); // tidak diformat ke rupiah

      setCurrentPrasarana((prev) => ({
        ...prev,
        dataKerusakan: {
          ...prev.dataKerusakan,
          [kategori]: numericValue,
        },
      }));
      return;
    }

    if (name === "perkiraanKerugian") {
      const rawValue = value.replace(/[^0-9]/g, "");
      const numericValue = Number(rawValue);

      setCurrentPrasarana((prev) => ({
        ...prev,
        perkiraanKerugian: numericValue,
        totalKerusakanDanKerugian: prev.perkiraanKerusakan + numericValue,
      }));

      setFormattedValues((prev) => ({
        ...prev,
        perkiraanKerugian: formatRupiah(value),
        totalKerusakanDanKerugian: formatRupiah(
          String(currentPrasarana.perkiraanKerusakan + numericValue)
        ),
      }));
      return;
    }

    // Untuk field umum lainnya di form utama
    setData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const validFiles = Array.from(files).filter(
      (file) => file.size <= 1024 * 1024
    );

    if (validFiles.length !== files.length) {
      Swal.fire({
        icon: "error",
        title: "Ukuran gambar terlalu besar",
        text: "Beberapa gambar melebihi batas 1MB dan tidak diunggah.",
      });
    }

    setCurrentPrasarana((prev) => ({
      ...prev,
      images: [...prev.images, ...validFiles],
    }));
  };

  const subsektorOptions: Record<string, string[]> = {
    PERMUKIMAN: ["Perumahan", "Pras Lingk"],
    INFRASTRUKTUR: [
      "Transportasi",
      "Energi",
      "Pos dan Telekomunikasi",
      "Air dan Sanitasi",
      "Sumber Daya Air",
    ],
    "EKONOMI PRODUKTIF": [
      "Pertanian, Perkebunan dan Peternakan",
      "Perikanan",
      "Pariwisata",
    ],
    SOSIAL: ["Kesehatan", "Pendidikan", "Agama", "Lembaga"],
    "LINTAS SEKTOR": [
      "Pemerintahan",
      "Keuangan dan Perbankan",
      "Ketertiban dan Keamanan (TNI/POLRI)",
      "Lingkungan Hidup",
    ],
  };

  const getSaranaOptions = (): string[] => {
    if (data.sektor === "PERMUKIMAN" && data.subsektor === "Perumahan") {
      return ["Perumahan"];
    }
    if (data.sektor === "INFRASTRUKTUR") {
      if (data.subsektor === "Transportasi") return ["Transportasi Darat"];
      if (data.subsektor === "Energi") return ["Ketenagalistrikan"];
      if (data.subsektor === "Air dan Sanitasi") return ["Sarana Air Bersih"];
    }
    if (data.sektor === "EKONOMI PRODUKTIF") {
      if (data.subsektor === "Pertanian, Perkebunan dan Peternakan")
        return ["Pertanian", "Peternakan"];
    }
    return [];
  };

  const getPrasaranaOptions = (): string[] => {
    if (data.sektor === "PERMUKIMAN" && data.subsektor === "Perumahan") {
      return ["Rumah Permanen", "Rumah Semi Permanen", "Rumah Non Permanen"];
    }

    if (data.sektor === "INFRASTRUKTUR" && data.subsektor === "Transportasi") {
      return dataJalan.map((item) => item.judul);
    }

    return [];
  };

  const formatRupiah = (value: string): string => {
    const numberString = value.replace(/[^,\d]/g, "");
    const split = numberString.split(",");
    let sisa = split[0].length % 3;
    let rupiah = split[0].substr(0, sisa);
    const ribuan = split[0].substr(sisa).match(/\d{3}/g);

    if (ribuan) {
      rupiah += (sisa ? "." : "") + ribuan.join(".");
    }

    return split[1] !== undefined ? `Rp ${rupiah},${split[1]}` : `Rp ${rupiah}`;
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-sm"
    >
      {/* Report Detail Section */}
      <div className="mb-10">
        <SectionHeader title="Report Detail" />
        <div className="ml-8 space-y-4">
          <InputField
            label="Judul Laporan"
            name="title"
            value={data.title}
            onChange={handleChange}
            placeholder="Masukkan judul laporan"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sektor Dropdown */}
            <div className="mb-4">
              <label
                htmlFor="sektor"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sektor
              </label>
              <select
                id="sektor"
                name="sektor"
                value={data.sektor}
                onChange={(e) =>
                  setData((prev) => ({ ...prev, sektor: e.target.value }))
                }
                className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">-- Pilih Sektor --</option>
                <option value="PERMUKIMAN">PERMUKIMAN</option>
                <option value="INFRASTRUKTUR">INFRASTRUKTUR</option>
                <option value="EKONOMI PRODUKTIF">EKONOMI PRODUKTIF</option>
                <option value="SOSIAL">SOSIAL</option>
                <option value="LINTAS SEKTOR">LINTAS SEKTOR</option>
              </select>
            </div>

            {/* Sub Sektor Dropdown */}
            <div className="mb-4">
              <label
                htmlFor="subsektor"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sub Sektor
              </label>
              <select
                id="subsektor"
                name="subsektor"
                value={data.subsektor}
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    subsektor: e.target.value,
                    sarana: "",
                    prasaranaItems: [],
                  }));
                  setCurrentPrasarana({
                    prasarana: "",
                    kodeBarang: "",
                    lokasi: "",
                    latitude: 0,
                    longitude: 0,
                    totalKerusakanDanKerugian: 0,
                    kerusakan: {
                      berat: false,
                      sedang: false,
                      ringan: false,
                    },
                    dataKerusakan: {
                      berat: 0,
                      sedang: 0,
                      ringan: 0,
                    },
                    nilaiKerusakanKategori: {
                      berat: 0,
                      sedang: 0,
                      ringan: 0,
                    },
                    luasRataRata: 0,
                    satuan: "",
                    hargaSatuan: 0,
                    perkiraanKerusakan: 0,
                    perkiraanKerugian: 0,
                    keterangan: "",
                    images: [],
                  });
                }}
                className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                disabled={!data.sektor}
              >
                <option value="">-- Pilih Sub Sektor --</option>
                {(subsektorOptions[data.sektor] || []).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sarana Section */}
          {getSaranaOptions().length > 0 ? (
            <div className="mb-4">
              <label
                htmlFor="sarana"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Sarana
              </label>
              <select
                id="sarana"
                name="sarana"
                value={data.sarana}
                onChange={(e) => {
                  setData((prev) => ({
                    ...prev,
                    sarana: e.target.value,
                    prasaranaItems: [],
                  }));
                  setCurrentPrasarana({
                    prasarana: "",
                    kodeBarang: "",
                    lokasi: "",
                    latitude: 0,
                    longitude: 0,
                    totalKerusakanDanKerugian: 0,
                    kerusakan: {
                      berat: false,
                      sedang: false,
                      ringan: false,
                    },
                    dataKerusakan: {
                      berat: 0,
                      sedang: 0,
                      ringan: 0,
                    },
                    nilaiKerusakanKategori: {
                      berat: 0,
                      sedang: 0,
                      ringan: 0,
                    },
                    luasRataRata: 0,
                    satuan: "",
                    hargaSatuan: 0,
                    perkiraanKerusakan: 0,
                    perkiraanKerugian: 0,
                    keterangan: "",
                    images: [],
                  });
                }}
                className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="">-- Pilih Sarana --</option>
                {getSaranaOptions().map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <InputField
              label="Sarana"
              name="sarana"
              value={data.sarana}
              onChange={handleChange}
              placeholder="Masukkan nama sarana"
            />
          )}

          {/* Prasarana Section */}
          {data.sarana && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-800 mb-4">
                Prasarana
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prasarana
                  </label>
                  {(data.sektor === "INFRASTRUKTUR" &&
                    (data.subsektor === "Energi" ||
                      data.subsektor === "Air dan Sanitasi")) ||
                  (data.sektor === "EKONOMI PRODUKTIF" &&
                    (data.sarana === "Pertanian" ||
                      data.sarana === "Peternakan")) ||
                  getPrasaranaOptions().length === 0 ? (
                    <input
                      type="text"
                      value={currentPrasarana.prasarana}
                      onChange={(e) =>
                        setCurrentPrasarana((prev) => ({
                          ...prev,
                          prasarana: e.target.value,
                        }))
                      }
                      placeholder="Masukkan nama prasarana"
                      className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                  ) : (
                    <select
                      value={currentPrasarana.prasarana}
                      onChange={(e) =>
                        setCurrentPrasarana((prev) => ({
                          ...prev,
                          prasarana: e.target.value,
                        }))
                      }
                      className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option value="">-- Pilih Prasarana --</option>
                      {data.sarana === "Transportasi Darat"
                        ? [...dataJalan] // Buat salinan array
                            .sort((a, b) => a.judul.localeCompare(b.judul)) // Urutkan berdasarkan judul A-Z
                            .map((item) => (
                              <option key={item.kode} value={item.judul}>
                                {item.judul}
                              </option>
                            ))
                        : getPrasaranaOptions().map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                    </select>
                  )}
                </div>

                {data.sarana === "Transportasi Darat" &&
                  currentPrasarana.prasarana && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Kode Barang
                        </label>
                        <input
                          type="text"
                          readOnly
                          value={currentPrasarana.kodeBarang}
                          className="w-full border border-gray-300 rounded-md px-4 py-2 bg-gray-100 text-gray-600"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Pilih Lokasi Barang
                        </label>
                        <select
                          value={currentPrasarana.lokasi}
                          onChange={(e) =>
                            setCurrentPrasarana((prev) => ({
                              ...prev,
                              lokasi: e.target.value,
                            }))
                          }
                          className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        >
                          <option value="">-- Pilih Lokasi --</option>
                          {(() => {
                            const lokasiList =
                              dataJalan.find(
                                (item) =>
                                  item.judul === currentPrasarana.prasarana
                              )?.lokasiBarang || [];

                            return lokasiList
                              .slice()
                              .sort((a, b) => a.localeCompare(b))
                              .map((lokasiBarang, idx) => (
                                <option key={idx} value={lokasiBarang}>
                                  {lokasiBarang}
                                </option>
                              ));
                          })()}
                        </select>
                      </div>
                    </div>
                  )}

                {data.sarana && data.sarana !== "Transportasi Darat" && (
                  <InputField
                    label="Lokasi"
                    name="prasarana.lokasi"
                    value={currentPrasarana.lokasi}
                    onChange={handleChange}
                    placeholder="Masukkan lokasi barang"
                  />
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Latitude"
                    name="prasarana.latitude"
                    type="number"
                    value={currentPrasarana.latitude}
                    onChange={handleChange}
                  />

                  <InputField
                    label="Longitude"
                    name="prasarana.longitude"
                    type="number"
                    value={currentPrasarana.longitude}
                    onChange={handleChange}
                  />
                </div>

                {/* Data Kerusakan for Current Prasarana */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">
                    Data Kerusakan
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="mb-4">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tingkat Kerusakan
                          </label>
                          <div className="flex flex-wrap gap-4">
                            {["berat", "sedang", "ringan"].map((level) => (
                              <label
                                key={level}
                                className="inline-flex items-center px-4 py-2 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  name={level}
                                  checked={
                                    currentPrasarana.kerusakan[
                                      level as keyof typeof currentPrasarana.kerusakan
                                    ]
                                  }
                                  onChange={handleChange}
                                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm font-medium text-gray-700 capitalize">
                                  {level}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <InputField
                      label="Satuan"
                      name="prasarana.satuan"
                      value={currentPrasarana.satuan}
                      onChange={handleChange}
                    />
                    {currentPrasarana.kerusakan.berat && (
                      <>
                        <InputField
                          label="Data Kerusakan Berat"
                          name="dataBerat"
                          value={currentPrasarana.dataKerusakan.berat}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Nilai Kerusakan Berat (Rp)"
                          name="nilaiBerat"
                          value={formattedValues.nilaiBerat}
                          onChange={handleChange}
                        />
                      </>
                    )}

                    {currentPrasarana.kerusakan.sedang && (
                      <>
                        <InputField
                          label="Data Kerusakan Sedang"
                          name="dataSedang"
                          value={currentPrasarana.dataKerusakan.sedang}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Nilai Kerusakan Sedang (Rp)"
                          name="nilaiSedang"
                          value={formattedValues.nilaiSedang}
                          onChange={handleChange}
                        />
                      </>
                    )}

                    {currentPrasarana.kerusakan.ringan && (
                      <>
                        <InputField
                          label="Data Kerusakan Ringan"
                          name="dataRingan"
                          value={currentPrasarana.dataKerusakan.ringan}
                          onChange={handleChange}
                        />
                        <InputField
                          label="Nilai Kerusakan Ringan (Rp)"
                          name="nilaiRingan"
                          value={formattedValues.nilaiRingan}
                          onChange={handleChange}
                        />
                      </>
                    )}
                  </div>
                </div>

                {/* Detail Barang for Current Prasarana */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">
                    Detail Barang
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Luas/Jumlah Rata-Rata"
                      name="prasarana.luasRataRata"
                      type="number"
                      value={currentPrasarana.luasRataRata}
                      onChange={handleChange}
                    />
                    <InputField
                      label="Harga Satuan"
                      name="prasarana.hargaSatuan"
                      type="number"
                      value={currentPrasarana.hargaSatuan}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Perkiraan Kerusakan & Kerugian for Current Prasarana */}
                <div className="mt-6">
                  <h4 className="text-md font-medium text-gray-700 mb-3">
                    Perkiraan Kerusakan & Kerugian
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Perkiraan Kerusakan (Rp)"
                      name="perkiraanKerusakan"
                      value={formattedValues.perkiraanKerusakan}
                      readOnly
                    />
                    <InputField
                      label="Perkiraan Kerugian (Rp)"
                      name="perkiraanKerugian"
                      value={formattedValues.perkiraanKerugian}
                      onChange={handleChange}
                    />
                    <div className="md:col-span-2">
                      <InputField
                        label="Total Kerusakan dan Kerugian (Rp)"
                        name="totalKerusakanDanKerugian"
                        value={formatRupiah(
                          currentPrasarana.totalKerusakanDanKerugian.toString()
                        )}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                {/* Keterangan for Current Prasarana */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keterangan
                  </label>
                  <textarea
                    name="prasarana.keterangan"
                    value={currentPrasarana.keterangan}
                    onChange={(e) => handleChange(e)}
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Masukkan keterangan tambahan..."
                  />
                </div>

                {/* Image Upload Section */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gambar (boleh lebih dari satu)
                  </label>
                  <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <svg
                          className="w-8 h-8 mb-4 text-gray-500"
                          aria-hidden="true"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 20 16"
                        >
                          <path
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                          />
                        </svg>
                        <p className="mb-2 text-sm text-gray-500">
                          <span className="font-semibold">
                            Klik untuk upload
                          </span>
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, JPEG (MAX. 1MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        name="images"
                        multiple
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Gunakan currentPrasarana.images */}
                  {currentPrasarana.images &&
                    currentPrasarana.images.length > 0 && (
                      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                        {imagePreviews.map((preview, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={preview.url}
                              alt={`preview-${idx}`}
                              className="w-full h-32 object-cover rounded-lg"
                              onError={(e) => {
                                // Fallback jika gambar gagal dimuat
                                (e.target as HTMLImageElement).src =
                                  "placeholder-image-url";
                              }}
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setCurrentPrasarana((prev) => ({
                                  ...prev,
                                  images: prev.images.filter(
                                    (_, i) => i !== idx
                                  ),
                                }));
                              }}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-4 w-4"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

                <button
                  type="button"
                  onClick={addPrasarana}
                  className="mt-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                >
                  + Tambah Prasarana
                </button>
              </div>

              {data.prasaranaItems.length > 0 && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Daftar Prasarana
                  </label>
                  <div className="space-y-3">
                    {data.prasaranaItems.map((item, index) => (
                      <div
                        key={index}
                        className="border border-gray-200 p-4 rounded-lg relative bg-white"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Prasarana
                            </label>
                            <div className="p-2 bg-gray-50 rounded text-sm">
                              {item.prasarana}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Kode Barang
                            </label>
                            <div className="p-2 bg-gray-50 rounded text-sm">
                              {item.kodeBarang}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Lokasi
                            </label>
                            <div className="p-2 bg-gray-50 rounded text-sm">
                              {item.lokasi}
                            </div>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-500 mb-1">
                              Total Kerusakan & Kerugian
                            </label>
                            <div className="p-2 bg-gray-50 rounded text-sm">
                              {formatRupiah(
                                item.totalKerusakanDanKerugian.toString()
                              )}
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Latitude
                              </label>
                              <div className="p-2 bg-gray-50 rounded text-sm">
                                {item.latitude}
                              </div>
                            </div>
                            <div>
                              <label className="block text-xs font-medium text-gray-500 mb-1">
                                Longitude
                              </label>
                              <div className="p-2 bg-gray-50 rounded text-sm">
                                {item.longitude}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePrasarana(index)}
                          className="absolute top-3 right-3 text-red-500 hover:text-red-700 p-1"
                          aria-label="Hapus prasarana"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end space-x-4">
        <Link to="/dashboard">
          <button
            type="button"
            className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50  "
          >
            Kembali
          </button>
        </Link>
        <button
          type="submit"
          className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium bg-[#F15A24] text-white hover:bg-orange-600 "
        >
          Simpan Laporan
        </button>
      </div>
    </form>
  );
}

// SectionHeader component
const SectionHeader = ({ title }: { title: string }) => (
  <div className="flex items-center border-b border-gray-200 pb-3 mb-6">
    <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
  </div>
);

// InputField component
const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  disabled = false,
  readOnly = false,
  placeholder = "",
}: InputFieldProps) => (
  <div className="mb-4">
    <label
      htmlFor={name}
      className="block text-sm font-medium text-gray-700 mb-2"
    >
      {label}
    </label>
    <input
      id={name}
      name={name}
      type={type}
      value={value}
      onChange={onChange}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      className={`w-full border border-gray-300 rounded-md px-4 py-2 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
        disabled ? "bg-gray-100 text-gray-500" : ""
      } ${readOnly ? "bg-gray-50 cursor-not-allowed" : ""}`}
    />
  </div>
);
