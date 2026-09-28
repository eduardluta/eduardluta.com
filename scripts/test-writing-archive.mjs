import assert from 'node:assert/strict';
import test from 'node:test';
import { archivePageNumbers, archiveUrl, changeArchiveState, paginateArchive, readArchiveState } from '../src/lib/writing-archive.ts';

const essays = Array.from({ length: 23 }, (_, index) => ({ id: `essay-${index}`, category: 'essays', text: index === 22 ? 'Vetëdija dhe kodi' : `Personal essay ${index}` }));
const notes = Array.from({ length: 121 }, (_, index) => ({ id: `note-${index}`, category: 'notes', text: `Video note ${index}` }));
const all = [...essays, ...notes];
const initial = { category: 'essays', query: '', page: 1 };

test('23 personal essays produce 10, 10, and 3 distinct archive entries', () => {
  const pages = [1, 2, 3].map((page) => paginateArchive(all, { ...initial, page }));
  assert.deepEqual(pages.map((page) => [page.start, page.end, page.total, page.items.length]), [[1, 10, 23, 10], [11, 20, 23, 10], [21, 23, 23, 3]]);
  assert.deepEqual(pages.flatMap(({ items }) => items.map(({ id }) => id)), essays.map(({ id }) => id));
  assert.ok(pages.every(({ pages }) => pages === 3));
});

test('121 notes and the complete archive keep the final page within ten entries', () => {
  const notesPage = paginateArchive(all, { ...initial, category: 'notes', page: 13 });
  assert.equal(notesPage.items.length, 1);
  assert.deepEqual([notesPage.start, notesPage.end, notesPage.total], [121, 121, 121]);
  const allPage = paginateArchive(all, { ...initial, category: 'all', page: 15 });
  assert.equal(allPage.items.length, 4);
  assert.equal(allPage.total, 144);
});

test('changing the search or category on the last page resets to page one', () => {
  const lastPage = { ...initial, page: 3 };
  assert.equal(changeArchiveState(lastPage, { query: 'consciousness' }).page, 1);
  assert.equal(changeArchiveState(lastPage, { category: 'notes' }).page, 1);
  assert.equal(changeArchiveState(lastPage, { page: 2 }).page, 2);
  assert.equal(changeArchiveState(lastPage, { category: 'essays' }).page, 3);
  assert.equal(lastPage.page, 3);
});

test('search handles Albanian accents, multiple terms, category exclusions, and empty results', () => {
  const match = paginateArchive(all, { ...initial, query: '  kodi VETEDIJA  ' });
  assert.deepEqual(match.items.map(({ id }) => id), ['essay-22']);
  const empty = paginateArchive(all, { category: 'notes', query: 'vetedija', page: 13 });
  assert.deepEqual([empty.items.length, empty.total, empty.start, empty.end, empty.page, empty.pages], [0, 0, 0, 0, 1, 0]);
});

test('oversized and undersized pages clamp to available results', () => {
  assert.equal(paginateArchive(all, { ...initial, page: 99 }).page, 3);
  assert.equal(paginateArchive(all, { ...initial, page: -1 }).page, 1);
  assert.equal(paginateArchive([], { ...initial, page: 99 }).page, 1);
});

test('deep links restore filter, text, and page while preserving unrelated URL data', () => {
  const source = new URL('https://eduardluta.com/sq/writing/?utm_source=test#writing-archive-title');
  const wanted = { category: 'notes', query: 'vetëdija & code', page: 4 };
  const linked = archiveUrl(source, wanted);
  assert.deepEqual(readArchiveState(linked), wanted);
  assert.equal(linked.searchParams.get('utm_source'), 'test');
  assert.equal(linked.pathname, '/sq/writing/');
  assert.equal(linked.hash, '#writing-archive-title');
  assert.equal(source.searchParams.has('filter'), false);
});

test('history URLs restore distinct previous and next page/filter/search states', () => {
  const base = new URL('https://eduardluta.com/writing/');
  const states = [initial, { ...initial, page: 2 }, { category: 'notes', query: '', page: 1 }, { category: 'notes', query: 'video', page: 2 }];
  const history = states.map((state) => archiveUrl(base, state));
  assert.deepEqual(history.map((url) => readArchiveState(url)), states);
  assert.deepEqual(readArchiveState(history[1]), states[1]);
  assert.deepEqual(readArchiveState(history[2]), states[2]);
});

test('default state removes archive parameters and invalid URL values recover safely', () => {
  const cleaned = archiveUrl(new URL('https://eduardluta.com/writing/?filter=all&q=test&page=2'), initial);
  assert.equal(cleaned.search, '');
  for (const page of ['NaN', 'Infinity', '-2', '1.5', '0', '999999999999999999999']) {
    assert.deepEqual(readArchiveState(new URL(`https://eduardluta.com/writing/?filter=invalid&page=${page}`)), initial);
  }
});

test('numbered controls include current, first, and last pages without duplicates', () => {
  assert.deepEqual(archivePageNumbers(1, 3), [1, 2, 3]);
  assert.deepEqual(archivePageNumbers(8, 15), [1, 'gap', 7, 8, 9, 'gap', 15]);
  assert.deepEqual(archivePageNumbers(15, 15), [1, 'gap', 14, 15]);
  assert.deepEqual(archivePageNumbers(1, 0), []);
});
