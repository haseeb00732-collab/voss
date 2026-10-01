/** Inline SVG avoids iOS substituting emoji fonts for Unicode arrows. */
export function ArrowIcon({ direction = 'up-right' }: { direction?: 'up-right' | 'right' | 'left' | 'down' | 'up' | 'refresh' }) {
  const rotation = { 'up-right': 0, right: 45, down: 135, left: 225, up: -45, refresh: 0 }[direction];
  return <svg className="v-arrow-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false" style={{ display: 'inline-block', verticalAlign: '-0.12em', flexShrink: 0 }}>
    {direction === 'refresh' ? <path d="M20 7v5h-5M19.6 11a8 8 0 1 0-1.9 6.7M20 12l-2-5" /> : <path d="M5 19 19 5M5 5h14v14" transform={`rotate(${rotation} 12 12)`} />}
  </svg>;
}
