
export async function GET(request: Request) {
    const punApi = `https://icanhazdadjoke.com/`
    const punHeaders = new Headers()    
    punHeaders.append('Accept', 'application/json')
    const punRequest = new Request(punApi, {
        headers: punHeaders,
    })
    const punResponse = await fetch(punRequest)
    const punJson = await punResponse.json()
    const pun = punJson.joke
    console.log(pun)

    const head = new Headers()
    const meta = `
    <meta property="og:title" content="Submit an attestation">
    <meta property="og:image" content="https://farcaster-frame-lemon.vercel.app/header.png">
    <meta name="fc:frame" content="vNext">
    <meta name="fc:frame:image" content="https://farcaster-frame-lemon.vercel.app/header.png">
    <meta name="fc:frame:post_url" content="https://farcaster-frame-lemon.vercel.app/api/pun">
    <meta name="fc:frame:button:1" content="${pun}">
    `
    // include meta tags in response and return response
    head.append('Content-Type', 'text/html')
    return new Response(meta, { headers: head })
}
