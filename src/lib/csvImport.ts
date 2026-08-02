export function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuote = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuote && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuote = !inQuote;
      continue;
    }

    if (char === "," && !inQuote) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return cells;
}

export function parseCsvText(text: string, fallbackHeaders: string[] = []) {
  const lines = text
    .replace(/^\uFEFF/, "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!lines.length) {
    return { headers: fallbackHeaders, rows: [] as Record<string, string>[] };
  }

  const firstLine = parseCsvLine(lines[0]).map((item) => item.trim());
  const hasHeader = fallbackHeaders.some((header) => firstLine.includes(header));
  const headers = hasHeader ? firstLine : fallbackHeaders;
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const rows = dataLines.map((line) => {
    const cells = parseCsvLine(line);
    return headers.reduce<Record<string, string>>((obj, key, index) => {
      obj[key] = cells[index] ?? "";
      return obj;
    }, {});
  });

  return { headers, rows };
}
