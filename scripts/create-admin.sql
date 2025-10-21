-- Create first admin account for ODeL
INSERT INTO admin_users (email, password_hash, full_name, role, is_active)
VALUES (
  'admin@ueab.ac.ke',
  '$2b$10$NfOEZsGn/E753DWdSUN/weobXe0uHYY7HrehHHbAIDuXD/lFWIJoG',
  'Administrator',
  'super_admin',
  true
)
ON CONFLICT (email) DO NOTHING;
