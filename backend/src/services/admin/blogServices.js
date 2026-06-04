const blogModel = require('../../models/blogModel');

const blogServices = {
    getBlogs: async (filters) => {
        const { page = 1, perPage = 10, search = '' } = filters;
        const offset = (page - 1) * perPage;

        const [blogs, totalItems] = await Promise.all([
            blogModel.getBlogs({ search, perPage: parseInt(perPage), offset: parseInt(offset) }),
            blogModel.countBlogs({ search })
        ]);

        return {
            blogs,
            totalItems,
            totalPages: Math.ceil(totalItems / perPage) || 1
        };
    },

    saveBlog: async (id, data) => {
        const detailsJson = data.Details ? JSON.stringify(data.Details) : null;
        await blogModel.updateBlogDetails(id, {
            CulturalStory: data.CulturalStory || null,
            Details: detailsJson
        });
        return true;
    },

    deleteBlog: async (id) => {
        await blogModel.updateBlogDetails(id, {
            CulturalStory: null,
            Details: null
        });
        return true;
    }
};

module.exports = blogServices;