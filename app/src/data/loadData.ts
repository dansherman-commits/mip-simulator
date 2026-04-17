/**
 * Generic CSV loader with header validation.
 *
 * Files in data/ are served at root by Vite (publicDir = "../data"),
 * so data/config.csv is fetched as /config.csv.
 */

export interface CsvRow {
  [column: string]: string;
}

export async function loadCsv(
  path: string,
  requiredColumns?: string[]
): Promise<CsvRow[]> {
  const res = await fetch(`/${path}`);
  if (!res.ok) throw new Error(`Failed to load ${path}: ${res.status}`);
  const text = await res.text();
  const lines = text.trim().split("\n");
  if (lines.length === 0) throw new Error(`${path} is empty`);

  const header = lines[0].split(",").map((h) => h.trim());

  // Fail-fast: validate required columns
  if (requiredColumns) {
    for (const col of requiredColumns) {
      if (!header.includes(col)) {
        throw new Error(`${path}: missing required column "${col}"`);
      }
    }
  }

  return lines.slice(1).map((line) => {
    const values = line.split(",");
    const row: CsvRow = {};
    header.forEach((col, i) => {
      row[col] = values[i]?.trim() ?? "";
    });
    return row;
  });
}

export async function loadConfig(): Promise<Map<string, string>> {
  const rows = await loadCsv("config.csv", ["key", "value"]);
  return new Map(rows.map((r) => [r.key, r.value]));
}

export interface ProjectData {
  name: string;
  dev_cost_per_month: number;
  time_to_market: number;
  roas: number;
}

export async function loadProjects(): Promise<ProjectData[]> {
  const rows = await loadCsv("projects.csv", ["name", "dev_cost_per_month", "time_to_market", "roas"]);
  return rows.map((r) => ({
    name: r.name,
    dev_cost_per_month: parseFloat(r.dev_cost_per_month),
    time_to_market: parseInt(r.time_to_market, 10),
    roas: parseFloat(r.roas),
  }));
}
