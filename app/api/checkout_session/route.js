import { NextResponse } from 'next/server';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const formatAmountForStripe = (amount) => {
  return Math.round(amount * 100);
};

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams;
  const session_id = searchParams.get('session_id');

  try {
    const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);
    return NextResponse.json(checkoutSession);
  } catch (error) {
    console.error('Error retrieving checkout session:', error);
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req) {
  const body = await req.json(); // Parse the JSON body
  const { plan } = body;

  let price;
  if (plan === 'basic') {
    price = formatAmountForStripe(5); // $5 for the Basic plan
  } else if (plan === 'pro') {
    price = formatAmountForStripe(10); // $10 for the Pro plan
  } else {
    return NextResponse.json({ error: { message: 'Invalid plan type' } }, { status: 400 });
  }

  const params = {
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} subscription`,
          },
          unit_amount: price,
          recurring: {
            interval: 'month',
            interval_count: 1,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${req.headers.get('origin')}/result?session_id={CHECKOUT_SESSION_ID}`, // Redirect to a result page after success
    cancel_url: `${req.headers.get('origin')}/cancel`, // Redirect to a cancel page if the payment is canceled
  };

  try {
    const checkoutSession = await stripe.checkout.sessions.create(params);
    return NextResponse.json(checkoutSession, {
      status: 200,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json({ error: { message: error.message } }, { status: 500 });
  }
}
