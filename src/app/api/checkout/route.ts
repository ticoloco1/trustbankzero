export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';

const HELIO_API_KEY   = process.env.HELIO_API_KEY || process.env.NEXT_PUBLIC_HELIO_API_KEY || '';
const PLATFORM_WALLET = process.env.NEXT_PUBLIC_PLATFORM_WALLET || '';
const SITE_URL        = process.env.NEXT_PUBLIC_SITE_URL || 'https://trustbankzero.vercel.app';

const SPLITS: Record<string, { creator: number; platform: number }> = {
  video:        { creator: 70, platform: 30 },
  cv:           { creator: 50, platform: 50 },
  slug:         { creator: 0,  platform: 100 },
  plan:         { creator: 0,  platform: 100 },
  subscription: { creator: 0,  platform: 100 },
  slug_renewal: { creator: 0,  platform: 100 },
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, userId } = body;

    if (!items?.length || !userId) {
      return NextResponse.json({ error: 'Missing items or userId' }, { status: 400 });
    }

    const totalAmount = items.reduce((acc: number, item: any) => acc + (Number(item.price) || 0), 0);
    const purchaseType = items[0]?.type || 'plan';

    // No Helio key — return test mode
    if (!HELIO_API_KEY) {
      return NextResponse.json({
        url: `${SITE_URL}/dashboard?payment=test&amount=${totalAmount}`,
        test: true,
        warning: 'Configure HELIO_API_KEY na Vercel para pagamentos reais',
      });
    }

    // No platform wallet — can't split, just charge full to platform
    const splitPayments = PLATFORM_WALLET
      ? [{ address: PLATFORM_WALLET, share: 100 }]
      : [];

    const helioBody = {
      amount: totalAmount.toString(),
      currency: 'USDC',
      network: 'polygon',
      name: `TrustBank · ${purchaseType}`,
      paymentMethods: ['crypto', 'card'],
      returnUrl: `${SITE_URL}/dashboard?payment=success`,
      cancelUrl: `${SITE_URL}/dashboard?payment=cancel`,
      metaData: { user_id: userId, type: purchaseType, items: items.map((i: any) => i.id).join(',') },
      ...(splitPayments.length > 0 ? { splitPayments } : {}),
    };

    const helioRes = await fetch('https://api.helio.pay/v1/paylink/create/fixed', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HELIO_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(helioBody),
    });

    const helioData = await helioRes.json();

    if (!helioRes.ok) {
      console.error('[Helio Error]', helioRes.status, JSON.stringify(helioData));
      return NextResponse.json({
        error: `Helio: ${helioData?.message || helioData?.error || helioRes.status}`,
      }, { status: 502 });
    }

    const url = helioData.paylinkUrl || helioData.url;
    if (!url) {
      return NextResponse.json({ error: 'Helio não retornou URL' }, { status: 502 });
    }

    return NextResponse.json({ url, amount: totalAmount });

  } catch (err: any) {
    console.error('[Checkout]', err);
    return NextResponse.json({ error: err?.message || 'Erro interno' }, { status: 500 });
  }
}
