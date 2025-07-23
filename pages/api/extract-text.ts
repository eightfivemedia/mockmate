import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const form = formidable({ multiples: false, keepExtensions: true });
  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error('Formidable error:', err);
      return res.status(500).json({ error: 'Failed to parse form data' });
    }
    const file = files.file;
    if (!file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const filePath = Array.isArray(file) ? file[0].filepath : file.filepath;
    const fileName = Array.isArray(file) ? file[0].originalFilename : file.originalFilename;
    const ext = fileName?.split('.').pop()?.toLowerCase();
    let text = '';
    try {
      if (ext === 'pdf') {
        const data = fs.readFileSync(filePath);
        const pdfData = await pdfParse(data);
        text = pdfData.text;
      } else if (ext === 'docx') {
        const data = fs.readFileSync(filePath);
        const result = await mammoth.extractRawText({ buffer: data });
        text = result.value;
      } else if (ext === 'txt') {
        text = fs.readFileSync(filePath, 'utf8');
      } else {
        return res.status(400).json({ error: 'Unsupported file type' });
      }
      fs.unlinkSync(filePath);
      return res.status(200).json({ text });
    } catch (error) {
      console.error('Extraction error:', error);
      return res.status(500).json({ error: 'Failed to extract text' });
    }
  });
} 