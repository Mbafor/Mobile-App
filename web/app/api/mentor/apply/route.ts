import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PRIVATE_SUPABASE_SERVICE_ROLE_KEY;

export async function POST(req: NextRequest) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
    return NextResponse.json({ error: 'Missing Supabase configuration on server.' }, { status: 500 });
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE);

  let body: any;
  try {
    body = await req.json();
  } catch (err) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const required = [
    'first_name',
    'last_name',
    'email',
    'area_of_expertise',
    'years_of_experience',
    'short_bio',
    'motivation',
  ];

  for (const key of required) {
    if (!body[key]) return NextResponse.json({ error: `${key} is required` }, { status: 400 });
  }

  const insert = {
    first_name: body.first_name,
    last_name: body.last_name,
    email: body.email,
    phone: body.phone || null,
    linkedin: body.linkedin || null,
    portfolio: body.portfolio || null,
    area_of_expertise: body.area_of_expertise,
    years_of_experience: body.years_of_experience,
    short_bio: body.short_bio,
    motivation: body.motivation,
    status: 'pending',
  };

  const { data, error } = await supabase.from('mentor_applications').insert(insert).select();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ data }, { status: 201 });
}
