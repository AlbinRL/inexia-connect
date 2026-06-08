-- Add reservation time range
ALTER TABLE "Reservation"
ADD COLUMN "dateDebut" TIMESTAMP(3),
ADD COLUMN "dateFin" TIMESTAMP(3);

-- Backfill existing records from the previous single timestamp
UPDATE "Reservation"
SET "dateDebut" = "date",
    "dateFin" = "date"
WHERE "dateDebut" IS NULL OR "dateFin" IS NULL;

-- Make the new columns mandatory
ALTER TABLE "Reservation"
ALTER COLUMN "dateDebut" SET NOT NULL,
ALTER COLUMN "dateFin" SET NOT NULL;

-- Remove the legacy column
ALTER TABLE "Reservation"
DROP COLUMN "date";