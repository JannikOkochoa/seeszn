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
        <span className="lp-answer-tick tl" aria-hidden="true" />
        <span className="lp-answer-tick tr" aria-hidden="true" />
        <span className="lp-answer-tick bl" aria-hidden="true" />
        <span className="lp-answer-tick br" aria-hidden="true" />
        <p className="lp-answer-q">{question}</p>
        <p className="lp-answer-a">{body}</p>
      </div>
    </section>
  );
}
