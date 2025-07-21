const mongoose = require("mongoose");

const PrasaranaItemSchema = new mongoose.Schema({
  prasarana: String,
  kodeBarang: String,
  lokasi: String,
  latitude: Number,
  longitude: Number,
  totalKerusakanDanKerugian: Number,
  kerusakan: {
    berat: { type: Boolean, default: false },
    sedang: { type: Boolean, default: false },
    ringan: { type: Boolean, default: false },
  },
  tingkatKerusakan: String,
  dataKerusakan: {
    berat: { type: Number, default: 0 },
    sedang: { type: Number, default: 0 },
    ringan: { type: Number, default: 0 },
  },
  nilaiKerusakanKategori: {
    berat: { type: Number, default: 0 },
    sedang: { type: Number, default: 0 },
    ringan: { type: Number, default: 0 },
  },
  luasRataRata: Number,
  satuan: String,
  hargaSatuan: Number,
  perkiraanKerusakan: Number,
  perkiraanKerugian: Number,
  keterangan: String,

  // ✅ Tambahkan array gambar untuk tiap prasarana
  images: [{ type: String }],
});

const ReportSchema = new mongoose.Schema(
  {
    title: String,
    sektor: String,
    subsektor: String,
    sarana: String,
    prasaranaItems: [PrasaranaItemSchema],
    keterangan: String,

    // ❌ Hapus image global jika tidak digunakan lagi
    // image: [String],

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: {
      type: String,
      enum: ["in_progress", "done", "perbaikan", "ditolak"],
      default: "in_progress",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", ReportSchema);
