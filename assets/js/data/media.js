/**
 * Where videos and their pictures come from. This is the ONLY place that turns a lesson into a playable address,
 * so moving videos to another host is a data change (or one new provider here), never a change to the pages.
 *
 * Today:
 *  - type "video": an MP4 file. A relative "src" is read from the course folder, or from "mediaBase"
 *    (course.json, else catalog platform.mediaBase) when the files live on another host such as Cloudflare R2.
 *  - type "embed": any host's own player page (Cloudflare Stream, Bunny, Vimeo…) in an iframe, from "embed".
 *  - type "youtube": kept only for the existing Expert Picks collection.
 *
 * To add a host with its own lesson type, call registerProvider('stream', {...}) with the same shape as below.
 */
import { App } from './catalog.js?v=8e241242';
import { esc } from '../core/dom.js?v=8e241242';

const ABS = /^(https?:)?\/\//;
const FALLBACK_THUMB = 'img/kalam-mark.png';

/** Address of a media file (video, poster, reading image). Relative paths get mediaBase + the course folder. */
export function mediaUrl(c, p) {
  if (!p) return '';
  if (ABS.test(p)) return p;
  const base = c.mediaBase || (App.cat && App.cat.platform && App.cat.platform.mediaBase) || '';
  return base + (c.base || '') + p;
}

/**
 * @typedef {object} Provider
 * @property {'file'|'frame'} kind  file = played by our own <video> player; frame = the host's player in an iframe
 * @property {(c:object, L:object, opts?:{autoplay?:boolean}) => string} src
 * @property {(c:object, L:object) => string} [thumb]   picture for cards
 * @property {(L:object) => ({href:string,label:string}|null)} [external]   "Open on …" link for the pop-up player
 */

/** @type {Record<string, Provider>} */
const PROVIDERS = {
  video: {
    kind: 'file',
    src: (c, L) => mediaUrl(c, L.src),
    thumb: (c, L) => L.poster ? mediaUrl(c, L.poster) : FALLBACK_THUMB
  },
  embed: {
    kind: 'frame',
    src: (c, L) => L.embed || '',
    thumb: (c, L) => L.poster ? mediaUrl(c, L.poster) : FALLBACK_THUMB
  },
  youtube: {
    kind: 'frame',
    src: (c, L, o = {}) => `https://www.youtube-nocookie.com/embed/${encodeURIComponent(L.yt)}?rel=0${o.autoplay ? '&autoplay=1' : ''}`,
    thumb: (c, L) => `https://i.ytimg.com/vi/${encodeURIComponent(L.yt)}/hqdefault.jpg`,
    external: L => ({ href: 'https://www.youtube.com/watch?v=' + encodeURIComponent(L.yt), label: 'Open on YouTube' })
  }
};

/** Add or replace a video host. The lesson "type" in course.json picks the provider. */
export function registerProvider(type, provider) { PROVIDERS[type] = provider; }
/** The provider for a lesson, or null when the lesson isn't a video. */
export const providerOf = L => PROVIDERS[L.type] || null;
/** True when the lesson plays in the host's own player (we can't read its progress). */
export const isFramed = L => providerOf(L)?.kind === 'frame';

/** Iframe address for a framed lesson ('' for files). */
export const frameSrc = (c, L, autoplay = false) => isFramed(L) ? providerOf(L).src(c, L, { autoplay }) : '';
/** The iframe markup for a framed lesson. */
export const frameHtml = (c, L, autoplay = false) =>
  `<iframe src="${esc(frameSrc(c, L, autoplay))}" title="${esc(L.title)} (video)" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`;
/** Address of the video file for a file lesson. */
export const fileSrc = (c, L) => providerOf(L)?.kind === 'file' ? providerOf(L).src(c, L) : '';
/** Card picture for a video lesson (already safe to put in an attribute after esc()). */
export const thumbOf = (c, L) => (providerOf(L)?.thumb || PROVIDERS.video.thumb)(c, L);
/** "Open on …" link for the pop-up player, or null. */
export const externalLink = L => providerOf(L)?.external?.(L) || null;
