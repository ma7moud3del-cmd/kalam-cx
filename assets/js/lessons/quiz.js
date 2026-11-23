/**
 * Module tests: one-try-per-question multiple choice, marked instantly with the reason.
 * Answers are saved per question id + revision (see progress/store.js), so changing a question's "rev" clears old answers.
 */
import { $, esc } from '../core/dom.js?v=5d6558d6';
import { Store } from '../progress/store.js?v=5d6558d6';

/** One question as a fieldset of option buttons; answered questions show the result and explanation. */
export function questionCard(c, q, n, tot) {
  const a = Store.answer(c.id, q.id, q.rev), done = a !== undefined;
  const opt = (o, j) => {
    const cls = done ? (j === q.a ? 'ok' : j === a ? 'no' : '') : '';
    const sr = done ? (j === q.a ? '<span class="sr"> (correct answer)</span>' : j === a ? '<span class="sr"> (your answer, incorrect)</span>' : '') : '';
    return `<button type="button" class="o ${cls}" data-q="${esc(q.id)}" data-j="${j}" ${done ? 'aria-disabled="true"' : ''}><span class="k" aria-hidden="true">${'ABCD'[j]}</span><span>${esc(o)}${sr}</span></button>`;
  };
  return `<fieldset class="q" id="q-${esc(q.id)}"><legend><span class="qn">Question ${n + 1} of ${tot}</span><span class="qt">${esc(q.q)}</span></legend><div class="opts">${q.o.map(opt).join('')}</div>
  ${done ? `<p class="ex" tabindex="-1"><b>${a === q.a ? 'Correct.' : 'Not quite.'}</b> ${esc(q.e)}</p>` : ''}</fieldset>`;
}

export const quizLesson = {
  render(ctx) {
    const { L, F } = ctx;
    return `<div id="test"><p class="sub">${L.questions.length} questions. Pass mark ${L.pass}. Each answer is marked instantly, with the reason.</p>${L.note ? `<p class="note left">${esc(L.note)}</p>` : ''}
      <div class="scorecard"><div class="ring" aria-hidden="true"><svg viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" class="trk"/><circle cx="18" cy="18" r="15.9" class="val" id="ring"/></svg><b id="rn">0</b></div><div><b class="score" id="score" role="status" aria-live="polite"></b><button class="link btnlink" data-act="reset">Start over</button>${F.testPdf ? ` · <a class="link" href="${esc(F.testPdf)}" target="_blank" rel="noopener">Printable test</a>` : ''}</div></div>
      <div class="quiz" id="quiz"></div></div>`;
  },
  wire(ctx) {
    const { c, L } = ctx, Q = L.questions, tot = Q.length;
    const draw = () => { $('#quiz').innerHTML = Q.map((q, n) => questionCard(c, q, n, tot)).join(''); score(); };
    function score() {
      const ans = Q.map(q => Store.answer(c.id, q.id, q.rev)), done = ans.filter(a => a !== undefined).length, ok = Q.filter((q, n) => ans[n] === q.a).length;
      $('#score').innerHTML = done === 0 ? 'Answer the first question to begin.'
        : `${ok} of ${done} correct` + (done < tot ? ` · ${tot - done} to go` : ok >= L.pass ? ' <span class="pass">· Passed</span>' : ` <span class="fail">· Pass mark is ${L.pass}. Review and try again.</span>`);
      $('#ring').style.strokeDasharray = Math.round(100 * ok / tot) + ' 100'; $('#rn').textContent = ok;
      if (done === tot) Store.setDone(c.id, L.id);
      ctx.refresh();
    }
    draw();
    $('#test').addEventListener('click', e => {
      const b = e.target.closest('button.o');
      if (b && b.getAttribute('aria-disabled') !== 'true') {
        const q = Q.find(y => y.id === b.dataset.q);
        Store.setAnswer(c.id, q.id, q.rev, +b.dataset.j);
        const card = document.getElementById(`q-${q.id}`);
        card.outerHTML = questionCard(c, q, Q.indexOf(q), tot); score();
        document.getElementById(`q-${q.id}`).querySelector('.ex').focus();
      }
      if (e.target.closest('[data-act="reset"]')) { Store.reset(c.id, Q.map(y => y.id)); draw(); $('#quiz .o')?.focus(); }
    });
  }
};
