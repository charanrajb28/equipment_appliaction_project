// Core domain types

export type EquipmentStatus = "Active" | "Inactive" | "Under Maintenance";

export interface EquipmentType {
    id: number;
    name: string;
}

export interface Equipment {
    id: number;
    name: string;
    typeId: number;
    typeName: string;
    status: EquipmentStatus;
    lastCleanedDate: string; // ISO date string yyyy-MM-dd
    createdAt: string;
    updatedAt: string;
}

export interface MaintenanceLog {
    id: number;
    equipmentId: number;
    maintenanceDate: string;
    notes: string;
    performedBy: string;
    createdAt: string;
}

export interface EquipmentRequest {
    name: string;
    typeId: number;
    status: EquipmentStatus;
    lastCleanedDate: string;
}

export interface MaintenanceRequest {
    equipmentId: number;
    maintenanceDate: string;
    notes: string;
    performedBy: string;
}

export interface ApiError {
    error: string;
    status: number;
}

export type HealthScore = "Excellent" | "Good" | "Fair" | "Overdue";
