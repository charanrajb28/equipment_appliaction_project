package com.equipment.controller;

import com.equipment.model.EquipmentType;
import com.equipment.repository.EquipmentTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/equipment-types")
@RequiredArgsConstructor
public class EquipmentTypeController {

    private final EquipmentTypeRepository equipmentTypeRepository;

    /** GET /api/equipment-types — list all types (dynamic from DB) */
    @GetMapping
    public ResponseEntity<List<EquipmentType>> getAll() {
        return ResponseEntity.ok(equipmentTypeRepository.findAll());
    }
}
