
export async function POST(request: Request) {
    console.log(request)

    const responseBuilder = (title: string) => {
        const head = new Headers()
        const meta = `
            <meta property="og:title" content="${title}">
            <meta property="og:image" content="https://farcaster-frame-lemon.vercel.app/header.jpeg">
            <meta name="fc:frame" content="vNext">
            <meta name="fc:frame:image" content="https://farcaster-frame-lemon.vercel.app/header.jpeg">
            <meta name="fc:frame:post_url" content="https://farcaster-frame-lemon.vercel.app/api/weather">
            <meta name="fc:frame:button:1" content="enter state code">
            <meta name="fc:frame:input:text">
        `
        head.append('Content-Type', 'text/html')

        // set res status to 200
        return new Response(meta, { headers: head })
    }

    const { searchParams } = new URL(request.url)
    const state = searchParams.get('state')?.toUpperCase()
    if (!state) {
        return responseBuilder('Please provide a state')
    }
    const alertsUrl = `https://api.weather.gov/alerts/active?area=${state}`
    const headers = {
        'User-Agent': 'https://farcaster-frame-lemon.vercel.app/, me@jackdishman.com'
    }
    // fetch alerts
    const alertsResponse = await fetch(alertsUrl, { headers })
    const alertsData = await alertsResponse.json()
    const alerts: string[] = []

    alertsData.features.forEach((alert: any) => {
        // push only if not already in array
        if (!alerts.includes(alert.properties.headline)) {
            alerts.push(alert.properties.headline)
        }
    })

    const head = new Headers()
    const meta = `
    <meta property="og:title" content="Submit an attestation">
    <meta property="og:image" content="https://farcaster-frame-lemon.vercel.app/header.jpeg">
    <meta name="fc:frame" content="vNext">
    <meta name="fc:frame:image" content="https://farcaster-frame-lemon.vercel.app/header.jpeg">
    <meta name="fc:frame:post_url" content="https://farcaster-frame-lemon.vercel.app/api/weather">
    <meta name="fc:frame:button:1" content="${alerts[0]}">
    <meta name="fc:frame:input:text">
    `
    // include meta tags in response and return response
    head.append('Content-Type', 'text/html')
    return new Response(meta, { headers: head })
}

export async function GET(){
    // return a simple response
    return new Response('Hello, world!', { status: 200 })
}