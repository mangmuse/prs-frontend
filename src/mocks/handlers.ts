import { HttpResponse, http } from "msw";

import type { CreateDatasetRequest, CreateRowsRequest, DatasetRow } from "@/types/dataset";

const generateGuestId = () => crypto.randomUUID();
const guestSessions = new Map<string, { guest_id: string; created_at: string }>();

const mockDatasets = new Map<
  number,
  { id: number; name: string; description?: string; created_at: string }
>();
const mockRows = new Map<number, DatasetRow[]>();
let datasetIdCounter = 1;
let rowIdCounter = 1;

export const handlers = [
  http.get("http://localhost:8000/health", () => {
    return HttpResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
    });
  }),

  http.post("http://localhost:8000/auth/guest", ({ cookies }) => {
    const existingGuestId = cookies.guest_id;

    if (existingGuestId && guestSessions.has(existingGuestId)) {
      return HttpResponse.json(guestSessions.get(existingGuestId));
    }

    const newGuestId = generateGuestId();
    const newSession = {
      guest_id: newGuestId,
      created_at: new Date().toISOString(),
    };

    guestSessions.set(newGuestId, newSession);

    return HttpResponse.json(newSession, {
      headers: {
        "Set-Cookie": `guest_id=${newGuestId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000`,
      },
    });
  }),

  http.get("http://localhost:8000/datasets", () => {
    const datasets = Array.from(mockDatasets.values()).map((d) => ({
      ...d,
      row_count: mockRows.get(d.id)?.length || 0,
    }));
    return HttpResponse.json(datasets);
  }),

  http.post("http://localhost:8000/datasets", async ({ request }) => {
    const body = (await request.json()) as CreateDatasetRequest;
    const newDataset = {
      id: datasetIdCounter++,
      name: body.name,
      description: body.description,
      created_at: new Date().toISOString(),
    };
    mockDatasets.set(newDataset.id, newDataset);
    mockRows.set(newDataset.id, []);
    return HttpResponse.json(newDataset, { status: 201 });
  }),

  http.get("http://localhost:8000/datasets/:id", ({ params, request }) => {
    const id = Number(params.id);
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page")) || 1;
    const limit = Number(url.searchParams.get("limit")) || 50;

    const dataset = mockDatasets.get(id);
    if (!dataset) {
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    }

    const rows = mockRows.get(id) || [];
    const start = (page - 1) * limit;
    const paginatedRows = rows.slice(start, start + limit);

    return HttpResponse.json({
      id: dataset.id,
      name: dataset.name,
      rows: paginatedRows,
      pagination: {
        page,
        limit,
        total_count: rows.length,
        total_pages: Math.ceil(rows.length / limit) || 1,
      },
    });
  }),

  http.post("http://localhost:8000/datasets/:id/rows", async ({ params, request }) => {
    const id = Number(params.id);
    const body = (await request.json()) as CreateRowsRequest[];

    if (!mockDatasets.has(id)) {
      return HttpResponse.json({ error: "Not found" }, { status: 404 });
    }

    const existingRows = mockRows.get(id) || [];
    const newRows: DatasetRow[] = body.map((row) => ({
      id: rowIdCounter++,
      dataset_id: id,
      input_data: row.input_data,
      expected_output: row.expected_output,
      row_constraints: row.row_constraints || [],
      tags: row.tags || [],
    }));

    mockRows.set(id, [...existingRows, ...newRows]);
    return HttpResponse.json({ created_count: newRows.length }, { status: 201 });
  }),
];
