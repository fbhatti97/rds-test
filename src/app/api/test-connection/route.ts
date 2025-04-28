import { NextResponse } from 'next/server';
import { InvokeCommand, LambdaClient } from "@aws-sdk/client-lambda";

const lambdaClient = new LambdaClient({
    region: "ap-southeast-2",
    credentials: {
      accessKeyId: process.env.AMPLIFY_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AMPLIFY_SECRET_ACCESS_KEY!,
    },
  });

export async function GET() {
  try {
    const command = new InvokeCommand({
      FunctionName: "rds-connector-lambda", // Replace this!
      InvocationType: "RequestResponse",
      Payload: Buffer.from(JSON.stringify({})), // No event data needed yet
    });

    const response = await lambdaClient.send(command);

    if (!response.Payload) {
      throw new Error("No payload returned from Lambda");
    }

    const decodedPayload = JSON.parse(Buffer.from(response.Payload).toString("utf8"));

    return NextResponse.json({
      success: true,
      lambdaResponse: decodedPayload,
    });
  } catch (error) {
    console.error("Error invoking Lambda:", error);
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}
