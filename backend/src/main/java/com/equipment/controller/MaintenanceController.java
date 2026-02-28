package com.equipment.controller;

import com.equipment.dto.MaintenanceLogDTO;
import com.equipment.dto.MaintenanceRequest;
import com.equipment.service.MaintenanceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    /** POST /api/maintenance — log a maintenance event */
    @PostMapping("/api/maintenance")
    public ResponseEntity<MaintenanceLogDTO> addLog(
            @Valid @RequestBody MaintenanceRequest req) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(maintenanceService.addLog(req));
    }

    /**
     * GET /api/equipment/{id}/maintenance — get maintenance history for an
     * equipment
     */
    @GetMapping("/api/equipment/{id}/maintenance")
    public ResponseEntity<List<MaintenanceLogDTO>> getLogs(@PathVariable Long id) {
        return ResponseEntity.ok(maintenanceService.getLogsForEquipment(id));
    }
}
