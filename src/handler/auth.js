const express = require('express');
const bcrypt = require('bcrypt');
const { createClient } = require('@supabase/supabase-js');

const auth = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

auth.post('/login', async (req, res) => {
     const { username, password } = req.body;

     try {
          const { data: user, error } = await supabase
               .from('admin')
               .select('*')
               .eq('username', username)
               .single();

          if (error || !user) {
               return res.status(401).json({ message: 'Username atau password salah.' });
          }

          const isPasswordValid = await bcrypt.compare(password, user.password);
          // const isPasswordValid = user.password;
          if (!isPasswordValid) {
               return res.status(401).json({ message: 'Username atau password salah.' });
          }

          req.session.userId = user.id;

          res.success({ userId: user.id, username: user.username }, 'Login berhasil');
     } catch (error) {
          res.error(500, 'Terjadi kesalahan saat login', error.message);
     }
});

auth.post('/logout', (req, res) => {
     req.session.destroy(err => {
          if (err) {
               return res.error(500, 'Logout gagal', err.message);
          }

          res.clearCookie('connect.sid', {
               httpOnly: true,
               secure: process.env.NODE_ENV === 'production',
               sameSite: 'Strict',
          });
          res.success(null, 'Logout berhasil');
     });
});

auth.get('/check-session', (req, res) => {
     if (req.session.userId) {
       res.status(200).json({ message: 'Sesi masih berlaku.' });
     } else {
       res.status(401).json({ message: 'Sesi telah habis.' });
     }
   });
   

module.exports = auth;
