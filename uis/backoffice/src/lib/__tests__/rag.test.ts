import { apiFetch } from "@/lib/auth";
import { queryRAG } from "@/lib/rag";

jest.mock("@/lib/auth", () => ({ apiFetch: jest.fn() }));

const mockedApiFetch = jest.mocked(apiFetch);

describe("queryRAG", () => {
  beforeEach(() => mockedApiFetch.mockReset());

  it("sends an authenticated API request and returns its answer and sources", async () => {
    const result = {
      answer: "El plazo es de 3 a 5 días hábiles.",
      sources: [{ source_document: "sla-delivery", section: "SLA de Entrega" }],
      retrieved_count: 1,
      abstained: false,
    };
    mockedApiFetch.mockResolvedValue({
      ok: true,
      json: async () => result,
    } as Response);

    await expect(queryRAG("¿Cuál es el SLA estándar?")).resolves.toEqual(result);
    expect(mockedApiFetch).toHaveBeenCalledWith("/backend/api/rag/query", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: "¿Cuál es el SLA estándar?" }),
    });
  });

  it("surfaces API errors", async () => {
    mockedApiFetch.mockResolvedValue({
      ok: false,
      json: async () => ({ detail: "El servicio RAG no está disponible." }),
    } as Response);

    await expect(queryRAG("Consulta")).rejects.toThrow("El servicio RAG no está disponible.");
  });
});