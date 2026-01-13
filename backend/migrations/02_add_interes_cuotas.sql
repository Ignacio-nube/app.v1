-- Migración: Agregar porcentaje de interés a ventas a crédito
-- El interés se aplica al momento de crear la venta y se refleja en las cuotas

-- 1. Agregar columna de porcentaje de interés a la tabla VENTA
ALTER TABLE VENTA 
ADD COLUMN porcentaje_interes DECIMAL(5,2) DEFAULT 0.00;

-- 2. Agregar columna de monto total con interés (para referencia)
ALTER TABLE VENTA 
ADD COLUMN total_con_interes DECIMAL(10,2);

-- 3. Actualizar ventas existentes (el total_con_interes será igual al total_venta)
UPDATE VENTA 
SET total_con_interes = total_venta 
WHERE total_con_interes IS NULL;

-- 4. Agregar índice para consultas por tipo de venta con interés
CREATE INDEX idx_venta_tipo_interes ON VENTA(tipo_venta, porcentaje_interes);

-- Notas:
-- - porcentaje_interes: el porcentaje aplicado (ej: 10.00 = 10%)
-- - total_con_interes: total_venta + (total_venta * porcentaje_interes / 100)
-- - El monto de cada cuota se calcula: total_con_interes / cantidad_cuotas
