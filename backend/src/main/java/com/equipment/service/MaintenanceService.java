package com.equipment.service;

import com.equipment.dto.MaintenanceLogDTO;
import com.equipment.dto.MaintenanceRequest;
import com.equipment.exception.ResourceNotFoundException;
import com.equipment.model.Equipment;
import com.equipment.model.MaintenanceLog;
import com.equipment.repository.EquipmentRepository;
import com.equipment.repository.MaintenanceLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class MaintenanceService {

    private final MaintenanceLogRepository maintenanceLogRepository;
    private final EquipmentRepository equipmentRepository;

    /**
     * Persist a maintenance log.
     * The DB trigger (trg_maintenance_sync) automatically updates equipment
     * status → Active and last_cleaned_date → maintenanceDate after insert.
     * We also reload the equipment entity to reflect the triggered changes.
     */
    @Transactional
    public MaintenanceLogDTO addLog(MaintenanceRequest req) {
        Equipment equipment = equipmentRepository.findById(req.getEquipmentId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Equipment not found with id: " + req.getEquipmentId()));

        MaintenanceLog log = new MaintenanceLog();
        log.setEquipment(equipment);
        log.setMaintenanceDate(req.getMaintenanceDate());
        log.setNotes(req.getNotes() != null ? req.getNotes() : "");
        log.setPerformedBy(req.getPerformedBy());

        MaintenanceLog saved = maintenanceLogRepository.save(log);

        // The trigger updated equipment in the DB — clear L1 cache so
        // subsequent reads reflect the new status + lastCleanedDate
        equipmentRepository.flush();

        return MaintenanceLogDTO.from(saved);
    }

    public List<MaintenanceLogDTO> getLogsForEquipment(Long equipmentId) {
        if (!equipmentRepository.existsById(equipmentId)) {
            throw new ResourceNotFoundException(
                    "Equipment not found with id: " + equipmentId);
        }
        return maintenanceLogRepository
                .findByEquipmentIdOrderByMaintenanceDateDesc(equipmentId)
                .stream()
                .map(MaintenanceLogDTO::from)
                .toList();
    }
}
