import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getAuth } from '@clerk/nextjs/server';

const systemPrompt = `
You are a flashcard creator. Your task is to generate concise and effective flashcards based on the given topic or content. Follow these guidelines:

1. Create clear and concise questions for the front of the flashcard.
2. Provide accurate and informative answers for the back of the flashcard.
3. Focus on key concepts, definitions, facts, or relationships within the given subject.
4. Use simple language to ensure clarity and ease of understanding.
5. Avoid overly complex or lengthy content that might be difficult to remember.
6. Include a variety of question types, such as multiple-choice, fill-in-the-blank, or true/false, when appropriate.
7. Ensure that each flashcard covers a single, distinct piece of information.
8. When dealing with lists or sequences, break them down into individual flashcards for better retention.
9. Use mnemonics or memory aids when helpful for complex information.
10. Tailor the difficulty level to the user's specified knowledge or grade level.
11. Only generate 10 flashcards.
12. Generate quality flashcards if prompted for CS310, which is a computers science class Data Structure and Algorithms in George Mason University.
13. You are also a help desk assistant in the george mason university and you have all the information of the school.

Your goal is to create flashcards that facilitate effective learning and memorization of the given material.
Return in the following JSON format
{
    "flashcards":[
        {
            "front": "string",
            "back": "string"
        }
    ]
}
`;

export async function POST(req) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const data = await req.text();

        const subscriptionType = 'Free'; // Assume 'Free' for now
        const flashcardLimit = subscriptionType === 'Pro' ? 50 : 8; // Free users can only see up to 3 flashcards

        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
        });

        const completion = await openai.chat.completions.create({
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: data },
            ],
            model: "gpt-3.5-turbo",
            max_tokens: 500,
        });

        console.log("Raw OpenAI Response:", completion.choices[0].message.content);

        let flashcards;
        try {
            flashcards = JSON.parse(completion.choices[0].message.content).flashcards;
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            return NextResponse.json({ error: "Failed to parse flashcards JSON" }, { status: 500 });
        }

        // If the user is on the free plan, lock the flashcards after the 3rd one
        if (subscriptionType === 'Free' && flashcards.length > flashcardLimit) {
            flashcards = flashcards.map((flashcard, index) => {
                if (index >= flashcardLimit) {
                    return {
                        front: "🔒 Upgrade to Pro",
                        locked: true, // Mark the card as locked
                        link: "https://checkout.stripe.com/c/pay/cs_test_a1p0l0GUH9leFrKkKZXclMGGmiRkhjzIu1eijKTSRIlopl7vJj2QxBL5gc#fidkdWxOYHwnPyd1blpxYHZxWjA0VWtsaWc0cFdmbldxTVJnaG8zRENKb29Sa2psdGRxNUd%2FQDNNfWNwNE9NakE1f1JhUGwyTUtKdHVnT3x%2FYDZ0TTdmTE9UXFdGMm9IMjJzTFdvT0hWXDUzNTVVTkRmbHFHaicpJ2hsYXYnP34naHBsYSc%2FJzIzMTIxN2QyKDAxYTQoMWY9MShkNGE9KGRnY2E0ZDw2ZjY2YTUyMTUxMScpJ3ZsYSc%2FJzM9NWcxYDRmKDZgMGAoMTIzNCg9YGFjKGRmZzNnMzwyNzAyZDU0YT1jNicpJ2JwbGEnPyc2YzczNzcxZChhNTBhKDFnNWQoPTE8YChhZjA8YzExYWFnPD0yPDQyNjYneCknZ2BxZHYnP15YKSdpZHxqcHFRfHVgJz8ndmxrYmlgWmxxYGgnKSd3YGNgd3dgd0p3bGJsayc%2FJ21xcXU%2FKippamZkaW1qdnE%2FNjU1NSd4JSUl" // Link to upgrade
                    };
                }
                return flashcard;
            });
        }

        return NextResponse.json(flashcards);
    } catch (error) {
        console.error('Error generating flashcards:', error);
        return NextResponse.json({ error: "Failed to generate flashcards" }, { status: 500 });
    }
}
