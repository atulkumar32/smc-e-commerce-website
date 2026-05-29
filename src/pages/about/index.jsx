import './style.scss';

function AboutPage() {
  return (
    <div className="about-page">
      {/* Page Hero */}
      <div className="about-page__hero">
        <span className="about-page__eyebrow">Our Heritage</span>
        <h1 className="about-page__title">About Shree Mahaveer Collections</h1>
        <p className="about-page__subtitle">
          The pinnacle of artisanal heritage and contemporary elegance.
          Handcrafted for those who demand excellence.
        </p>
      </div>

      {/* Story */}
      <section className="about-page__section">
        <div className="about-page__container">
          <div className="about-page__story">
            <div className="about-page__story-text">
              <h2 className="about-page__section-title">The Mahaveer Legacy</h2>
              <p>
                For generations, Shree Mahaveer Collections has been synonymous
                with uncompromised quality. What began as a small atelier
                dedicated to traditional trunk-making has evolved into a global
                symbol of functional luxury.
              </p>
              <p>
                Our philosophy is simple: create products that tell a story.
                Every bag that leaves our workshop is a testament to the
                thousands of hours our artisans spend perfecting each stitch,
                ensuring that your Mahaveer piece remains a faithful companion
                for years to come.
              </p>
            </div>
            <div className="about-page__story-img-wrap">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuA7dCyQPcryo8iOdnkh5uxLruS559Rb9nt0wyo6TUXyfG2L1axlUPLlX5sCVTclZsIN2crDn8_xW951EEoco_0PjJqVDnnejRs9U7ceRG5XsbpL1oGJOBCXWegZhjA8lWON-1YMEIcPDUt8awnM7-PJ84dXRbwugNij40Ew9JqVyHjsLZ8KK-TiotjLDlc7BDLb7MQ6Gm5GKwcMK7FooeOJWk3BPFbwFTZJPDbre-wRR7RIHlvVMBHhuXiSmF3li3aghW6Ij2QQ2o4"
                alt="Artisan crafting a leather bag"
                className="about-page__story-img"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="about-page__section about-page__section--dark">
        <div className="about-page__container">
          <h2 className="about-page__section-title about-page__section-title--light">
            Our Values
          </h2>
          <div className="about-page__values">
            {[
              { title: 'Craftsmanship', desc: 'Every stitch is placed with intention, every material chosen with care.' },
              { title: 'Sustainability', desc: 'We source responsibly and build products designed to last a lifetime.' },
              { title: 'Heritage', desc: 'Rooted in tradition, we honour the artisanal techniques passed down through generations.' },
            ].map((v) => (
              <div key={v.title} className="about-page__value-card">
                <h3 className="about-page__value-title">{v.title}</h3>
                <p className="about-page__value-desc">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
