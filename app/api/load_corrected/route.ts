import { NextResponse } from 'next/server';
import { Storage } from '@google-cloud/storage';

const storage = new Storage({
  credentials: {
    client_email: process.env.GCP_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GCP_PRIVATE_KEY?.replace(/\\n/g, '\n'),
  },
});

const bucket = storage.bucket('simple_transcripts_qc');

export async function POST(request: Request) {
  try {
    const { videoId } = await request.json();
    
    // Parse the video ID (e.g., "4003 C1 T1")
    const [number, condition, task] = videoId.split(' ');
    
    // Construct paths for corrected transcript
    const correctedPath = `corrected/${task.toUpperCase()}/${number}/${condition.toUpperCase()}`;

    // Get signed URL for the corrected transcript
    const [correctedUrl] = await bucket.file(correctedPath).getSignedUrl({
      version: 'v4',
      action: 'read',
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
    });

    // Fetch the corrected transcript content
    const correctedResponse = await fetch(correctedUrl);
    
    if (!correctedResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'No corrected version found'
      }, { status: 404 });
    }

    const correctedText = await correctedResponse.text();

    return NextResponse.json({
      success: true,
      data: {
        transcriptText: correctedText
      }
    });

  } catch (error) {
    console.error('Error loading corrected transcript:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load corrected transcript' },
      { status: 500 }
    );
  }
} 