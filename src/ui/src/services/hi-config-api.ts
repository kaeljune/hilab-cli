/**
 * CK Config API client - Fetches and saves full .hi.json configuration
 */

import type { ConfigSource } from "../components/schema-form";

const API_BASE = "/api";

export interface HiConfigResponse {
	config: Record<string, unknown>;
	sources: Record<string, ConfigSource>;
	globalPath: string;
	projectPath: string | null;
}

export interface HiConfigSaveRequest {
	scope: "global" | "project";
	projectId?: string;
	config: Record<string, unknown>;
}

export interface HiConfigSaveResponse {
	success: boolean;
	path: string;
	scope: string;
	config: Record<string, unknown>;
}

/**
 * Fetch full .hi.json config with source tracking
 */
export async function fetchHiConfig(projectId?: string): Promise<HiConfigResponse> {
	const url = projectId
		? `${API_BASE}/hi-config?projectId=${encodeURIComponent(projectId)}`
		: `${API_BASE}/hi-config`;

	const res = await fetch(url);
	if (!res.ok) {
		throw new Error(`Failed to fetch hi-config: ${res.status}`);
	}
	return res.json();
}

/**
 * Fetch config for a specific scope only (no merge)
 */
export async function fetchHiConfigScope(
	scope: "global" | "project",
	projectId?: string,
): Promise<HiConfigResponse> {
	const params = new URLSearchParams({ scope });
	if (projectId) {
		params.set("projectId", projectId);
	}

	const res = await fetch(`${API_BASE}/hi-config?${params}`);
	if (!res.ok) {
		throw new Error(`Failed to fetch hi-config: ${res.status}`);
	}
	return res.json();
}

/**
 * Save .hi.json config to specified scope
 */
export async function saveHiConfig(request: HiConfigSaveRequest): Promise<HiConfigSaveResponse> {
	const res = await fetch(`${API_BASE}/hi-config`, {
		method: "PUT",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(request),
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({ error: "Unknown error" }));
		throw new Error(error.error || `Failed to save hi-config: ${res.status}`);
	}

	return res.json();
}

/**
 * Fetch the JSON Schema for .hi.json
 */
export async function fetchHiConfigSchema(): Promise<Record<string, unknown>> {
	const res = await fetch(`${API_BASE}/hi-config/schema`);
	if (!res.ok) {
		throw new Error(`Failed to fetch schema: ${res.status}`);
	}
	return res.json();
}

/**
 * Update a single field at the specified scope
 */
export async function updateCkConfigField(
	fieldPath: string,
	value: unknown,
	scope: "global" | "project",
	projectId?: string,
): Promise<void> {
	const res = await fetch(`${API_BASE}/hi-config/field`, {
		method: "PATCH",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ scope, projectId, fieldPath, value }),
	});

	if (!res.ok) {
		const error = await res.json().catch(() => ({ error: "Unknown error" }));
		throw new Error(error.error || `Failed to update field: ${res.status}`);
	}
}
