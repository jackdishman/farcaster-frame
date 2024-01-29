export async function GET(request: Request) {
    // set meta head tags
    const head = new Headers()
    const meta = `
    <meta property="og:title" content="Submit an attestation">
    <meta property="og:image" content="https://www.jackdishman.com/static/media/face.370f819c7c1aceceb8a3.webp">
    <meta name="fc:frame" content="vNext">
    <meta name="fc:frame:image" content="https://www.jackdishman.com/static/media/face.370f819c7c1aceceb8a3.webp">
    <meta name="fc:frame:post_url" content="">
    <meta name="fc:frame:button:1" content="choice 1">
    `
    // include meta tags in response and return response
    head.append('Content-Type', 'text/html')
    return new Response(meta, { headers: head })
}
