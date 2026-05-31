interface SceneHUDProps {
  title: string;
  subtitle: string;
  phaseLabel: string;
  speedLabel: string;
  onBack: () => void;
  backLabel: string;
}

export default function SceneHUD({
  title,
  subtitle,
  phaseLabel,
  speedLabel,
  onBack,
  backLabel,
}: SceneHUDProps) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-20 p-4 lg:p-6">
      <div className="mx-auto flex w-full max-w-7xl items-start justify-between gap-3">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-secondary)]/85 px-4 py-3 backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">{subtitle}</p>
          <h2 className="text-lg font-black tracking-tight text-[var(--text-primary)] lg:text-2xl">{title}</h2>
          <div className="mt-2 flex gap-2 text-xs lg:text-sm">
            <span className="rounded-lg bg-[var(--bg-tertiary)] px-2 py-1 text-[var(--text-primary)]">{phaseLabel}</span>
            <span className="rounded-lg bg-[var(--bg-tertiary)] px-2 py-1 text-[var(--text-primary)]">{speedLabel}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="pointer-events-auto rounded-xl border border-[var(--border)] bg-[var(--bg-secondary)]/90 px-4 py-2 text-sm font-semibold text-[var(--text-primary)] backdrop-blur transition-colors hover:bg-[var(--bg-tertiary)]"
        >
          {backLabel}
        </button>
      </div>
    </div>
  );
}
