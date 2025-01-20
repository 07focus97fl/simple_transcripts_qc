import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

// Initialize Google Cloud Storage
const storage = new Storage({
  credentials: {
    client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const transcriptBucket = storage.bucket('simple_transcripts_qc');
const videoBucket = storage.bucket('fsu_vids');

export async function POST(request: Request) {
  try {
    const { videoId } = await request.json();
    
    // Parse the video ID (e.g., "4003 C1 T1")
    const [number, condition, task] = videoId.split(' ');
    
    // Construct paths
    const transcriptPath = `mcnulty/${task.toUpperCase()}/${number}/${condition.toUpperCase()}`;
    const videoPath = `mcnulty/${task.toLowerCase()}/${number}/${condition.toLowerCase()}`;

    // Get signed URLs for both files
    const [transcriptUrl] = await transcriptBucket.file(transcriptPath).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
    });

    const [videoUrl] = await videoBucket.file(videoPath).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 2 * 60 * 60 * 1000, // 2 hours
    });

    // Fetch the transcript content
    const transcriptResponse = await fetch(transcriptUrl);
    const transcriptText = await transcriptResponse.text();

    return NextResponse.json({
      success: true,
      data: {
        transcriptText,
        videoUrl
      }
    });

  } catch (error) {
    console.error('Error loading files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load files' },
      { status: 500 }
    );
  }
}
