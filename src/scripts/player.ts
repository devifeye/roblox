//src/scripts/player.ts
// Opens the shared <dialog> player. Builds the iframe/video with DOM APIs only (no innerHTML),
// and only from URLs that were validated at build time.

const ALLOWED_EMBED_HOSTS = new Set(['www.youtube-nocookie.com', 'player.vimeo.com']);

function safeEmbed(raw: string): string | null {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && ALLOWED_EMBED_HOSTS.has(url.hostname) ? url.toString() : null;
  } catch {
    return null;
  }
}

function safeFile(raw: string): string | null {
  if (raw.startsWith('/') && !raw.startsWith('//')) return raw;
  try {
    return new URL(raw).protocol === 'https:' ? raw : null;
  } catch {
    return null;
  }
}

export function initPlayer() {
  const dialog = document.getElementById('player') as HTMLDialogElement | null;
  if (!dialog) return;
  const stage = dialog.querySelector<HTMLElement>('[data-player-stage]')!;
  const title = dialog.querySelector<HTMLElement>('#player-title')!;
  const desc = dialog.querySelector<HTMLElement>('[data-player-desc]')!;
  let opener: HTMLElement | null = null;

  function open(trigger: HTMLElement) {
    const d = trigger.dataset;
    const embed = d.playEmbed ? safeEmbed(d.playEmbed) : null;
    const file = d.playFile ? safeFile(d.playFile) : null;
    if (!embed && !file) return;

    opener = trigger;
    title.textContent = d.playTitle ?? '';
    desc.textContent = d.playDescription ?? '';
    dialog!.classList.toggle('is-wide', d.playAspect === '16:9');
    dialog!.classList.toggle('is-square', d.playAspect === '1:1');
    stage.replaceChildren();

    if (embed) {
      const iframe = document.createElement('iframe');
      iframe.src = embed;
      iframe.title = d.playTitle ?? 'Video player';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      stage.append(iframe);
    } else if (file) {
      const video = document.createElement('video');
      video.src = file;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.preload = 'auto';
      if (d.playPoster) video.poster = d.playPoster;
      stage.append(video);
    }

    dialog!.showModal();
  }

  dialog.addEventListener('close', () => {
    // Removing the media element stops playback and frees memory.
    stage.replaceChildren();
    opener?.focus();
  });

  // Click on the backdrop (outside the panel) closes the player.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  dialog.querySelector('[data-player-close]')?.addEventListener('click', () => dialog.close());

  document.addEventListener('click', (event) => {
    const trigger = (event.target as HTMLElement).closest<HTMLElement>('[data-play-title]');
    if (!trigger || dialog.contains(trigger)) return;
    event.preventDefault();
    open(trigger);
  });
}
