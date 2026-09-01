import bcrypt from 'bcryptjs';
import { mainPool } from '../../db/pool.js';

export const registerUser = async (req, res) => {
  const { fullName, email, username, password, phone } = req.body;

  if (!fullName || !email || !username || !password) {
    return res.status(400).json({
      success: false,
      message: 'Semua field (Nama, Email, Username, Password) wajib diisi'
    });
  }

  try {
    // Check if username or email already exists in users table
    const [existingUsers] = await mainPool.query(
      'SELECT id FROM users WHERE username = ? OR email = ? LIMIT 1',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Username atau Email sudah terdaftar'
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user into users table
    const [userResult] = await mainPool.query(
      'INSERT INTO users (name, email, username, password_hash, role) VALUES (?, ?, ?, ?, ?)',
      [fullName, email, username, passwordHash, 'employee']
    );

    // Generate a unique employee code
    const employeeCode = `CUST-${String(Date.now()).slice(-6)}`;

    // Insert employee details into mst_employee table
    await mainPool.query(
      'INSERT INTO mst_employee (company_id, employee_code, full_name, email, phone_number) VALUES (?, ?, ?, ?, ?)',
      [1, employeeCode, fullName, email, phone || '']
    );

    return res.status(201).json({
      success: true,
      message: 'Registrasi berhasil! Silakan login.'
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server saat registrasi',
      error: error.message
    });
  }
};
