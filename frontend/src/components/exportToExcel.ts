import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export async function exportToExcel(dataArray: any[], title: string) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Laporan");

  const toNumber = (val: any): number => {
    if (typeof val === "number") return val;
    if (typeof val === "string") {
      return Number(val.replace(/\./g, "").replace(/,/g, ".")) || 0;
    }
    return 0;
  };

  // HEADER
  sheet.mergeCells("A1:A2");
  sheet.mergeCells("B1:B2");
  sheet.mergeCells("C1:C2");
  sheet.mergeCells("D1:G1");
  sheet.mergeCells("H1:H2");
  sheet.mergeCells("I1:I2");
  sheet.mergeCells("J1:L1");
  sheet.mergeCells("M1:M2");
  sheet.mergeCells("N1:N2");
  sheet.mergeCells("O1:O2");
  sheet.mergeCells("P1:P2");
  sheet.mergeCells("Q1:Q2");
  sheet.mergeCells("R1:R2");

  const headerRow = [
    "Sektor / Sub Sektor",
    "Sarana dan Prasarana",
    "Lokasi (Kecamatan / Desa)",
    "Berat",
    "Sedang",
    "Ringan",
    "Satuan",
    "Luas / Jumlah Rata2",
    "Harga Satuan (Rp)",
    "Berat",
    "Sedang",
    "Ringan",
    "Perkiraan Kerusakan (Rp)",
    "Prakiraan Kerugian (Rp)",
    "Total Kerusakan dan Kerugian (Rp)",
    "Keterangan",
    "Kode Barang",
    "Koordinat",
  ];

  // Baris ke-1
  sheet.getCell("D1").value = "Data Kerusakan";
  sheet.getCell("J1").value = "Nilai Kerusakan (Rp.)";

  // Baris ke-2
  sheet.getCell("D2").value = "Berat";
  sheet.getCell("E2").value = "Sedang";
  sheet.getCell("F2").value = "Ringan";
  sheet.getCell("G2").value = "Satuan";
  sheet.getCell("J2").value = "Berat";
  sheet.getCell("K2").value = "Sedang";
  sheet.getCell("L2").value = "Ringan";

  // Set kolom header lainnya
  const row2 = sheet.getRow(2);
  headerRow.forEach((header, index) => {
    row2.getCell(index + 1).value = header;
  });

  // Format header
  [1, 2].forEach((i) => {
    sheet.getRow(i).eachCell((cell) => {
      cell.font = { bold: true };
      cell.alignment = {
        vertical: "middle",
        horizontal: "center",
        wrapText: true,
      };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" },
      };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
  });

  let rowIndex = 3;
  let lastSektor = "",
    lastSubsektor = "",
    lastSarana = "";
  let subsektorCounter = 1;

  for (const item of dataArray) {
    const sektor = item.sektor;
    const subsektor = item.subsektor;
    const sarana = item.sarana;
    const prasaranaItems = item.prasaranaItems || [];

    if (sektor !== lastSektor) {
      const row = sheet.getRow(rowIndex);
      row.getCell(1).value = sektor;
      row.getCell(1).font = { bold: true };
      row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };

      for (let col = 1; col <= headerRow.length; col++) {
        const cell = row.getCell(col);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "CCFFCC" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      }

      rowIndex++;
      lastSektor = sektor;
      lastSubsektor = "";
      lastSarana = "";
    }

    if (subsektor !== lastSubsektor) {
      const row = sheet.getRow(rowIndex);
      row.getCell(1).value = `${subsektorCounter}. ${subsektor}`;
      row.getCell(1).font = { bold: true };
      row.getCell(1).alignment = { vertical: "middle", horizontal: "left" };

      for (let col = 1; col <= headerRow.length; col++) {
        const cell = row.getCell(col);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FFFF99" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      }

      rowIndex++;
      lastSubsektor = subsektor;
      lastSarana = "";
      subsektorCounter++;
    }

    if (sarana !== lastSarana) {
      const row = sheet.getRow(rowIndex);
      row.getCell(2).value = sarana;
      row.getCell(2).font = { bold: true };
      row.getCell(2).alignment = { vertical: "middle", horizontal: "left" };

      for (let col = 2; col <= headerRow.length; col++) {
        const cell = row.getCell(col);
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "D9D9D9" },
        };
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      }

      rowIndex++;
      lastSarana = sarana;
    }

    // Handle each prasarana item
    for (const prasaranaItem of prasaranaItems) {
      const row = sheet.getRow(rowIndex);

      const koordinat =
        prasaranaItem.latitude && prasaranaItem.longitude
          ? `${prasaranaItem.latitude}, ${prasaranaItem.longitude}`
          : "-";

      const rowData = [
        "", // Empty for sektor/subsektor
        prasaranaItem.prasarana || "",
        prasaranaItem.lokasi || "",
        prasaranaItem.dataKerusakan?.berat || "-",
        prasaranaItem.dataKerusakan?.sedang || "-",
        prasaranaItem.dataKerusakan?.ringan || "-",
        prasaranaItem.satuan || "-",
        prasaranaItem.luasRataRata || "-",
        toNumber(prasaranaItem.hargaSatuan) || "-",
        prasaranaItem.nilaiKerusakanKategori?.berat || "-",
        prasaranaItem.nilaiKerusakanKategori?.sedang || "-",
        prasaranaItem.nilaiKerusakanKategori?.ringan || "-",
        prasaranaItem.perkiraanKerusakan || "-",
        prasaranaItem.perkiraanKerugian || "-",
        prasaranaItem.totalKerusakanDanKerugian || "-",
        prasaranaItem.keterangan || "",
        prasaranaItem.kodeBarang || "-",
        koordinat,
      ];

      row.values = rowData;

      // Format numbers and alignment
      row.eachCell((cell, colNumber) => {
        // Format numeric columns
        if ([4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 15].includes(colNumber)) {
          if (typeof cell.value === "number") {
            cell.numFmt = "#,##0";
          }
        }

        // Set alignment
        if ([1, 2, 3, 17].includes(colNumber)) {
          cell.alignment = { vertical: "middle", horizontal: "left" };
        } else if (colNumber >= 4 && colNumber <= 15) {
          cell.alignment = { vertical: "middle", horizontal: "right" };
        } else {
          cell.alignment = { vertical: "middle", horizontal: "center" };
        }

        // Add borders
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
      });

      rowIndex++;
    }
  }

  // Auto-width with minimum width of 10
  sheet.columns.forEach((column) => {
    let maxLength = 10;
    column.eachCell?.({ includeEmpty: true }, (cell) => {
      const columnLength = cell.value ? cell.value.toString().length : 0;
      if (columnLength > maxLength) {
        maxLength = columnLength;
      }
    });
    column.width = Math.min(Math.max(maxLength, 10), 30);
  });

  // Freeze header rows
  sheet.views = [
    {
      state: "frozen",
      ySplit: 2, // Freeze first two rows
    },
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const filename = `${title}.xlsx`;
  saveAs(blob, filename);
}
