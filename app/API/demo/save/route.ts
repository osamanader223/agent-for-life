// [Person 3 - Backend]
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import type { InvoiceFields } from '@/types/demo';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type SaveBody = {
  email: string;
  fields: InvoiceFields;
  businessName?: string;
  businessType?: string;
};

export async function POST(req: Request) {
  try {
    const body: SaveBody = await req.json();
    const { email, fields, businessName, businessType } = body;

    if (!email || typeof email !== 'string') {
      return Response.json({ ok: false, error: 'Valid email is required' }, { status: 400 });
    }

    if (!fields || typeof fields !== 'object') {
      return Response.json({ ok: false, error: 'Invoice fields are required' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin
      .from('demo_leads')
      .insert({
        email: email.trim().toLowerCase(),
        business_name: businessName ?? null,
        business_type: businessType ?? null,
        extracted_data: fields,
      })
      .select('id')
      .single();

    if (error) {
      console.error('[demo/save]', error);
      return Response.json({ ok: false, error: 'Failed to save lead' }, { status: 500 });
    }

    return Response.json({ ok: true, data: { id: data.id } });
  } catch (err) {
    console.error('[demo/save]', err);
    return Response.json(
      { ok: false, error: err instanceof Error ? err.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
