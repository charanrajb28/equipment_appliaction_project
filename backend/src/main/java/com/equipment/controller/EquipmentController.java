package com.equipment.controller;

import com.equipment.dto.EquipmentDTO;
import com.equipment.dto.EquipmentRequest;
import com.equipment.service.EquipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/equipment")
@RequiredArgsConstructor
public class EquipmentController {

    private final EquipmentService equipmentService;

    /** GET /api/equipment — list all equipment */
    @GetMapping
    public ResponseEntity<List<EquipmentDTO>> getAll() {
        return ResponseEntity.ok(equipmentService.getAll());
    }

    /** POST /api/equipment — create new equipment */
    @PostMapping
    public ResponseEntity<EquipmentDTO> create(@Valid @RequestBody EquipmentRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED).body(equipmentService.create(req));
    }

    /** PUT /api/equipment/{id} — update existing equipment */
    @PutMapping("/{id}")
    public ResponseEntity<EquipmentDTO> update(
            @PathVariable Long id,
            @Valid @RequestBody EquipmentRequest req) {
        return ResponseEntity.ok(equipmentService.update(id, req));
    }

    /** DELETE /api/equipment/{id} — delete equipment (cascades maintenance logs) */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        equipmentService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
