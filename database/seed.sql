-- MedIntel Seed Data
-- Sample data for testing

-- Insert sample users (doctors)
INSERT INTO users (id, email, full_name, role, crm, specialty, address, phone) VALUES
('11111111-1111-1111-1111-111111111111', 'dr.joao@medintel.com', 'Dr. João Silva', 'doctor', 'CRM/SP 123456', 'Clínico Geral', 'Rua das Flores, 123 - São Paulo/SP', '(11) 98765-4321'),
('22222222-2222-2222-2222-222222222222', 'dra.maria@medintel.com', 'Dra. Maria Santos', 'doctor', 'CRM/RJ 654321', 'Pediatra', 'Av. Principal, 456 - Rio de Janeiro/RJ', '(21) 98765-1234')
ON CONFLICT (id) DO NOTHING;

-- Insert sample patients
INSERT INTO patients (id, user_id, first_name, last_name, date_of_birth, gender, cpf, email, phone) VALUES
('33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', 'Carlos', 'Oliveira', '1985-03-15', 'M', '123.456.789-00', 'carlos@email.com', '(11) 91234-5678'),
('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 'Ana', 'Costa', '1990-07-22', 'F', '987.654.321-00', 'ana@email.com', '(11) 91234-8765')
ON CONFLICT (id) DO NOTHING;

-- Insert sample consultations
INSERT INTO consultations (id, patient_id, doctor_id, consultation_date, chief_complaint, diagnosis, treatment_plan, status) VALUES
('55555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', '11111111-1111-1111-1111-111111111111', NOW(), 'Dor de cabeça persistente', 'Cefaleia tensional', 'Analgésicos e repouso', 'completed'),
('66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 day', 'Gripe', 'Infecção viral das vias aéreas superiores', 'Repouso e hidratação', 'completed')
ON CONFLICT (id) DO NOTHING;

-- Note: Documents will be generated through the API, not seeded
