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
    const { videoId, transcriptText } = await request.json();
    
    // Parse the video ID (e.g., "4003 C1 T1")
    const [number, condition, task] = videoId.split(' ');
    
    // Construct path for corrected transcript
    const correctedPath = `corrected/${task.toUpperCase()}/${number}/${condition.toUpperCase()}`;
    
    // Create a new file in the bucket
    const file = bucket.file(correctedPath);
    
    // Upload the text content
    await file.save(transcriptText, {
      contentType: 'text/plain',
      metadata: {
        originalVideoId: videoId,
        lastModified: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Transcript saved successfully'
    });

  } catch (error) {
    console.error('Error saving transcript:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save transcript' },
      { status: 500 }
    );
  }
}
