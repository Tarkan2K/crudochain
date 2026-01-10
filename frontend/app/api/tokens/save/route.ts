import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Token from '@/models/Token';

export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Expecting an array of tokens or a single token? 
        // The previous db_service implementation replaced the whole array.
        // But for MongoDB, we should probably just insert new ones or update.
        // However, to keep compatibility with the "save" logic which might send a list:

        await dbConnect();

        if (Array.isArray(body)) {
            // If it's an array, we might want to upsert them.
            // For simplicity in migration, let's assume this is used to "add" a token usually.
            // But if the frontend sends the WHOLE list, we shouldn't delete everything in Mongo.
            // Let's look at how it was used. It was used in `api/tokens/route.ts` to save `[newToken, ...currentTokens]`.
            // So it sends the whole list.

            // In a real DB, we don't want to overwrite everything with a list.
            // We should only insert the NEW ones.
            // But since we are migrating from in-memory logic, let's just handle the single token creation properly in the calling route
            // and maybe ignore this "save all" route if possible, OR implement it as a bulk write.

            // BETTER APPROACH: The calling route `api/tokens/route.ts` should just CREATE the token directly in Mongo.
            // It shouldn't need to "save" the whole list.

            // So, I will implement this as a bulk upsert just in case, but ideally we refactor the caller.
            for (const token of body) {
                await Token.findOneAndUpdate({ ticker: token.ticker }, token, { upsert: true });
            }
        } else {
            await Token.create(body);
        }

        return NextResponse.json({ status: 'success' });
    } catch (error) {
        console.error('Tokens Save Error:', error);
        return NextResponse.json({ error: 'Failed to save tokens' }, { status: 500 });
    }
}
