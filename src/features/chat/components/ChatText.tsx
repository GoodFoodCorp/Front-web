import { Fragment } from 'react';

/** **bold** spans of one line, as React elements (never as HTML). */
function inline(line: string) {
  return line.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4 ? (
      <strong key={i} className="font-semibold text-neutral-900">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

const BULLET = /^\s*[-•*]\s+/;

/**
 * The assistant writes a little Markdown (bold, "- " lists). Shown as text
 * with that formatting only: nothing it writes can become markup.
 */
export function ChatText({ content }: { content: string }) {
  const lines = content.split('\n');
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length === 0) return;
    out.push(
      <ul key={`ul-${out.length}`} className="my-1 list-disc space-y-0.5 pl-5">
        {bullets.map((b, i) => (
          <li key={i}>{inline(b)}</li>
        ))}
      </ul>,
    );
    bullets = [];
  };
  lines.forEach((line, i) => {
    if (BULLET.test(line)) {
      bullets.push(line.replace(BULLET, ''));
      return;
    }
    flush();
    out.push(
      line.trim() === '' ? (
        <span key={i} className="block h-2" />
      ) : (
        <span key={i} className="block">
          {inline(line)}
        </span>
      ),
    );
  });
  flush();
  return <>{out}</>;
}
