export async function GET(request: Request) {
    console.log(request)
    // set meta head tags
    const head = new Headers()
    const meta = `
    <meta property="og:title" content="Second page">
    <meta property="og:image" content="https://picsum.photos/200/300">
    <meta name="fc:frame" content="vNext">
    <meta name="fc:frame:image" content="https://picsum.photos/200/300">
    <meta name="fc:frame:post_url" content="">
    <meta name="fc:frame:button:1" content="choice 2">
    `
    // include meta tags in response and return response
    head.append('Content-Type', 'text/html')
    return new Response(meta, { headers: head })
}
