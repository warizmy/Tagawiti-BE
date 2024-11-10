const express = require('express');
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const budget = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);


const getTableByCategoryType = (type) => {
    switch (type) {
        case 'utama':
            return 'kategori_utama';
        case 'sub_utama':
            return 'kategori_sub_utama';
        case 'sub_kedua':
            return 'kategori_sub_kedua';
        default:
            throw new Error(`Invalid category type: ${type}`);
    }
};


budget.get('/get/budget', async (req, res) => {
    try {
        const { data: kategoriUtama, error: errorUtama } = await supabase
            .from('kategori_utama')
            .select('id_kategori_utama, nama_kategori_utama, total_anggaran, realisasi, lebih_kurang');

        if (errorUtama) throw errorUtama;

        const { data: kategoriSubUtama, error: errorSubUtama } = await supabase
            .from('kategori_sub_utama')
            .select('id_kategori_sub_utama, nama_kategori_sub_utama, id_kategori_utama, total_anggaran, realisasi, lebih_kurang');

        if (errorSubUtama) throw errorSubUtama;

        const { data: kategoriSubKedua, error: errorSubKedua } = await supabase
            .from('kategori_sub_kedua')
            .select('id_kategori_sub_kedua, nama_kategori_sub_kedua, id_kategori_sub_utama, id_kategori_utama, total_anggaran, realisasi, lebih_kurang');

        if (errorSubKedua) throw errorSubKedua;

        const result = kategoriUtama.map((utama) => ({
            id: utama.id_kategori_utama,
            name: utama.nama_kategori_utama,
            totalBudget: utama.total_anggaran,
            realized: utama.realisasi,
            surplusDeficit: utama.lebih_kurang,
            subCategories: kategoriSubUtama
                .filter((subUtama) => subUtama.id_kategori_utama === utama.id_kategori_utama)
                .map((subUtama) => ({
                    id: subUtama.id_kategori_sub_utama,
                    name: subUtama.nama_kategori_sub_utama,
                    totalBudget: subUtama.total_anggaran,
                    realized: subUtama.realisasi,
                    surplusDeficit: subUtama.lebih_kurang,
                    subCategories: kategoriSubKedua
                        .filter((subKedua) => subKedua.id_kategori_sub_utama === subUtama.id_kategori_sub_utama)
                        .map((subKedua) => ({
                            id: subKedua.id_kategori_sub_kedua,
                            name: subKedua.nama_kategori_sub_kedua,
                            totalBudget: subKedua.total_anggaran,
                            realized: subKedua.realisasi,
                            surplusDeficit: subKedua.lebih_kurang,
                        })),
                })),
        }));

        res.success(result, "Data berhasil diambil");
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.error(500, "Error fetching categories", error.message);
    }
});

module.exports = budget;


budget.put('/update/budget/:type/:id', async (req, res) => {
    const { type, id } = req.params;
    const { total_anggaran, realisasi } = req.body;

    try {
        const idColumn = type === 'utama' ? 'id_kategori_utama'
            : type === 'sub_utama' ? 'id_kategori_sub_utama'
                : 'id_kategori_sub_kedua';

        const tableName = getTableByCategoryType(type);

        const { data: existingData, error: fetchError } = await supabase
            .from(tableName)
            .select('total_anggaran, realisasi')
            .eq(idColumn, id)
            .single();

        if (fetchError) throw fetchError;

        const updateData = {};

        if (total_anggaran !== undefined && total_anggaran !== null) {
            updateData.total_anggaran = total_anggaran;
        } else {
            updateData.total_anggaran = existingData.total_anggaran;
        }

        if (realisasi !== undefined && realisasi !== null) {
            updateData.realisasi = realisasi;
        }

        const { data, error } = await supabase
            .from(tableName)
            .update(updateData)
            .eq(idColumn, id);

        if (error) throw error;

        res.status(200).json({ message: `Data berhasil diupdate di tabel ${tableName}`, data });
    } catch (error) {
        console.error('Error updating budget:', error);
        res.status(500).json({ message: 'Error updating budget', error: error.message });
    }
});

budget.delete('/delete/:type/:id', async (req, res) => {
    const { type, id } = req.params;

    try {
        const tableName = getTableByCategoryType(type);

        const { data, error } = await supabase
            .from(tableName)
            .delete()
            .eq('id', id);

        if (error) throw error;

        res.status(200).json({ message: `Data berhasil dihapus dari tabel ${tableName}`, data });
    } catch (error) {
        console.error('Error deleting budget:', error);
        res.status(500).json({ message: 'Error deleting budget', error: error.message });
    }
});

module.exports = budget;
