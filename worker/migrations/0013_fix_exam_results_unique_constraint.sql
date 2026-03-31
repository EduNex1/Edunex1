-- Clean up duplicate exam results, keeping only the latest one
DELETE FROM exam_results
WHERE id NOT IN (
    SELECT MAX(id)
    FROM exam_results
    GROUP BY exam_id, student_id, subject_id
);

-- Add unique index to prevent future duplicates and make INSERT OR REPLACE work
CREATE UNIQUE INDEX IF NOT EXISTS idx_exam_results_composite ON exam_results (exam_id, student_id, subject_id);
