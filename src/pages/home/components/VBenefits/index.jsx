import { useStaggerReveal } from '../../../../components/StaggerReveal';

const ITEMS = [
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 5v3h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
    title: 'Free Shipping',
    sub: 'On orders above ₹999',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/><polyline points="16 7 12 3 8 7"/></svg>,
    title: 'Easy Returns',
    sub: 'Within 7 days',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    title: 'Secure Payments',
    sub: '100% safe & secure',
  },
  {
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 16.9v3a2 2 0 01-2.2 2A19.8 19.8 0 013.1 5.2 2 2 0 015.1 3h3a2 2 0 012 1.7 12.8 12.8 0 00.7 2.8 2 2 0 01-.5 2.1l-1.3 1.3a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.5 12.8 12.8 0 002.8.7A2 2 0 0122 16.9z"/></svg>,
    title: 'Dedicated Support',
    sub: "We're here to help",
  },
];

export default function VBenefits() {
  const gridRef = useStaggerReveal({
    selector: '.v-benefits__item',
    staggerDelay: 90,
  });

  return (
    <div className="v-benefits">
      <div className="v-benefits__container">
        <div className="v-benefits__grid" ref={gridRef}>
          {ITEMS.map((item) => (
            <div key={item.title} className="v-benefits__item">
              <span className="v-benefits__icon">{item.icon}</span>
              <div>
                <p className="v-benefits__title stagger-text">{item.title}</p>
                <p className="v-benefits__sub stagger-text">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
