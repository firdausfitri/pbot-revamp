export const PBOT_CONTEXT_EVENT = "pbot:context-update";

const CARD_SELECTOR = "[data-pbot-subject], [data-pbot-topic]";

function emitContextUpdate(detail) {
  window.dispatchEvent(new CustomEvent(PBOT_CONTEXT_EVENT, { detail }));
}

function extractPatchFromCard(card) {
  const subject = card.getAttribute("data-pbot-subject");
  const topic = card.getAttribute("data-pbot-topic");

  return {
    ...(subject ? { subject } : {}),
    ...(topic ? { topic } : {}),
  };
}

function tryEmitFromTarget(target) {
  if (!(target instanceof Element)) {
    return false;
  }

  const card = target.closest(CARD_SELECTOR);
  if (!card) {
    return false;
  }

  const patch = extractPatchFromCard(card);
  if (!patch.subject && !patch.topic) {
    return false;
  }

  emitContextUpdate(patch);
  return true;
}

export function attachStaticCardContextHook(root = document) {
  function onClick(event) {
    tryEmitFromTarget(event.target);
  }

  function onKeyDown(event) {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    const emitted = tryEmitFromTarget(event.target);
    if (emitted) {
      event.preventDefault();
    }
  }

  root.addEventListener("click", onClick);
  root.addEventListener("keydown", onKeyDown);

  return () => {
    root.removeEventListener("click", onClick);
    root.removeEventListener("keydown", onKeyDown);
  };
}
