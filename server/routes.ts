import type { Express } from "express";
import { createServer, type Server } from "http";
import { networkInterfaces } from "os";
import { storage } from "./storage";
import multer from "multer";
import { apiRouter } from "./routes/api";

// ML API URL - Flask server running on port 8000
const ML_API_URL = 'http://127.0.0.1:8000';

// Configure multer
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 16 * 1024 * 1024 } // 16MB
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.get("/app-url", (_req, res) => {
    const interfaces = networkInterfaces();
    const port = process.env.PORT || "5000";

    for (const entries of Object.values(interfaces)) {
      for (const entry of entries ?? []) {
        if (entry.family === "IPv4" && !entry.internal) {
          return res.json({ origin: `http://${entry.address}:${port}` });
        }
      }
    }

    return res.json({ origin: `http://127.0.0.1:${port}` });
  });

  // Handle preflight for report endpoints
  app.options(["/generate-report", "/download-report", "/predict"], (_req, res) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Expose-Headers", "Content-Disposition");
    return res.sendStatus(204);
  });

// REST API backed by MySQL
  app.use("/api", apiRouter);

// Prediction endpoint - forwards to Flask ML API
  app.post('/predict', upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'audio', maxCount: 1 }
  ]), async (req, res) => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      
      if (!files || !files['image'] || !files['audio']) {
        return res.status(400).json({ 
          error: 'Please upload both image and audio files' 
        });
      }
      
      const imageFile = files['image'][0];
      const audioFile = files['audio'][0];
      
      // Create form data for Flask API
      const flaskFormData = new FormData();
      // Use type casting to fix TypeScript errors with Buffer
      const imageBlob = new Blob([imageFile.buffer as any]);
      const audioBlob = new Blob([audioFile.buffer as any]);
      flaskFormData.append('image', imageBlob, imageFile.originalname);
      flaskFormData.append('audio', audioBlob, audioFile.originalname);
      
      // Forward request to Flask ML API
      const response = await fetch(`${ML_API_URL}/predict`, {
        method: 'POST',
        body: flaskFormData,
      });
      
      const data = await response.json();
      res.status(response.status).json(data);
    } catch (error) {
      console.error('Prediction error:', error);
      res.status(500).json({ error: 'Failed to connect to ML API' });
    }
  });

  // Health check for ML API
  app.get('/ml-health', async (req, res) => {
    try {
      const response = await fetch(`${ML_API_URL}/health`);
      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: 'ML API not available' });
    }
  });

  // Download report endpoint - forwards to Flask ML API
  app.get('/download-report', async (req, res) => {
    try {
      const query = new URLSearchParams();

      Object.entries(req.query).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (value[0] !== undefined) query.set(key, String(value[0]));
        } else if (value !== undefined) {
          query.set(key, String(value));
        }
      });

      // Forward request to Flask ML API
      const response = await fetch(`${ML_API_URL}/download-report?${query.toString()}`);
      
      // Get the blob from Flask
      const blob = await response.blob();
      
      // Forward the correct content type (application/pdf)
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=parkinson_report.pdf');
      
      // Convert blob to buffer and send
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      res.send(buffer);
    } catch (error) {
      console.error('Download report error:', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  });

  // Generate report endpoint - accepts full patient and prediction details
  app.post('/generate-report', async (req, res) => {
    try {
      const response = await fetch(`${ML_API_URL}/generate-report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req.body ?? {}),
      });

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Failed to generate report');
        return res.status(response.status).json({ error: errorText });
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const contentDisposition = response.headers.get('content-disposition');

      res.setHeader('Content-Type', 'application/pdf');
      if (contentDisposition) {
        res.setHeader('Content-Disposition', contentDisposition);
      } else {
        res.setHeader('Content-Disposition', 'attachment; filename=parkinson_report.pdf');
      }
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');

      res.send(buffer);
    } catch (error) {
      console.error('Generate report error:', error);
      res.status(500).json({ error: 'Failed to generate report' });
    }
  });

  return httpServer;
}
