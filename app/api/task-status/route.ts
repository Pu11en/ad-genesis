import { NextResponse } from 'next/server';

const KIE_API_KEY = process.env.KIE_API_KEY;
const KIE_API_BASE = 'https://api.kie.ai/api/v1';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('taskId');

    if (!taskId) {
      return NextResponse.json({ error: 'taskId required' }, { status: 400 });
    }

    if (!KIE_API_KEY) {
      throw new Error('KIE_API_KEY not configured');
    }

    // Determine which endpoint to use based on task ID format
    // Nano Banana tasks use playground endpoint
    const isPlaygroundTask = taskId.includes('nano-banana') || taskId.startsWith('task_');
    const endpoint = isPlaygroundTask 
      ? `${KIE_API_BASE}/playground/recordInfo`
      : `${KIE_API_BASE}/jobs/recordInfo`;

    const response = await fetch(`${endpoint}?taskId=${taskId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${KIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Kie.ai status error:', errorData);
      return NextResponse.json({ 
        status: 'error', 
        error: errorData.msg || 'Failed to check status' 
      });
    }

    const data = await response.json();

    if (data.code !== 200) {
      return NextResponse.json({ 
        status: 'error', 
        error: data.msg || 'Unknown error' 
      });
    }

    const taskData = data.data;

    // Map Kie.ai status to our status
    let status = 'generating';
    let imageUrl = null;
    let error = null;

    switch (taskData.status) {
      case 'success':
      case 'done':
      case 'completed':
        status = 'success';
        // Get image URL from response - check multiple possible locations
        imageUrl = taskData.output?.image_url 
          || taskData.output?.url 
          || taskData.result?.url
          || taskData.imageUrl
          || taskData.url
          || (taskData.output?.images && taskData.output.images[0])
          || (Array.isArray(taskData.output) && taskData.output[0]);
        break;
      case 'fail':
      case 'failed':
      case 'error':
        status = 'fail';
        error = taskData.error || taskData.message || 'Generation failed';
        break;
      case 'waiting':
      case 'queuing':
      case 'queue':
        status = 'queued';
        break;
      case 'generating':
      case 'processing':
      case 'running':
      default:
        status = 'generating';
    }

    return NextResponse.json({
      status,
      imageUrl,
      error,
      raw: taskData, // Include raw data for debugging
    });
  } catch (error: any) {
    console.error('Task status error:', error);
    return NextResponse.json({ 
      status: 'error', 
      error: error.message || 'Failed to check status' 
    }, { status: 500 });
  }
}
