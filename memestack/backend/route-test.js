const express = require('express');
const router = express.Router();

// Mock controller functions
const getTrendingTemplates = (req, res) => {
    console.log('✅ TRENDING route hit!');
    res.json({ success: true, message: 'Trending templates endpoint working!' });
};

const getTemplateById = (req, res) => {
    console.log('❌ ID route hit with:', req.params.id);
    res.json({ success: true, message: 'Template by ID endpoint', id: req.params.id });
};

// Routes in order (specific first, then generic)
router.get('/trending', getTrendingTemplates);
router.get('/:id', getTemplateById);

// Test app
const app = express();
app.use('/api/templates', router);

const port = 3003;
app.listen(port, () => {
    console.log(`🧪 Route order test server running on port ${port}`);
    console.log('Test URLs:');
    console.log(`  - http://localhost:${port}/api/templates/trending`);
    console.log(`  - http://localhost:${port}/api/templates/123abc`);
});
