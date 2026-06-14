import { authService } from '@/services/auth.service';

const api = () => authService.getApi();

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PumpProfile {
    id: number;
    name: string;
    org_name: string | null;
    logo_url: string | null;
    address: string;
    city: string | null;
    state: string | null;
    pincode: string | null;
    gst: string | null;
    license: string | null;
    contact_number: string | null;
    opening_time: string | null;
    closing_time: string | null;
    fuel_types: string | null;
    tanks_count: number;
    nozzles_count: number;
    daily_capacity: number;
    status: string;
    is_active: boolean;
    created_at: string;
}

export interface PumpSummary {
    id: number;
    name: string;
    org_name: string | null;
    logo_url: string | null;
    city: string | null;
    state: string | null;
    status: string;
    address: string;
    gst: string | null;
    tanks_count: number;
    nozzles_count: number;
}

// ─── Profile ──────────────────────────────────────────────────────────────────

export const fetchPumpProfile = async (pumpId: number): Promise<PumpProfile> => {
    const r = await api().get(`/settings/profile?pump_id=${pumpId}`);
    return r.data;
};

export const updatePumpProfile = async (pumpId: number, payload: {
    org_name?: string;
    address?: string;
    opening_time?: string;
    closing_time?: string;
    pincode?: string;
    contact_number?: string;
}) => {
    const r = await api().put(`/settings/profile?pump_id=${pumpId}`, payload);
    return r.data;
};

// ─── Logo ─────────────────────────────────────────────────────────────────────

export const uploadPumpLogo = async (pumpId: number, file: File): Promise<{ logo_url: string }> => {
    const formData = new FormData();
    formData.append('file', file);

    const r = await api().post(`/settings/logo?pump_id=${pumpId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return r.data;
};

export const deletePumpLogo = async (pumpId: number) => {
    const r = await api().delete(`/settings/logo?pump_id=${pumpId}`);
    return r.data;
};

// ─── Franchise — all pumps ────────────────────────────────────────────────────

export const fetchAllMyPumps = async (): Promise<PumpSummary[]> => {
    const r = await api().get('/settings/pumps');
    return r.data;
};

// ─── Logo URL helper ──────────────────────────────────────────────────────────

export const getLogoUrl = (logoUrl: string | null): string | null => {
    if (!logoUrl) return null;
    if (logoUrl.startsWith('http')) return logoUrl;

    const serverBase = BASE_URL.replace('/api/v1', '');
    // /api/v1 prefix nahi chahiye — static files direct serve hoti hain
    return `${serverBase}${logoUrl}`;  // e.g. http://localhost:8000/uploads/logos/pump_11_xxx.svg
};

// ─── Logo as base64 for print ─────────────────────────────────────────────────

export const getLogoBase64ForPrint = async (logoUrl: string | null): Promise<string> => {
    if (!logoUrl) return '';
    try {
        const fullUrl = getLogoUrl(logoUrl) || '';
        const res = await fetch(fullUrl);
        const blob = await res.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => resolve('');
            reader.readAsDataURL(blob);
        });
    } catch {
        return '';
    }
};