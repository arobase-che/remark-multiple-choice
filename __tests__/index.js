import {readFileSync as file} from 'fs';
import {join} from 'path';
import unified from 'unified';

import test from 'ava';
import raw from 'rehype-raw';
import reParse from 'remark-parse';
import stringify from 'rehype-stringify';
import remark2rehype from 'remark-rehype';

import plugin from '../app';

const render = text => unified()
  .use(reParse)
  .use(plugin)
  .use(remark2rehype)
  .use(stringify)
  .processSync(text);

const renderRaw = text => unified()
  .use(reParse)
  .use(plugin)
  .use(remark2rehype, {allowDangerousHTML: true})
  .use(raw)
  .use(stringify)
  .processSync(text);

test('simple', t => {
  const {contents} = render(`
 - [x] ! False
 - [ ] ~ None
 - [x] = True`);
  t.is(contents, '');
});

test('mchoide', t => {
  const {contents} = render(file(join(__dirname, 'mchoice.md')));
  t.snapshot(contents);
});

test('mchoide-raw', t => {
  const {contents} = renderRaw(file(join(__dirname, 'mchoice-raw.md')));
  t.snapshot(contents);
});

test.todo('all checked');
test.todo('none checked');
test.todo('caps checked');
test.todo('enpty square brackets');
test.todo('every kind of checked');

test.todo('Citation in a multiple-choice');
test.todo('Feedback feature test');

test.todo('raw render');

test.todo('Error about check');
test.todo('Error about list');
test.todo('Error about space');

test.todo('with brackets for single choice');

test.todo('real test 1');
test.todo('real test 2');
test.todo('real test 3');
