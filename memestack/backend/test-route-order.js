const express = require('express');
const router = express.Router();

// Mock functions with console logs
const getTrendingTemplates = (req, res) => {
    console.log('✅ getTrendingTemplates called!');
    res.json({ message: 'getTrendingTemplates called', params: req.params });
};

const getTemplateById = (req, res) => {
    console.log('✅ getTemplateById called with:', req.params.id);
    res.json({ message: 'getTemplateById called', params: req.params });
};

// Routes in the same order as our actual file
router.get('/trending', getTrendingTemplates);
router.get('/:id', getTemplateById);

// Test server
const app = express();
app.use('/api/templates', router);

const port = 3001;
app.listen(port, () => {
    console.log(`Route test server running on port ${port}`);
    console.log('Test with:');
    console.log(`  curl http://localhost:${port}/api/templates/trending`);
    console.log(`  curl http://localhost:${port}/api/templates/123`);
});
