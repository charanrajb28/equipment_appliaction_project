package com.equipment.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Data
public class MaintenanceRequest {

    @NotNull(message = "Equipment ID is required")
    private Long equipmentId;

    @NotNull(message = "Maintenance date is required")
    private LocalDate maintenanceDate;

    private String notes;

    @NotBlank(message = "Performed by is required")
    @Size(min = 2, max = 200, message = "Performed by must be between 2 and 200 characters")
    private String performedBy;
}
