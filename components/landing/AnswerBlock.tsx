// A short, self-contained definition placed high on the page so AI answer
// systems can quote it directly. Rendered as plain crawlable text.

export default function AnswerBlock({
  question,
  body,
}: {
  question: string;
  body: string;
}) {
  return (
    <section className="lp-answer" aria-label={question}>
      <div className="lp-answer-inner">
        <p className="lp-answer-q">{question}</p>
        <p className="lp-answer-a">{body}</p>
      </div>
    </section>
  );
}
