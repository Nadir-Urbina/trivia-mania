import { Html, Head, Preview, Body, Container, Section, Img, Text, Hr, Button } from '@react-email/components';

interface QuestionResult {
  question: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

interface QuizResultsEmailProps {
  name: string;
  score: number;
  total: number;
  results: QuestionResult[];
}

export default function QuizResultsEmail({ name, score, total, results }: QuizResultsEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your ATS Trivia Results</Preview>
      <Body style={{ backgroundColor: '#f6f6f6', fontFamily: 'Avenir, Arial, sans-serif', color: '#000000' }}>
        <Container style={{ backgroundColor: '#fff', borderRadius: 8, maxWidth: 600, margin: '40px auto', padding: 32, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <Section style={{ textAlign: 'center', marginBottom: 24 }}>
            <Img src="https://trivia-mania.vercel.app/ATS-logo.png" alt="ATS Logo" width={120} style={{ margin: '0 auto 16px' }} />
            <Text style={{ fontSize: 24, fontWeight: 700, color: '#F15A22', margin: 0 }}>Thank you for playing ATS Trivia!</Text>
          </Section>
          <Section style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Hi {name},</Text>
            <Text style={{ fontSize: 16, margin: '8px 0 0' }}>
              You scored <span style={{ color: '#F15A22', fontWeight: 700 }}>{score} / {total}</span> on your trivia game!
            </Text>
          </Section>
          <Section style={{ marginBottom: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: 600, color: '#565759', marginBottom: 8 }}>Your Answers:</Text>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: 4, borderBottom: '2px solid #F15A22' }}>Question</th>
                  <th style={{ textAlign: 'left', padding: 4, borderBottom: '2px solid #F15A22' }}>Your Answer</th>
                  <th style={{ textAlign: 'left', padding: 4, borderBottom: '2px solid #F15A22' }}>Correct Answer</th>
                  <th style={{ textAlign: 'center', padding: 4, borderBottom: '2px solid #F15A22' }}>Result</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} style={{ background: r.isCorrect ? '#eafbe7' : '#fff0ee' }}>
                    <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{r.question}</td>
                    <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{r.userAnswer}</td>
                    <td style={{ padding: 4, borderBottom: '1px solid #eee' }}>{r.correctAnswer}</td>
                    <td style={{ textAlign: 'center', padding: 4, borderBottom: '1px solid #eee', color: r.isCorrect ? '#388e3c' : '#d32f2f', fontWeight: 700 }}>
                      {r.isCorrect ? '✔️' : '❌'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
          <Section style={{ margin: '32px 0 16px', textAlign: 'center' }}>
            <Text style={{ fontSize: 16, color: '#F15A22', fontWeight: 600, marginBottom: 8 }}>Want to learn more about Asphalt Testing Solutions?</Text>
            <Button
              href="https://asphalttesting.info"
              style={{ backgroundColor: '#F15A22', color: '#fff', padding: '12px 32px', borderRadius: 6, fontWeight: 700, fontSize: 16, textDecoration: 'none', border: 'none', margin: '0 auto' }}
            >
              Visit Our Website
            </Button>
          </Section>
          <Hr style={{ margin: '32px 0' }} />
          <Text style={{ fontSize: 12, color: '#88898C', textAlign: 'center' }}>
            Asphalt Testing Solutions & Engineering, LLC · 7544 Philips Hwy · Jacksonville, FL 32256
          </Text>
        </Container>
      </Body>
    </Html>
  );
} 