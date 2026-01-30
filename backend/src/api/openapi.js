import { Router } from 'express';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to OpenAPI spec
const specPath = join(__dirname, '../../../specs/001-study-management-site/contracts/openapi.yaml');

/**
 * GET /api/docs
 * Serve OpenAPI specification
 */
router.get('/docs', (req, res) => {
  try {
    if (!existsSync(specPath)) {
      return res.status(404).json({
        success: false,
        message: 'OpenAPI specification not found',
      });
    }

    const spec = readFileSync(specPath, 'utf-8');
    
    // Return based on Accept header
    if (req.accepts('yaml') || req.query.format === 'yaml') {
      res.type('text/yaml').send(spec);
    } else {
      // Parse YAML to JSON for API consumers
      // Simple YAML to JSON is complex, so just return YAML with proper content type
      res.type('text/yaml').send(spec);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error reading OpenAPI specification',
    });
  }
});

/**
 * GET /api/docs/ui
 * Redirect to Swagger UI (if set up externally)
 */
router.get('/docs/ui', (req, res) => {
  res.json({
    success: true,
    message: 'OpenAPI documentation available at /api/docs',
    hint: 'Use a tool like Swagger UI or Redoc to visualize the specification',
  });
});

export default router;
