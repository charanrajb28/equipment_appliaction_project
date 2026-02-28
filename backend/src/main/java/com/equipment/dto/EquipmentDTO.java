package com.equipment.dto;

import com.equipment.model.Equipment;
import lombok.Data;

import java.time.LocalDate;
import java.time.OffsetDateTime;

@Data
public class EquipmentDTO {
    private Long id;
    private String name;
    private Long typeId;
    private String typeName;
    private String status;
    private LocalDate lastCleanedDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

    public static EquipmentDTO from(Equipment e) {
        EquipmentDTO dto = new EquipmentDTO();
        dto.setId(e.getId());
        dto.setName(e.getName());
        dto.setTypeId(e.getType().getId());
        dto.setTypeName(e.getType().getName());
        dto.setStatus(e.getStatus());
        dto.setLastCleanedDate(e.getLastCleanedDate());
        dto.setCreatedAt(e.getCreatedAt());
        dto.setUpdatedAt(e.getUpdatedAt());
        return dto;
    }
}
