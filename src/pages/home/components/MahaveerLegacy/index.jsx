import { Link } from 'react-router-dom';
import './style.scss';

const legacyImage = 'https://lh3.googleusercontent.com/aida-public/AB6AXuA7dCyQPcryo8iOdnkh5uxLruS559Rb9nt0wyo6TUXyfG2L1axlUPLlX5sCVTclZsIN2crDn8_xW951EEoco_0PjJqVDnnejRs9U7ceRG5XsbpL1oGJOBCXWegZhjA8lWON-1YMEIcPDUt8awnM7-PJ84dXRbwugNij40Ew9JqVyHjsLZ8KK-TiotjLDlc7BDLb7MQ6Gm5GKwcMK7FooeOJWk3BPFbwFTZJPDbre-wRR7RIHlvVMBHhuXiSmF3li3aghW6Ij2QQ2o4';

function MahaveerLegacy() {
  return (
    <section className="legacy" aria-labelledby="legacy-heading">
      <div className="legacy__container">
        {/* Image */}
        <div className="legacy__image-wrap">
          <img
            src={legacyImage}
            alt="Master artisan stitching leather in a traditional workshop"
            className="legacy__image"
            loading="lazy"
          />
          <div className="legacy__image-border" aria-hidden="true" />
        </div>

        {/* Text */}
        <div className="legacy__content">
          <span className="legacy__eyebrow">Our Heritage</span>
          <h2 className="legacy__heading" id="legacy-heading">
            The Mahaveer Legacy
          </h2>
          <p className="legacy__body legacy__body--lg">
            For generations, Shree Mahaveer Collections has been synonymous with
            uncompromised quality. What began as a small atelier dedicated to
            traditional trunk-making has evolved into a global symbol of
            functional luxury.
          </p>
          <p className="legacy__body">
            Our philosophy is simple: create products that tell a story. Every
            bag that leaves our workshop is a testament to the thousands of hours
            our artisans spend perfecting each stitch, ensuring that your
            Mahaveer piece remains a faithful companion for years to come.
          </p>
          <Link to="/about" className="legacy__link">
            Read Our Story
          </Link>
        </div>
      </div>
    </section>
  );
}

export default MahaveerLegacy;
