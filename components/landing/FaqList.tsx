// Always-expanded FAQ as a definition list — maximally crawlable and quotable.

export default function FaqList({
  items,
}: {
  items: { q: string; a: string }[];
}) {
  return (
    <dl className="lp-faq">
      {items.map((item) => (
        <div key={item.q}>
          <dt>{item.q}</dt>
          <dd>{item.a}</dd>
        </div>
      ))}
    </dl>
  );
}
