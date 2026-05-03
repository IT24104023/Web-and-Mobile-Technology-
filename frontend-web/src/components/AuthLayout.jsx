function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="auth-shell">
      <header className="auth-header">
        <div className="brand">Dent AI</div>
      </header>

      <main className="auth-main">
        <section className="auth-visual">
          <div className="overlay" />
          <div className="visual-copy">
            <p>Precision Care Ecosystem</p>
            <h1>
              Redefining clinical transparency through <em>AI precision</em>.
            </h1>
            <div className="line" />
          </div>
        </section>

        <section className="auth-form-panel">
          <div className="auth-form-wrap">
            <p className="eyebrow">{subtitle}</p>
            <h2>{title}</h2>
            {children}
          </div>
        </section>
      </main>

      <footer className="auth-footer">
        <p>Copyright 2026 Dent AI Clinical Systems. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default AuthLayout;
