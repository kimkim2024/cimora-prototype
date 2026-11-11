import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { COMPOSER_MODEL, COMPOSER_MODES } from '../../data/home';

/**
 * The composer under the carousel: pick a format, describe the idea, pick a
 * model. The studio does the real work, so sending hands over to it with the
 * text kept in this browser's session.
 */
export function Composer() {
  const [mode, setMode] = useState<(typeof COMPOSER_MODES)[number]>('Comic');
  const [text, setText] = useState('');
  const navigate = useNavigate();

  const send = () => {
    if (!text.trim()) return;
    try {
      sessionStorage.setItem('cimora:home-idea', text.trim());
    } catch {
      // private mode: the idea just does not carry over
    }
    navigate('/app');
  };

  return (
    <section className="container-page pt-8">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          send();
        }}
        className="mx-auto max-w-[760px] wide:max-w-[860px] mega:max-w-[960px] rounded-2xl border border-hairline bg-paper p-4 shadow-card"
      >
        <div role="group" aria-label="Choose a format" className="flex items-center gap-1.5">
          {COMPOSER_MODES.map((option) => {
            const active = option === mode;
            return (
              <button
                key={option}
                type="button"
                aria-pressed={active}
                onClick={() => setMode(option)}
                className={
                  'h-8 rounded-full px-3.5 text-[12px] font-medium transition-colors ' +
                  (active ? 'bg-accent text-ink-on-accent' : 'text-ink-muted hover:bg-paper-muted hover:text-ink')
                }
              >
                {option}
              </button>
            );
          })}
        </div>

        <label htmlFor="home-idea" className="sr-only">
          Describe your idea
        </label>
        <textarea
          id="home-idea"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={2}
          placeholder="Write an idea to start your story / type @ to mention a character, scene, or prop"
          className="mt-3 w-full resize-none bg-transparent px-1 text-[14px] leading-[1.7] text-ink outline-none placeholder:text-ink-quiet"
        />

        <div className="mt-2 flex items-center gap-2">
          <button
            type="button"
            aria-label="Add a reference"
            className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-ink-muted transition-colors hover:border-ink hover:text-ink"
          >
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              <path d="M12 5v14M5 12h14" />
            </svg>
          </button>

          <span className="inline-flex h-9 items-center gap-2 rounded-full bg-ink px-3 text-[12px] text-ink-inverse">
            <span className="grid h-5 w-5 place-items-center rounded-full bg-ink-inverse/15 text-[10px] font-semibold">
              A
            </span>
            {COMPOSER_MODEL.name}
            <span className="text-ink-inverse/60">· {COMPOSER_MODEL.tier}</span>
          </span>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label="Voice input (demo)"
              className="grid h-9 w-9 place-items-center rounded-full border border-hairline text-ink-muted transition-colors hover:border-ink hover:text-ink"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
                <path d="M12 4a2.5 2.5 0 012.5 2.5v5a2.5 2.5 0 01-5 0v-5A2.5 2.5 0 0112 4zM6.5 11a5.5 5.5 0 0011 0M12 17v3" />
              </svg>
            </button>
            <button
              type="submit"
              aria-label="Start ideating"
              className="grid h-9 w-9 place-items-center rounded-full bg-ink text-ink-inverse transition-transform hover:scale-105 active:scale-95"
            >
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M12 19V5M6 11l6-6 6 6" />
              </svg>
            </button>
          </div>
        </div>
      </form>
    </section>
  );
}
