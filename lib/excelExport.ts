import * as XLSX from "xlsx-js-style";

// Plain "xlsx" (SheetJS Community Edition) cannot write cell styles (borders,
// fills) — only "xlsx-js-style" (drop-in fork, same API) supports it, which
// is why every export route imports XLSX from here instead of "xlsx".
export { XLSX };

const BORDER_COLOR = "D1D5DB";
const HEADER_FILL = "111111";
const HEADER_FONT_COLOR = "FFFFFF";

const thinBorder = { style: "thin", color: { rgb: BORDER_COLOR } } as const;

const cellBorder = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder,
};

const headerStyle = {
  font: { bold: true, color: { rgb: HEADER_FONT_COLOR } },
  fill: { fgColor: { rgb: HEADER_FILL } },
  alignment: { vertical: "center", horizontal: "center", wrapText: true },
  border: cellBorder,
};

const bodyStyle = {
  alignment: { vertical: "center" },
  border: cellBorder,
};

/**
 * Converts an array of flat objects into a worksheet with a bold/filled
 * header row, thin borders on every cell, and column widths sized to their
 * content — the shared visual standard for every admin XLSX export.
 */
export function buildStyledSheet(rows: Record<string, unknown>[]) {
  const ws = XLSX.utils.json_to_sheet(rows);
  if (rows.length === 0) return ws;

  const range = XLSX.utils.decode_range(ws["!ref"] || "A1:A1");

  for (let r = range.s.r; r <= range.e.r; r++) {
    for (let c = range.s.c; c <= range.e.c; c++) {
      const address = XLSX.utils.encode_cell({ r, c });
      const cell = ws[address];
      if (!cell) continue;
      cell.s = r === 0 ? headerStyle : bodyStyle;
    }
  }

  const headers = Object.keys(rows[0]);
  ws["!cols"] = headers.map((key) => {
    const maxLen = rows.reduce(
      (max, row) => Math.max(max, String(row[key] ?? "").length),
      key.length,
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 45) };
  });

  ws["!rows"] = [{ hpt: 22 }];

  return ws;
}
