package com.equipment.repository;

import com.equipment.model.Equipment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EquipmentRepository extends JpaRepository<Equipment, Long> {

    List<Equipment> findByStatus(String status);

    @Query("SELECT e FROM Equipment e WHERE " +
            "(:status IS NULL OR e.status = :status) AND " +
            "(:search IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "   OR LOWER(e.type.name) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Equipment> findByFilters(
            @Param("status") String status,
            @Param("search") String search);
}
