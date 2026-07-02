import type { MatchStatus, TableStatus } from "@prisma/client";

export type AvailabilitySummary = {
  totalTables: number;
  availableTables: number;
  status: MatchStatus;
};

const LIMITED_THRESHOLD = 0.2; // <=20% tables left is "LIMITED"

export function computeAvailability(
  tables: { status: TableStatus }[],
): AvailabilitySummary {
  const totalTables = tables.length;
  const availableTables = tables.filter((t) => t.status === "AVAILABLE").length;

  let status: MatchStatus = "BOOK";
  if (totalTables > 0) {
    if (availableTables === 0) {
      status = "FULL_BOOKED";
    } else if (availableTables / totalTables <= LIMITED_THRESHOLD) {
      status = "LIMITED";
    }
  }

  return { totalTables, availableTables, status };
}
