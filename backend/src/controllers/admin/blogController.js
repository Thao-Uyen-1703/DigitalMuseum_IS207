const blogServices = require('../../services/admin/blogServices');

const processPayloadWithFiles = (req) => {
    if (!req.body.payload) {
        throw new Error('Thiếu dữ liệu payload');
    }

    const payload = JSON.parse(req.body.payload);

    if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
            const match = file.fieldname.match(/image_(\d+)/);
            if (match) {
                const index = parseInt(match[1], 10);
                if (payload.Details && payload.Details.Story && payload.Details.Story[index]) {
                    payload.Details.Story[index].ImageURL = file.filename;
                }
            }
        });
    }

    return payload;
};

const blogController = {
    getAll: async (req, res) => {
        try {
            const data = await blogServices.getBlogs(req.query);
            return res.status(200).json({ success: true, data });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Lỗi hệ thống máy chủ' });
        }
    },

    create: async (req, res) => {
        try {
            const { id } = req.params;
            const finalPayload = processPayloadWithFiles(req);
            
            await blogServices.saveBlog(id, finalPayload);
            return res.status(201).json({ success: true, message: 'Tạo story thành công' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Lỗi hệ thống máy chủ' });
        }
    },

    update: async (req, res) => {
        try {
            const { id } = req.params;
            const finalPayload = processPayloadWithFiles(req);

            await blogServices.saveBlog(id, finalPayload);
            return res.status(200).json({ success: true, message: 'Cập nhật story thành công' });
        } catch (err) {
            console.error(err);
            return res.status(500).json({ success: false, message: 'Lỗi hệ thống máy chủ' });
        }
    },

    delete: async (req, res) => {
        try { 
            const { id } = req.params;
            await blogServices.deleteBlog(id);
            return res.status(200).json({ success: true, message: 'Xóa story thành công' });
        } catch (err) {
            return res.status(500).json({ success: false, message: 'Lỗi hệ thống máy chủ' });
        }
    }
};

module.exports = blogController;