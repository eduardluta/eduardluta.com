#!/usr/bin/env python3
"""Check built or deployed sitemap pages against their server-rendered JSON-LD.

Usage:
  python3 scripts/check-structured-data.py
  python3 scripts/check-structured-data.py --dist dist/client
  python3 scripts/check-structured-data.py --base https://eduardluta.com

This is a regression check, not Google's eligibility test. It checks visible
HTML support (including expandable fallback content), not computed CSS,
third-party playback, the truth of source material, or Google indexing.
"""

import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from functools import lru_cache
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from urllib.parse import parse_qs, unquote, urljoin, urlsplit
from urllib.request import Request, urlopen
import xml.etree.ElementTree as ET


VOID_TAGS = set('area base br col embed hr img input link meta param source track wbr'.split())
PAGE_TYPES = {'WebPage', 'ProfilePage', 'CollectionPage', 'AboutPage', 'ContactPage'}
ARTICLE_TYPES = {'Article', 'BlogPosting', 'NewsArticle'}


def normalized(text):
    return ' '.join(str(text).split())


def types(node):
    value = node.get('@type', [])
    return set(value if isinstance(value, list) else [value])


def walk(value):
    if isinstance(value, dict):
        yield value
        for child in value.values():
            yield from walk(child)
    elif isinstance(value, list):
        for child in value:
            yield from walk(child)


class PageHTML(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.canonicals = []
        self.json_blocks = []
        self.text = []
        self.images = []
        self.article_images = []
        self.frames = []
        self.authors = []
        self.times = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        parent_hidden = self.stack[-1]['hidden'] if self.stack else False
        style = re.sub(r'\s+', '', attrs.get('style', '')).lower()
        hidden = parent_hidden or tag in {'head', 'script', 'style', 'template'} or (
            'hidden' in attrs or attrs.get('aria-hidden') == 'true' or
            'display:none' in style or 'visibility:hidden' in style
        )
        entry = {'tag': tag, 'attrs': attrs, 'hidden': hidden, 'text': []}
        if tag == 'link' and 'canonical' in attrs.get('rel', '').split():
            self.canonicals.append(attrs.get('href', ''))
        if not hidden:
            if tag == 'img':
                self.images.append(attrs.get('src', ''))
                if any(entry['tag'] == 'article-video' or
                       'article-body' in entry['attrs'].get('class', '').split()
                       for entry in self.stack):
                    self.article_images.append(attrs.get('src', ''))
            elif tag == 'iframe':
                self.frames.append(attrs)
        if tag not in VOID_TAGS:
            self.stack.append(entry)

    def handle_startendtag(self, tag, attrs):
        self.handle_starttag(tag, attrs)
        if tag not in VOID_TAGS:
            self.handle_endtag(tag)

    def handle_data(self, data):
        for entry in self.stack:
            entry['text'].append(data)
        if self.stack and not self.stack[-1]['hidden']:
            self.text.append(data)

    def handle_endtag(self, tag):
        for index in range(len(self.stack) - 1, -1, -1):
            if self.stack[index]['tag'] == tag:
                closed = self.stack[index:]
                del self.stack[index:]
                for entry in reversed(closed):
                    attrs = entry['attrs']
                    content = normalized(''.join(entry['text']))
                    if entry['tag'] == 'script' and attrs.get('type') == 'application/ld+json':
                        self.json_blocks.append(''.join(entry['text']))
                    if not entry['hidden'] and content:
                        if entry['tag'] == 'a' and 'author' in attrs.get('rel', '').split():
                            self.authors.append((attrs.get('href', ''), content))
                        elif entry['tag'] == 'time':
                            self.times.append((attrs.get('datetime', ''), content))
                return


class Source:
    def __init__(self, dist, base):
        self.dist = Path(dist).resolve()
        self.base = base.rstrip('/') + '/' if base else None

    def location(self, url):
        parts = urlsplit(url)
        if self.base:
            return urljoin(self.base, parts.path.lstrip('/'))
        path = self.dist / unquote(parts.path).lstrip('/')
        if parts.path.endswith('/') or not path.suffix:
            path = path / 'index.html'
        path = path.resolve()
        if path != self.dist and self.dist not in path.parents:
            raise ValueError('URL escapes the build directory')
        return path

    def request(self, url, method='GET'):
        request = Request(str(url), method=method, headers={'User-Agent': 'EduardLutaStructuredDataCheck/1.0'})
        return urlopen(request, timeout=30)

    def read(self, url):
        location = self.location(url)
        if self.base:
            with self.request(location) as response:
                if response.status != 200:
                    raise ValueError('HTTP {}'.format(response.status))
                return response.read().decode('utf-8')
        return location.read_text(encoding='utf-8')

    @lru_cache(maxsize=None)
    def asset_error(self, url):
        try:
            if not self.base:
                path = self.location(url)
                return None if path.is_file() and path.stat().st_size else 'missing or empty local asset'
            with self.request(self.location(url), 'HEAD') as response:
                if response.status != 200:
                    return 'HTTP {}'.format(response.status)
                if not response.headers.get('Content-Type', '').lower().startswith('image/'):
                    return 'response is not an image'
            return None
        except Exception as exc:
            return str(exc)


def sitemap_urls(source, sitemap='/sitemap-index.xml', seen=None):
    seen = set() if seen is None else seen
    if sitemap in seen:
        raise ValueError('Sitemap cycle: {}'.format(sitemap))
    seen.add(sitemap)
    tree = ET.fromstring(source.read(sitemap))
    kind = tree.tag.rsplit('}', 1)[-1]
    locations = [element.text.strip() for element in tree.iter()
                 if element.tag.rsplit('}', 1)[-1] == 'loc' and element.text]
    if kind == 'sitemapindex':
        result = []
        for location in locations:
            result.extend(sitemap_urls(source, location, seen))
        return result
    if kind != 'urlset':
        raise ValueError('Unsupported sitemap root: {}'.format(kind))
    return locations


def image_urls(value):
    if isinstance(value, str):
        return [value]
    if isinstance(value, list):
        return [url for item in value for url in image_urls(item)]
    if isinstance(value, dict):
        return image_urls(value.get('contentUrl') or value.get('url') or '')
    return []


def check_page(url, source):
    errors = []
    counts = Counter(pages=1)
    try:
        html = PageHTML()
        html.feed(source.read(url))
        html.close()
    except Exception as exc:
        return counts, ['Cannot read page: {}'.format(exc)]

    if html.canonicals != [url]:
        errors.append('Canonical must match sitemap URL exactly: {!r}'.format(html.canonicals))
    body = normalized(' '.join(html.text))
    visible_images = {urljoin(url, image) for image in html.images}
    article_images = {urljoin(url, image) for image in html.article_images}
    times = {value for value, text in html.times if text}
    nodes = []
    for index, raw in enumerate(html.json_blocks, 1):
        try:
            parsed = json.loads(raw)
            if not isinstance(parsed, dict) or parsed.get('@context') != 'https://schema.org':
                errors.append('JSON-LD block {} needs the schema.org context object'.format(index))
                continue
            graph = parsed.get('@graph', [parsed])
            if not isinstance(graph, list) or not all(isinstance(node, dict) for node in graph):
                errors.append('JSON-LD @graph must be an array of nodes')
                continue
            nodes.extend(graph)
        except (ValueError, TypeError) as exc:
            errors.append('Invalid JSON-LD block {}: {}'.format(index, exc))
    if not nodes:
        errors.append('No JSON-LD nodes found')
        return counts, errors
    counts['json_ld_blocks'] += len(html.json_blocks)

    definitions = {}
    for node in walk(nodes):
        identity = node.get('@id')
        if identity is not None:
            if not isinstance(identity, str) or not identity.startswith('https://'):
                errors.append('Node @id must be an absolute HTTPS URL: {!r}'.format(identity))
                continue
            if len(node) > 1:
                if identity in definitions:
                    errors.append('Duplicate node definition: {}'.format(identity))
                definitions[identity] = node
    for node in walk(nodes):
        if set(node) == {'@id'} and node['@id'] not in definitions:
            errors.append('Unresolved @id reference: {}'.format(node['@id']))

    site_root = '{}://{}/'.format(urlsplit(url).scheme, urlsplit(url).netloc)
    pages = [node for node in nodes if types(node) & PAGE_TYPES]
    if len(pages) != 1:
        errors.append('Expected one page node; found {}'.format(len(pages)))
    for shared_type in ('WebSite', 'Person'):
        count = sum(shared_type in types(node) for node in nodes)
        if count != 1:
            errors.append('Expected one {} node; found {}'.format(shared_type, count))
    for page in pages:
        if page.get('isPartOf') != {'@id': site_root + '#website'}:
            errors.append('Page isPartOf must reference the shared WebSite')
    for node in nodes:
        node_types = types(node)
        fragment = None
        if node_types & PAGE_TYPES:
            fragment = 'webpage'
        elif node_types & ARTICLE_TYPES:
            fragment = 'article'
        elif 'VideoObject' in node_types:
            fragment = 'video'
        elif 'BreadcrumbList' in node_types:
            fragment = 'breadcrumb'
        if fragment and node.get('@id') != url + '#' + fragment:
            errors.append('{} @id must use the page canonical'.format(fragment))
        if (node_types & (PAGE_TYPES | ARTICLE_TYPES)) and node.get('url') != url:
            errors.append('Page/article url differs from canonical')
        if 'WebSite' in node_types and node.get('@id') != site_root + '#website':
            errors.append('WebSite @id must use the shared site identity')
        if 'Person' in node_types and node.get('@id') != site_root + '#person':
            errors.append('Person @id must use the shared author identity')

    def check_images(value, label):
        urls = image_urls(value)
        if value and not urls:
            errors.append('{} has no usable image URL'.format(label))
        for image in urls:
            absolute = urljoin(url, image)
            if 'og-default' in urlsplit(absolute).path:
                errors.append('{} uses the generic social card'.format(label))
            if absolute not in visible_images:
                errors.append('{} image not found in visible HTML: {}'.format(label, image))
            if urlsplit(absolute).netloc != urlsplit(url).netloc:
                errors.append('{} image must be a verifiable local asset: {}'.format(label, image))
            else:
                issue = source.asset_error(absolute)
                if issue:
                    errors.append('{} image asset failed: {} ({})'.format(label, image, issue))

    for article in [node for node in nodes if types(node) & ARTICLE_TYPES]:
        counts['articles'] += 1
        author = article.get('author', {})
        person = definitions.get(author.get('@id')) if isinstance(author, dict) else None
        if not person or 'Person' not in types(person):
            errors.append('Article author must resolve to a Person')
        elif not any(name == normalized(person.get('name', '')) and
                     urljoin(url, href) in {person.get('url'), site_root + 'sq/'}
                     for href, name in html.authors):
            errors.append('Article author needs a visible matching rel=author byline link')
        for field in ('datePublished', 'dateModified'):
            value = article.get(field)
            if field == 'datePublished' and not value:
                errors.append('Article is missing datePublished')
            if value and value not in times:
                errors.append('{} has no matching visible <time datetime>: {}'.format(field, value))
        if article_images and not article.get('image'):
            errors.append('Article has visible body/poster imagery but is missing schema.image')
        elif not article_images:
            counts['image_free_articles'] += 1
        if article.get('image'):
            counts['article_images'] += 1
            for image in image_urls(article['image']):
                if urljoin(url, image) not in article_images:
                    errors.append('Article image must appear in its body or original-video component')
        check_images(article.get('image'), 'Article')
        main_page = article.get('mainEntityOfPage', {})
        if main_page != {'@id': url + '#webpage'}:
            errors.append('Article mainEntityOfPage must reference the canonical page node')
        if pages and pages[0].get('mainEntity') != {'@id': article.get('@id')}:
            errors.append('Page mainEntity must reference its article')

    for video in [node for node in nodes if 'VideoObject' in types(node)]:
        counts['videos'] += 1
        for field in ('name', 'description', 'thumbnailUrl', 'uploadDate', 'embedUrl'):
            if not video.get(field):
                errors.append('VideoObject is missing {}'.format(field))
        for field in ('name', 'description'):
            if normalized(video.get(field, '')) not in body:
                errors.append('Video {} is absent from visible page text'.format(field))
        try:
            uploaded = datetime.fromisoformat(video.get('uploadDate', '').replace('Z', '+00:00'))
            if 'T' not in video['uploadDate'] or uploaded.tzinfo is None:
                raise ValueError('timezone missing')
        except (ValueError, TypeError, KeyError):
            errors.append('Video uploadDate needs a real ISO timestamp with timezone')
        if video.get('uploadDate') not in times:
            errors.append('Video uploadDate has no matching visible <time datetime>')
        if video.get('duration') and video['duration'] not in times:
            errors.append('Video duration has no matching visible <time datetime>')
        embed = video.get('embedUrl', '')
        matching = [frame for frame in html.frames if urljoin(url, frame.get('src', '')) == embed]
        if not matching:
            errors.append('Video embedUrl has no matching initially rendered visible iframe')
        elif not all(normalized(frame.get('title', '')) for frame in matching):
            errors.append('Video iframe needs a nonempty accessible title')
        if parse_qs(urlsplit(embed).query).get('autoplay') != ['0']:
            errors.append('Video embedUrl must explicitly set autoplay=0')
        check_images(video.get('thumbnailUrl'), 'Video thumbnail')

    for profile in [node for node in nodes if 'ProfilePage' in types(node)]:
        counts['profiles'] += 1
        entity = profile.get('mainEntity', {})
        person = definitions.get(entity.get('@id')) if isinstance(entity, dict) else None
        if not person or 'Person' not in types(person):
            errors.append('ProfilePage mainEntity must resolve to a Person')
        else:
            if not person.get('image'):
                errors.append('Profile Person is missing its visible portrait')
            check_images(person.get('image'), 'Profile portrait')
    return counts, errors


def safe_check_page(url, source):
    try:
        return check_page(url, source)
    except Exception as exc:
        return Counter(pages=1), ['Could not validate malformed page data: {}'.format(exc)]


def main():
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument('--dist', default='dist/client', help='Built client directory (default: dist/client)')
    parser.add_argument('--base', help='Fetch sitemap, pages, and images from this HTTPS site instead')
    parser.add_argument('--workers', type=int, default=8, help='Concurrent page checks (default: 8)')
    args = parser.parse_args()
    if args.base and (urlsplit(args.base).scheme != 'https' or not urlsplit(args.base).netloc or
                      urlsplit(args.base).path not in ('', '/') or urlsplit(args.base).query or urlsplit(args.base).fragment):
        parser.error('--base must be an HTTPS site origin, for example https://eduardluta.com')
    if args.workers < 1:
        parser.error('--workers must be positive')
    source = Source(args.dist, args.base)
    try:
        urls = sitemap_urls(source)
        if not urls:
            raise ValueError('Sitemap contains no pages')
        if len(urls) != len(set(urls)):
            raise ValueError('Sitemap contains duplicate page URLs')
    except Exception as exc:
        print('FAIL: Cannot read complete sitemap: {}'.format(exc), file=sys.stderr)
        return 1
    totals = Counter()
    failed = 0
    error_count = 0
    with ThreadPoolExecutor(max_workers=args.workers) as pool:
        for url, (counts, errors) in zip(urls, pool.map(lambda url: safe_check_page(url, source), urls)):
            totals.update(counts)
            if errors:
                failed += 1
                error_count += len(errors)
                print('FAIL {}'.format(url))
                for error in errors:
                    print('  - {}'.format(error))
    print('{}: {} pages, {} articles, {} videos, {} profiles, {} JSON-LD blocks; {} errors on {} pages.'.format(
        'PASS' if not error_count else 'FAIL', totals['pages'], totals['articles'], totals['videos'],
        totals['profiles'], totals['json_ld_blocks'], error_count, failed))
    print('Article image coverage: {} with schema.image; {} without visible body/poster imagery.'.format(
        totals['article_images'], totals['image_free_articles']))
    return 1 if error_count else 0


if __name__ == '__main__':
    sys.exit(main())
