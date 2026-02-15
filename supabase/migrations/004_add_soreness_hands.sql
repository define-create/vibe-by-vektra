-- Add soreness_hands column to session_logs table
ALTER TABLE session_logs
ADD COLUMN soreness_hands SMALLINT NOT NULL DEFAULT 0 CHECK (soreness_hands BETWEEN 0 AND 3);
