export default function SectionLabel({
  num,
  children,
}: {
  num: string;
  children: React.ReactNode;
}) {
  return (
    <p className="lp-label">
      <span className="lp-label-num">{num}</span>
      <span>{children}</span>
    </p>
  );
}
