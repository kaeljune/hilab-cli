import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	fetchHiConfig,
	fetchHiConfigSchema,
	fetchHiConfigScope,
	saveHiConfig,
	updateCkConfigField,
} from "../hi-config-api";

describe("hi-config-api web mode", () => {
	const fetchMock = vi.fn();

	beforeEach(() => {
		vi.resetAllMocks();
		vi.stubGlobal("fetch", fetchMock);
	});

	it("fetchHiConfig calls GET /api/hi-config without projectId", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				config: { privacyBlock: false },
				sources: { privacyBlock: "global" },
				globalPath: "/Users/test/.claude/.hi.json",
				projectPath: null,
			}),
		});

		const result = await fetchHiConfig();

		expect(fetchMock).toHaveBeenCalledWith("/api/hi-config");
		expect(result.config).toEqual({ privacyBlock: false });
		expect(result.projectPath).toBeNull();
	});

	it("fetchHiConfig calls GET /api/hi-config?projectId= when projectId is provided", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				config: { privacyBlock: true },
				sources: { privacyBlock: "project" },
				globalPath: "/Users/test/.claude/.hi.json",
				projectPath: "/tmp/proj/.claude/.hi.json",
			}),
		});

		const result = await fetchHiConfig("project-alpha");

		expect(fetchMock).toHaveBeenCalledWith("/api/hi-config?projectId=project-alpha");
		expect(result.projectPath).toBe("/tmp/proj/.claude/.hi.json");
	});

	it("fetchHiConfig throws on non-ok response", async () => {
		fetchMock.mockResolvedValueOnce({ ok: false, status: 500 });

		await expect(fetchHiConfig()).rejects.toThrow("Failed to fetch hi-config: 500");
	});

	it("fetchHiConfigScope passes scope param to GET /api/hi-config", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				config: {},
				sources: {},
				globalPath: "/Users/test/.claude/.hi.json",
				projectPath: null,
			}),
		});

		await fetchHiConfigScope("global");

		expect(fetchMock).toHaveBeenCalledWith("/api/hi-config?scope=global");
	});

	it("fetchHiConfigScope includes projectId when provided", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				config: {},
				sources: {},
				globalPath: "",
				projectPath: "/tmp/proj/.claude/.hi.json",
			}),
		});

		await fetchHiConfigScope("project", "project-alpha");

		expect(fetchMock).toHaveBeenCalledWith("/api/hi-config?scope=project&projectId=project-alpha");
	});

	it("saveHiConfig sends PUT /api/hi-config with request body", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: async () => ({
				success: true,
				path: "/Users/test/.claude/.hi.json",
				scope: "global",
				config: { privacyBlock: false },
			}),
		});

		const result = await saveHiConfig({
			scope: "global",
			config: { privacyBlock: false },
		});

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/hi-config",
			expect.objectContaining({
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ scope: "global", config: { privacyBlock: false } }),
			}),
		);
		expect(result.success).toBe(true);
	});

	it("saveHiConfig throws with server error message on failure", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 400,
			json: async () => ({ error: "Validation failed" }),
		});

		await expect(saveHiConfig({ scope: "global", config: { invalid: true } })).rejects.toThrow(
			"Validation failed",
		);
	});

	it("fetchHiConfigSchema calls GET /api/hi-config/schema", async () => {
		const schema = { $id: "hi-config", properties: { privacyBlock: { type: "boolean" } } };
		fetchMock.mockResolvedValueOnce({
			ok: true,
			json: async () => schema,
		});

		const result = await fetchHiConfigSchema();

		expect(fetchMock).toHaveBeenCalledWith("/api/hi-config/schema");
		expect(result).toHaveProperty("$id");
		expect(result).toHaveProperty("properties");
	});

	it("updateCkConfigField sends PATCH /api/hi-config/field", async () => {
		fetchMock.mockResolvedValueOnce({ ok: true });

		await updateCkConfigField("privacyBlock", false, "global");

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/hi-config/field",
			expect.objectContaining({
				method: "PATCH",
				body: JSON.stringify({
					scope: "global",
					projectId: undefined,
					fieldPath: "privacyBlock",
					value: false,
				}),
			}),
		);
	});

	it("updateCkConfigField throws with server error on failure", async () => {
		fetchMock.mockResolvedValueOnce({
			ok: false,
			status: 422,
			json: async () => ({ error: "Invalid field path" }),
		});

		await expect(updateCkConfigField("nonexistent.field", "bad", "global")).rejects.toThrow(
			"Invalid field path",
		);
	});
});
