import { TableType } from "@prisma/client";

function generateRange(
  prefix: string,
  start: number,
  end: number,
  capacity: number,
  tableType: TableType,
) {
  const tables = [];
  for (let i = start; i <= end; i++) {
    tables.push({ tableCode: `${prefix}${i}`, capacity, tableType });
  }
  return tables;
}

export function buildLudoTableLayout() {
  // VVIP: Vvip 1-3 (11 pax), Vvip 4-9 & Vvip 29 (9 pax)
  const vvip1 = generateRange("Vvip ", 1, 3, 11, "VVIP");
  const vvip2 = generateRange("Vvip ", 4, 9, 9, "VVIP");
  const vvip3 = [{ tableCode: "Vvip 29", capacity: 9, tableType: "VVIP" as TableType }];

  // VIP: Vip 12-15 (6 pax)
  const vip1 = generateRange("Vip ", 12, 15, 6, "VIP");

  // Reguler Indoor (4 pax): Table 10,11,16,17,18,19,20,21,22,23,24,25,26
  const regIndoorNumbers = [10, 11, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
  const regIndoor = regIndoorNumbers.map((n) => ({
    tableCode: `Table ${n}`,
    capacity: 4,
    tableType: "REGULAR_INDOOR" as TableType,
  }));

  // Barstool (1 pax): B1-B7
  const barstools = Array.from({ length: 7 }, (_, i) => ({
    tableCode: `B${i + 1}`,
    capacity: 1,
    tableType: "BARSTOOL" as TableType,
  }));

  // Reguler Outdoor / Semi Outdoor 2 pax: Table 32-35 (own category, distinct
  // from the 4 pax REGULAR_SEMI_OUTDOOR tables below, so packages can be
  // filtered cleanly by table type instead of guessing off capacity).
  const regOutdoor2 = generateRange("Table ", 32, 35, 2, "REGULAR_SEMI_OUTDOOR_2P");

  // Reguler Outdoor 4 pax: Table 31, 36-46
  const regOutdoor4 = [
    { tableCode: "Table 31", capacity: 4, tableType: "REGULAR_SEMI_OUTDOOR" as TableType },
    ...generateRange("Table ", 36, 46, 4, "REGULAR_SEMI_OUTDOOR"),
  ];

  return [
    ...vvip1,
    ...vvip2,
    ...vvip3,
    ...vip1,
    ...regIndoor,
    ...barstools,
    ...regOutdoor2,
    ...regOutdoor4,
  ];
}
