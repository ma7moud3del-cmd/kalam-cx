/**
 * Lesson types → renderers. To add a lesson type: write a renderer ({render, wire?}) and add it here,
 * then teach check_content.py (builder repo) to check its fields.
 */
import { esc } from '../core/dom.js?v=5d6558d6';
import { videoLesson } from './video.js?v=5d6558d6';
import { readingLesson } from './reading.js?v=5d6558d6';
import { practiceLesson } from './practice.js?v=5d6558d6';
import { quizLesson } from './quiz.js?v=5d6558d6';
import { examLesson } from './exam.js?v=5d6558d6';
import { actionBar } from './common.js?v=5d6558d6';

const LESSONS = {
  video: videoLesson,
  embed: videoLesson,
  youtube: videoLesson,
  reading: readingLesson,
  practice: practiceLesson,
  quiz: quizLesson,
  exam: examLesson
};

/** Shown for a lesson type this version of the site doesn't know (instead of a blank page). */
const unknownLesson = {
  render: ctx => `<div class="card"><p>This lesson can't be shown here yet${ctx.L.type ? ` (type "${esc(ctx.L.type)}")` : ''}. Please tell the course owner.</p></div>${actionBar(ctx, '')}`
};

/** The renderer for a lesson. */
export const rendererFor = L => LESSONS[L.type] || unknownLesson;
