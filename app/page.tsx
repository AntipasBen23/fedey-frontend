import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="landing-page" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', textAlign: 'center' }}>
      <div className="hero animate-fade-in-up" style={{ padding: '4rem 2rem', maxWidth: '800px', width: '100%', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: 'clamp(2.5rem, 8vw, 5rem)', lineHeight: '1.1', color: 'var(--text)', marginBottom: '1.5rem' }}>
          Hi, I am Furci <span className="animate-float">🤖</span><br />
          <span style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', color: 'var(--primary-strong)', display: 'block', marginTop: '0.5rem' }}>your professional social media manager.</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--muted)', margin: '0 auto 2.5rem', maxWidth: '60ch' }}>
          I handle your content, community, and strategy seamlessly entirely on autopilot. 
          Ready to scale your online presence to new heights?
        </p>
        <Link 
          href="/hire" 
          className="btn-pulse"
          style={{
            display: 'inline-block',
            padding: '1.2rem 3.5rem',
            fontSize: '1.3rem',
            fontWeight: '700',
            color: '#05345a',
            background: 'linear-gradient(180deg, #8fd1ff, var(--primary-strong))',
            borderRadius: '999px',
            textDecoration: 'none',
            transition: 'transform 0.2s',
          }}
        >
          Hire me
        </Link>
      </div>
    </div>
  );
}
