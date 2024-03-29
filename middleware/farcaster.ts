import { Message, getSSLHubRpcClient } from "@farcaster/hub-nodejs";
import { NextApiRequest, NextApiResponse } from "next";

export async function validateMessage(req: NextApiRequest, res: NextApiResponse): Promise<{ validatedMessage: Message | undefined, fid: number, buttonId: number, inputText: string }> {
  const HUB_URL = process.env['HUB_URL']
  const client = HUB_URL ? getSSLHubRpcClient(HUB_URL) : undefined;
  let validatedMessage: Message | undefined = undefined;
    try {
      const frameMessage = Message.decode(
        Buffer.from(req.body?.trustedData?.messageBytes || "", "hex")
      );
      const result = await client?.validateMessage(frameMessage);
      if(!result?.isOk()) {
        // Hub is not available, fall back to untrusted data
        res.status(400).send(`Failed to validate message. Check HUB_URL`);
        return { validatedMessage, fid: -1, buttonId: 0, inputText: "" };
      }
      if (result && result.isOk() && result.value.valid) {
        validatedMessage = result.value.message;
      }
      // Also validate the frame url matches the expected url
      let urlBuffer = validatedMessage?.data?.frameActionBody?.url || [];
      const urlString = Buffer.from(urlBuffer).toString("utf-8");
      if (
        validatedMessage &&
        !urlString.startsWith(process.env["NEXT_PUBLIC_HOST"] || "")
      ) {
        res.status(400).send(`Invalid frame url: ${urlBuffer}`)
        return { validatedMessage, fid: 0, buttonId: 0, inputText: "" };
    }
    } catch (e) {
        res.status(400).send(`Failed to validate message: ${e}`);
      return { validatedMessage, fid: 0, buttonId: 0, inputText: "" };
    }

    // If HUB_URL is not provided, don't validate and fall back to untrusted data
    let fid = 0,
      buttonId = 0,
      inputText = "";
    if (client) {
      buttonId = validatedMessage?.data?.frameActionBody?.buttonIndex || 0;
      fid = validatedMessage?.data?.fid || 0;
      inputText = Buffer.from(
        validatedMessage?.data?.frameActionBody?.inputText || []
      ).toString("utf-8");
    } else {
      fid = req.body?.untrustedData?.fid || 0;
      buttonId = req.body?.untrustedData?.buttonIndex || 0;
      inputText = req.body?.untrustedData?.inputText || "";
    }
    console.log(`fid`, fid);
    console.log(`input text`, inputText);

    return { validatedMessage, fid, buttonId, inputText };

}