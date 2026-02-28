package com.equipment.dto;

import com.equipment.model.MaintenanceLog;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
public class MaintenanceLogDTO {
    private Long id;
    private Long equipmentId;
    private LocalDate maintenanceDate;
    private String notes;
    private String performedBy;
    private OffsetDateTime createdAt;

    public static MaintenanceLogDTO from(MaintenanceLog log) {
        MaintenanceLogDTO dto = new MaintenanceLogDTO();
        dto.setId(log.getId());
        dto.setEquipmentId(log.getEquipment().getId());
        dto.setMaintenanceDate(log.getMaintenanceDate());
        dto.setNotes(log.getNotes());
        dto.setPerformedBy(log.getPerformedBy());
        dto.setCreatedAt(log.getCreatedAt());
        return dto;
    }
}
