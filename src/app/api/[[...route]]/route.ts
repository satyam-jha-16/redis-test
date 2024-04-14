import { Redis } from "@upstash/redis";
import { stat } from "fs";
import { Hono } from "hono";
import { env } from "hono/adapter";
import { handle } from "hono/vercel";

export const runtime = "edge";

const app = new Hono().basePath('/api');

type EnvConfig = {

    UPSTASH_REDIS_REST_TOKEN: string
    UPSTASH_REDIS_REST_URL: string
}

app.get('/search', async (c) => {
    try {
        const start = performance.now();
        const { UPSTASH_REDIS_REST_TOKEN, UPSTASH_REDIS_REST_URL } = env<EnvConfig>(c);
        const redis = new Redis({
            token: UPSTASH_REDIS_REST_TOKEN,
            url: UPSTASH_REDIS_REST_URL
        });

        const qry = c.req.query("q")?.toUpperCase();
        if (!qry) return c.json({ message: "Invalid search query" }, { status: 400 });

        const res = []
        const rank = await redis.zrank("2terms", qry);
        if (rank !== undefined && rank !== null) {
            const temp = await redis.zrange<string[]>("2terms", rank, rank + 100);
            for (const el of temp) {
                if (!el.startsWith(qry)) break;
                if (el.endsWith('*')) {
                    res.push(el.substring(0, el.length - 1));
                }
            }
        }
        const end = performance.now();


        return c.json({
            results: res,
            duration: end - start
        },{
            status: 200
        })
    } catch (error) {
        console.error(error)

        c.json({
            results: [],
            message: "Something went wrong..."
        },{status: 500})

    }
})


//when deploying to vercel 
export const GET = handle(app)

//when deploying it to cloudflare workers
export default app as never;
