import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import QuizResultsEmail from '@/emails/QuizResultsEmail';

const resend = new Resend(process.env.RESEND_API_KEY);
const EMAIL_FROM = process.env.EMAIL_FROM;
const EMAIL_REPLY_TO = process.env.EMAIL_REPLY_TO;

export async function POST(req: NextRequest) {
  try {
    const { name, email, score, total, results } = await req.json();
    if (!name || !email || typeof score !== 'number' || typeof total !== 'number' || !Array.isArray(results)) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const emailHtml = QuizResultsEmail({ name, score, total, results });

    const data = await resend.emails.send({
      from: EMAIL_FROM!,
      to: email,
      subject: 'Your ATS Trivia Results',
      react: emailHtml,
      reply_to: EMAIL_REPLY_TO || undefined,
    });

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
} 