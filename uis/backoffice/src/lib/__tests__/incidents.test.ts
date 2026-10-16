import { apiFetch } from "@/lib/auth";

import { getIncidents, IncidentApiError } from "../incidents";

jest.mock("@/lib/auth", () => ({ apiFetch: jest.fn() }));

const apiFetchMock = jest.mocked(apiFetch);

function response(payload: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(payload),
  } as unknown as Response;
}

describe("incident API helpers", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("gets incidents and serializes non-empty filters", async () => {
    const incidents = [{ id: 12, title: "Delayed package" }];
    apiFetchMock.mockResolvedValue(response(incidents));

    await expect(getIncidents({ status: "open", category: "" })).resolves.toEqual(incidents);

    expect(apiFetchMock).toHaveBeenCalledWith("/backend/api/incidents?status=open", undefined);
  });

  it("uses the collection path when all filters are empty", async () => {
    apiFetchMock.mockResolvedValue(response([]));

    await expect(getIncidents({ status: "", branch: "" })).resolves.toEqual([]);

    expect(apiFetchMock).toHaveBeenCalledWith("/backend/api/incidents", undefined);
  });

  it("converts API and connection failures into IncidentApiError", async () => {
    apiFetchMock.mockResolvedValue(response({ message: "Invalid status", field: "status" }, 400));

    const apiError = await getIncidents({ status: "unknown" }).catch((error: unknown) => error);
    expect(apiError).toBeInstanceOf(IncidentApiError);
    expect(apiError).toHaveProperty("message", "Invalid status");
    expect(apiError).toHaveProperty("field", "status");

    apiFetchMock.mockRejectedValue(new Error("offline"));
    await expect(getIncidents({})).rejects.toBeInstanceOf(IncidentApiError);
    await expect(getIncidents({})).rejects.toThrow("No se pudo conectar con el servidor");
  });
});