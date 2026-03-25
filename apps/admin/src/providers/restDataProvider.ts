import type { DataProvider } from '@refinedev/core';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4321';
console.log('🔵 API_URL:', API_URL);

async function apiFetch(path: string, options?: RequestInit) {
    const res = await fetch(`${API_URL}${path}`, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
    });

    const json = await res.json();

    if (!res.ok) {
        throw new Error(json?.error ?? `Erreur ${res.status}`);
    }

    return json;
}

function normalizeRecord(record: any): any {
    if (!record) return record;
    return {
        ...record,
        // Journalists
        photoUrl:      record.photo_url      ?? record.photoUrl,
        yearOfDeath:   record.year_of_death  ?? record.yearOfDeath,
        countryId:     record.country_id     ?? record.countryId,
        countryName:   record.country_name   ?? record.countryName,
        placeOfDeath:  record.place_of_death ?? record.placeOfDeath,
        isPublished:   record.is_published !== undefined
            ? Boolean(record.is_published)
            : record.isPublished,
        // Countries
        riskLevel:     record.risk_level     ?? record.riskLevel,
        coords: record.coords ?? {
            lat: record.lat ? Number(record.lat) : undefined,
            lng: record.lng ? Number(record.lng) : undefined,
        },
        createdAt: record.created_at ?? record.createdAt,
        updatedAt: record.updated_at ?? record.updatedAt,
    };
}

function preparePayload(variables: any): any {
    return {
        ...variables,
        photo_url:      variables.photoUrl      ?? variables.photo_url,
        year_of_death:  variables.yearOfDeath   ?? variables.year_of_death,
        country_id:     variables.countryId     ?? variables.country_id,
        country_name:   variables.countryName   ?? variables.country_name,
        place_of_death: variables.placeOfDeath  ?? variables.place_of_death,
        is_published:   variables.isPublished   ?? variables.is_published,
        risk_level:     variables.riskLevel     ?? variables.risk_level,
        // Aplatir coords pour l'API
        lat: variables.coords?.lat ?? variables.lat,
        lng: variables.coords?.lng ?? variables.lng,
    };
}

export const restDataProvider: DataProvider = {

    // ------------------------------------------
    // GET LIST — /api/{resource}
    // ------------------------------------------
    getList: async ({ resource, pagination, sorters, filters }) => {
        const json = await apiFetch(`/api/${resource}`);
        let data: any[] = (json.data ?? []).map(normalizeRecord);

        // Filtrage côté client (recherche dans list.tsx)
        if (filters && filters.length > 0) {
            filters.forEach((filter: any) => {
                if (filter.operator === 'contains' && filter.value) {
                    const term = filter.value.toLowerCase();
                    data = data.filter((item) =>
                        String(item[filter.field] ?? '').toLowerCase().includes(term)
                    );
                }
            });
        }

        // Tri côté client
        if (sorters && sorters.length > 0) {
            const sorter = sorters[0];
            data.sort((a, b) => {
                const aVal = a[sorter.field] ?? '';
                const bVal = b[sorter.field] ?? '';
                const cmp  = String(aVal).localeCompare(String(bVal));
                return sorter.order === 'desc' ? -cmp : cmp;
            });
        }

        return {
            data,
            total: data.length,
        };
    },

    // ------------------------------------------
    // GET ONE — /api/{resource}/{id}
    // ------------------------------------------
    getOne: async ({ resource, id }) => {
        const json = await apiFetch(`/api/${resource}/${id}`);
        return {
            data: normalizeRecord(json.data),
        };
    },

    // ------------------------------------------
    // CREATE — POST /api/{resource}
    // ------------------------------------------
    create: async ({ resource, variables }) => {
        const json = await apiFetch(`/api/${resource}`, {
            method: 'POST',
            body:   JSON.stringify(preparePayload(variables)),
        });
        return {
            data: normalizeRecord(json.data),
        };
    },

    // ------------------------------------------
    // UPDATE — PUT /api/{resource}/{id}
    // ------------------------------------------
    update: async ({ resource, id, variables }) => {
        const json = await apiFetch(`/api/${resource}/${id}`, {
            method: 'PUT',
            body:   JSON.stringify(preparePayload(variables)),
        });
        return {
            data: normalizeRecord(json.data),
        };
    },

    // ------------------------------------------
    // DELETE — DELETE /api/{resource}/{id}
    // ------------------------------------------
    deleteOne: async ({ resource, id }) => {
        await apiFetch(`/api/${resource}/${id}`, {
            method: 'DELETE',
        });
        return {
            data: { id } as any,
        };
    },

    // ------------------------------------------
    // GET API URL (requis par Refine)
    // ------------------------------------------
    getApiUrl: () => API_URL,
};