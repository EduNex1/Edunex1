-- ===== ADD EXTRA_DATA JSON COLUMN TO STUDENTS =====
-- Stores additional admission form fields that don't have dedicated columns:
-- pen, id_type_value, stream, fee_category, new_old, house, house_role,
-- height, weight, family_id, sssm_id, blood_group, state, district,
-- pin_code, nationality, residence_period, guardian_name, guardian_address,
-- guardian_mobile, guardian_relation, father_occupation, caste_name,
-- withdrawal_file_no, scholar_reg_no, last_school, account_holder,
-- bank_branch_name, account_number, ifsc_code, security_amount,
-- transport_opt, last_due_amount, other_info

ALTER TABLE students ADD COLUMN extra_data TEXT DEFAULT '{}';
