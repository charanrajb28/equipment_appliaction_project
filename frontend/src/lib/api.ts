import axios from "axios";
import type {
    Equipment,
    EquipmentRequest,
    EquipmentType,
    MaintenanceLog,
    MaintenanceRequest,
} from "./types";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080",
    headers: { "Content-Type": "application/json" },
});

// Normalize errors to a clean message string
api.interceptors.response.use(
    (res) => res,
    (err) => {
        const message =
            err.response?.data?.error ||
            err.response?.data?.message ||
            "An unexpected error occurred";
        return Promise.reject(new Error(message));
    }
);

// --- Equipment ---
export const getEquipment = (): Promise<Equipment[]> =>
    api.get("/api/equipment").then((r) => r.data);

export const createEquipment = (data: EquipmentRequest): Promise<Equipment> =>
    api.post("/api/equipment", data).then((r) => r.data);

export const updateEquipment = (
    id: number,
    data: EquipmentRequest
): Promise<Equipment> =>
    api.put(`/api/equipment/${id}`, data).then((r) => r.data);

export const deleteEquipment = (id: number): Promise<void> =>
    api.delete(`/api/equipment/${id}`).then(() => undefined);

// --- Equipment Types ---
export const getEquipmentTypes = (): Promise<EquipmentType[]> =>
    api.get("/api/equipment-types").then((r) => r.data);

// --- Maintenance ---
export const addMaintenance = (
    data: MaintenanceRequest
): Promise<MaintenanceLog> =>
    api.post("/api/maintenance", data).then((r) => r.data);

export const getMaintenanceLogs = (
    equipmentId: number
): Promise<MaintenanceLog[]> =>
    api.get(`/api/equipment/${equipmentId}/maintenance`).then((r) => r.data);
