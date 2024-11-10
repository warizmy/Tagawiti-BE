const express = require('express');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const updatePassword = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

updatePassword.post('/admin/change-password', async (req, res) => {
     const { newPassword, confirmPassword } = req.body;
     const userId = req.session.userId;

     if (!userId) {
          return res.status(401).json({ message: 'Anda harus login untuk mengakses halaman ini.' });
     }

     if (!newPassword || !confirmPassword) {
          return res.status(400).json({ message: 'Semua kolom harus diisi!' });
     }

     if (newPassword !== confirmPassword) {
          return res.status(400).json({ message: 'Kata sandi tidak cocok!' });
     }

     try {
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

          const { error } = await supabase
               .from('admin')
               .update({ password: hashedPassword })
               .eq('id', userId);

          if (error) {
               throw error;
          }

          res.status(200).json({ message: 'Kata sandi berhasil diubah!' });
     } catch (error) {
          console.error('Error updating password:', error);
          res.status(500).json({ message: 'Terjadi kesalahan saat mengganti kata sandi.', error: error.message });
     }
});

module.exports = updatePassword;