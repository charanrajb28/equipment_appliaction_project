package com.equipment.dto;

import lombok.Data;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

@Data
public class EquipmentRequest {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 200, message = "Name must be between 2 and 200 characters")
    private String name;

    @NotNull(message = "Type ID is required")
    private Long typeId;

    @NotBlank(message = "Status is required")
    private String status;

    @NotNull(message = "Last cleaned date is required")
    private LocalDate lastCleanedDate;
}
