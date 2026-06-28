    import './index.scss';

function UpcomingPage() {
  return (
    <div className="upcoming-page">
      <div className="background-animation">
        <span /><span /><span /><span /><span />
      </div>

      <div className="content">
        <div className="logo-circle">
          <span>SMC</span>
        </div>

        <h1>Shree Mahaveer Collections</h1>
        <h2>🚀 Website Launching Soon</h2>

        <p>
          We are working hard to bring you a premium collection of school bags,
          backpacks, trolley bags, lunch bags, and accessories.
        </p>

        <div className="countdown-box">
          <div className="box">
            <h3>100+</h3>
            <span>Products</span>
          </div>
          <div className="box">
            <h3>24/7</h3>
            <span>Support</span>
          </div>
          <div className="box">
            <h3>100%</h3>
            <span>Quality</span>
          </div>
        </div>

        <button className="notify-btn">Coming Soon</button>
      </div>
    </div>
  );
}

export default UpcomingPage;
