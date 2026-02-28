package com.equipment.service;

import com.equipment.dto.EquipmentDTO;
import com.equipment.dto.EquipmentRequest;
import com.equipment.exception.BusinessRuleException;
import com.equipment.exception.ResourceNotFoundException;
import com.equipment.model.Equipment;
import com.equipment.model.EquipmentType;
import com.equipment.repository.EquipmentRepository;
import com.equipment.repository.EquipmentTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class EquipmentService {

    private static final Set<String> VALID_STATUSES = Set.of("Active", "Inactive", "Under Maintenance");

    private final EquipmentRepository equipmentRepository;
    private final EquipmentTypeRepository equipmentTypeRepository;

    public List<EquipmentDTO> getAll() {
        return equipmentRepository.findAll()
                .stream()
                .map(EquipmentDTO::from)
                .toList();
    }

    @Transactional
    public EquipmentDTO create(EquipmentRequest req) {
        validateRequest(req);
        EquipmentType type = resolveType(req.getTypeId());
        Equipment equipment = new Equipment();
        equipment.setName(req.getName());
        equipment.setType(type);
        equipment.setStatus(req.getStatus());
        equipment.setLastCleanedDate(req.getLastCleanedDate());
        return EquipmentDTO.from(equipmentRepository.save(equipment));
    }

    @Transactional
    public EquipmentDTO update(Long id, EquipmentRequest req) {
        Equipment equipment = equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found with id: " + id));
        validateRequest(req);
        EquipmentType type = resolveType(req.getTypeId());
        equipment.setName(req.getName());
        equipment.setType(type);
        equipment.setStatus(req.getStatus());
        equipment.setLastCleanedDate(req.getLastCleanedDate());
        return EquipmentDTO.from(equipmentRepository.save(equipment));
    }

    @Transactional
    public void delete(Long id) {
        if (!equipmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Equipment not found with id: " + id);
        }
        equipmentRepository.deleteById(id);
    }

    // ----------------------------------------------------------------
    // Private helpers
    // ----------------------------------------------------------------

    private void validateRequest(EquipmentRequest req) {
        // Validate status value
        if (!VALID_STATUSES.contains(req.getStatus())) {
            throw new BusinessRuleException(
                    "Invalid status. Must be one of: Active, Inactive, Under Maintenance");
        }
        // Enforce 30-day rule at service layer (DB trigger is a safety net)
        if ("Active".equals(req.getStatus())
                && req.getLastCleanedDate() != null
                && req.getLastCleanedDate().isBefore(LocalDate.now().minusDays(30))) {
            throw new BusinessRuleException(
                    "Cannot set status to Active: last cleaned date is older than 30 days " +
                            "(last cleaned: " + req.getLastCleanedDate() + "). " +
                            "Please log a maintenance event first.");
        }
    }

    private EquipmentType resolveType(Long typeId) {
        return equipmentTypeRepository.findById(typeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Equipment type not found with id: " + typeId));
    }
}
