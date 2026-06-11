const interactiveSelector =
  'a, button, input, select, textarea, label, summary, [role="button"], [role="link"]';

export function isInteractiveTarget(target: EventTarget | null) {
  return (
    target instanceof Element && Boolean(target.closest(interactiveSelector))
  );
}
