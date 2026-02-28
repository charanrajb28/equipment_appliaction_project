-- ============================================================
--  Equipment Management System — PostgreSQL Schema + Triggers
--  Run once against a fresh database: equipment_db
-- ============================================================

-- 1. Equipment Types (dynamic — no hardcoded values in code)
-- ============================================================
CREATE TABLE IF NOT EXISTS equipment_types (
    id   BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

-- Seed types (modifiable via DB/admin without code changes)
INSERT INTO equipment_types (name) VALUES
  ('HVAC'),
  ('Generator'),
  ('Compressor'),
  ('Conveyor Belt'),
  ('Pump'),
  ('Electrical Panel'),
  ('Boiler'),
  ('Chiller')
ON CONFLICT (name) DO NOTHING;


-- 2. Equipment
-- ============================================================
CREATE TABLE IF NOT EXISTS equipment (
    id                BIGSERIAL PRIMARY KEY,
    name              VARCHAR(200) NOT NULL,
    type_id           BIGINT       NOT NULL REFERENCES equipment_types(id) ON DELETE RESTRICT,
    status            VARCHAR(30)  NOT NULL
                          CHECK (status IN ('Active', 'Inactive', 'Under Maintenance')),
    last_cleaned_date DATE         NOT NULL,
    created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_equipment_status ON equipment(status);
CREATE INDEX IF NOT EXISTS idx_equipment_type   ON equipment(type_id);


-- 3. Maintenance Logs
-- ============================================================
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id               BIGSERIAL PRIMARY KEY,
    equipment_id     BIGINT       NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
    maintenance_date DATE         NOT NULL,
    notes            TEXT,
    performed_by     VARCHAR(200) NOT NULL,
    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_maintenance_equip ON maintenance_logs(equipment_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_date  ON maintenance_logs(maintenance_date DESC);


-- ============================================================
--  TRIGGERS
-- ============================================================

-- Trigger 1: Auto-update equipment.updated_at on every row update
-- ============================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_equipment_updated_at ON equipment;
CREATE TRIGGER trg_equipment_updated_at
BEFORE UPDATE ON equipment
FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();


-- Trigger 2: After a maintenance log is inserted, automatically
--            set equipment status → Active and sync last_cleaned_date
-- ============================================================
CREATE OR REPLACE FUNCTION fn_sync_equipment_after_maintenance()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE equipment
    SET
        status            = 'Active',
        last_cleaned_date = NEW.maintenance_date
    WHERE id = NEW.equipment_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_maintenance_sync ON maintenance_logs;
CREATE TRIGGER trg_maintenance_sync
AFTER INSERT ON maintenance_logs
FOR EACH ROW EXECUTE FUNCTION fn_sync_equipment_after_maintenance();


-- Trigger 3: Prevent setting status = 'Active' when last_cleaned_date
--            is older than 30 days (DB-level safety net)
-- ============================================================
CREATE OR REPLACE FUNCTION fn_check_active_status_constraint()
RETURNS TRIGGER AS $$
BEGIN
    -- Only applies when status is being set to Active
    IF NEW.status = 'Active'
       AND NEW.last_cleaned_date < CURRENT_DATE - INTERVAL '30 days' THEN
        RAISE EXCEPTION
            'Cannot set status to Active: last_cleaned_date is older than 30 days (last cleaned: %)',
            NEW.last_cleaned_date;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- This trigger fires BEFORE trigger 2 would update the row,
-- but trigger 2 only runs on maintenance_logs, so they don't conflict.
DROP TRIGGER IF EXISTS trg_status_constraint ON equipment;
CREATE TRIGGER trg_status_constraint
BEFORE INSERT OR UPDATE ON equipment
FOR EACH ROW EXECUTE FUNCTION fn_check_active_status_constraint();
