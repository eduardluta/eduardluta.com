export const WRITING_PAGE_SIZE = 10;

export type ArchiveCategory = 'essays' | 'notes' | 'all';
export type ArchiveState = { category: ArchiveCategory; query: string; page: number };
export type ArchiveItem = { category: string; text: string };

export function normalizeArchiveText(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

export function readArchiveState(url: URL, defaultCategory: ArchiveCategory = 'essays'): ArchiveState {
  const category = url.searchParams.get('filter');
  const rawPage = url.searchParams.get('page') ?? '1';
  return {
    category: category === 'essays' || category === 'notes' || category === 'all' ? category : defaultCategory,
    query: url.searchParams.get('q') ?? '',
    page: /^\d+$/.test(rawPage) && Number.isSafeInteger(Number(rawPage)) ? Math.max(1, Number(rawPage)) : 1,
  };
}

export function changeArchiveState(state: ArchiveState, change: Partial<ArchiveState>): ArchiveState {
  const filtersChanged = (change.category !== undefined && change.category !== state.category)
    || (change.query !== undefined && change.query !== state.query);
  return { ...state, ...change, page: filtersChanged ? 1 : change.page ?? state.page };
}

/** Keep unrelated URL parameters intact and omit the default archive state. */
export function archiveUrl(url: URL, state: ArchiveState, defaultCategory: ArchiveCategory = 'essays'): URL {
  const next = new URL(url);
  for (const [key, value] of [
    ['filter', state.category === defaultCategory ? '' : state.category],
    ['q', state.query],
    ['page', state.page > 1 ? String(state.page) : ''],
  ]) {
    if (value) next.searchParams.set(key, value);
    else next.searchParams.delete(key);
  }
  return next;
}

export function paginateArchive<T extends ArchiveItem>(items: readonly T[], state: ArchiveState) {
  const words = normalizeArchiveText(state.query).trim().split(/\s+/).filter(Boolean);
  const matches = items.filter((item) => (state.category === 'all' || item.category === state.category)
    && words.every((word) => normalizeArchiveText(item.text).includes(word)));
  const pages = Math.ceil(matches.length / WRITING_PAGE_SIZE);
  const page = Math.min(Math.max(1, state.page), Math.max(1, pages));
  const offset = (page - 1) * WRITING_PAGE_SIZE;
  return {
    items: matches.slice(offset, offset + WRITING_PAGE_SIZE),
    total: matches.length,
    page,
    pages,
    start: matches.length ? offset + 1 : 0,
    end: Math.min(offset + WRITING_PAGE_SIZE, matches.length),
  };
}

/** A short page list stays usable on narrow screens, including a 15-page archive. */
export function archivePageNumbers(page: number, pages: number): (number | 'gap')[] {
  const visible = new Set([1, pages, page - 1, page, page + 1].filter((number) => number > 0 && number <= pages));
  const sorted = [...visible].sort((a, b) => a - b);
  const result: (number | 'gap')[] = [];
  sorted.forEach((number, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && number - previous === 2) result.push(previous + 1);
    else if (previous !== undefined && number - previous > 2) result.push('gap');
    result.push(number);
  });
  return result;
}
