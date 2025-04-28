import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const lambdaUrl = process.env.LAMBDA_INVOKE_URL;

    const response = await fetch(lambdaUrl!, {
      method: 'GET',  // <-- change POST to GET
    });

    if (!response.ok) {
      throw new Error(`Lambda call failed: ${response.statusText}`);
    }

    const data = await response.json();

    return NextResponse.json({ success: true, lambdaResponse: data });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('Amplify Route Error:', error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
