import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    // Get JSON file or text
    let examJson: any = null;
    const jsonFile = formData.get('jsonFile') as File | null;
    const jsonText = formData.get('jsonText') as string | null;

    if (jsonFile) {
      const text = await jsonFile.text();
      examJson = JSON.parse(text);
    } else if (jsonText) {
      examJson = JSON.parse(jsonText);
    } else {
      return NextResponse.json({ error: 'No JSON provided' }, { status: 400 });
    }

    // Normalize JSON (just in case)
    if (!examJson.id) {
      examJson.id = `exam-${Date.now()}`;
    }
    if (examJson.metadata) {
      const newMetadata: any = {};
      for (const key in examJson.metadata) {
        const normalizedKey = key.toLowerCase().replace(/ /g, '_');
        newMetadata[normalizedKey] = examJson.metadata[key];
      }
      examJson.metadata = newMetadata;
    }

    if (!examJson.metadata || !examJson.sections) {
      return NextResponse.json({ error: 'Invalid exam JSON format.' }, { status: 400 });
    }

    // Handle Audio Files
    const audioFiles = formData.getAll('audios') as File[];
    if (audioFiles.length > 0) {
      const uploadDir = join(process.cwd(), 'public', 'uploads');
      // Ensure dir exists
      await mkdir(uploadDir, { recursive: true });

      for (const audio of audioFiles) {
        const bytes = await audio.arrayBuffer();
        const buffer = Buffer.from(bytes);
        // Save to public/uploads
        // the path will be /uploads/filename
        const filePath = join(uploadDir, audio.name);
        await writeFile(filePath, buffer);
      }
    }

    // Save Exam to DB
    const exam = await prisma.exam.create({
      data: {
        id: examJson.id,
        metadata: examJson.metadata,
        sections: examJson.sections,
      }
    });

    return NextResponse.json(exam);
  } catch (error: any) {
    console.error("Import Error:", error);
    return NextResponse.json({ error: error.message || "Failed to import exam" }, { status: 500 });
  }
}
