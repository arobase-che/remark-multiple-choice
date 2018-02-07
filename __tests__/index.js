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
  t.is(contents,
`<fieldset class="mc check" id="mc_0"><ul>\
<li><input checked type="checkbox" id="mc_0_0" class="!"><label for="mc_0_0">False</label></li>\
<li><input type="checkbox" id="mc_0_1" class="~"><label for="mc_0_1">None</label></li>\
<li><input checked type="checkbox" id="mc_0_2" class="="><label for="mc_0_2">True</label></li>\
</ul><input onclick="check(&#x27;mc_0&#x27;,[0,0.5,1])" value="Validate" type="button"></fieldset>`);
});

test('mchoide-snap', t => {
  const {contents} = render(file(join(__dirname, 'mchoice.md')));
  t.snapshot(contents);
});

test('all-checked', t => {
  const {contents} = render(`
 - [x] ! False
 - [x] ~ None
 - [x] = True`);
  t.is(contents,
`<fieldset class="mc check" id="mc_0"><ul>\
<li><input checked type="checkbox" id="mc_0_0" class="!"><label for="mc_0_0">False</label></li>\
<li><input checked type="checkbox" id="mc_0_1" class="~"><label for="mc_0_1">None</label></li>\
<li><input checked type="checkbox" id="mc_0_2" class="="><label for="mc_0_2">True</label></li>\
</ul><input onclick="check(&#x27;mc_0&#x27;,[0,0.5,1])" value="Validate" type="button"></fieldset>`);
});

test('none-checked', t => {
  const {contents} = render(`
 - [ ] ! False
 - [ ] ~ None
 - [ ] = True`);
  t.is(contents,
`<fieldset class="mc check" id="mc_0"><ul>\
<li><input type="checkbox" id="mc_0_0" class="!"><label for="mc_0_0">False</label></li>\
<li><input type="checkbox" id="mc_0_1" class="~"><label for="mc_0_1">None</label></li>\
<li><input type="checkbox" id="mc_0_2" class="="><label for="mc_0_2">True</label></li>\
</ul><input onclick="check(&#x27;mc_0&#x27;,[0,0.5,1])" value="Validate" type="button"></fieldset>`);
});

test('caps-checked', t => {
  const {contents} = render(`
 - [X] ! False
 - [X] ~ None
 - [X] = True`);
  t.is(contents,
`<fieldset class="mc check" id="mc_0"><ul>\
<li><input checked type="checkbox" id="mc_0_0" class="!"><label for="mc_0_0">False</label></li>\
<li><input checked type="checkbox" id="mc_0_1" class="~"><label for="mc_0_1">None</label></li>\
<li><input checked type="checkbox" id="mc_0_2" class="="><label for="mc_0_2">True</label></li>\
</ul><input onclick="check(&#x27;mc_0&#x27;,[0,0.5,1])" value="Validate" type="button"></fieldset>`);
});

test('empty-square-check', t => {
  const {contents} = render(`
 - [] ! False
 - [] ~ None
 - [] = True`);
  t.is(contents,
`<fieldset class="mc check" id="mc_0"><ul>\
<li><input type="checkbox" id="mc_0_0" class="!"><label for="mc_0_0">False</label></li>\
<li><input type="checkbox" id="mc_0_1" class="~"><label for="mc_0_1">None</label></li>\
<li><input type="checkbox" id="mc_0_2" class="="><label for="mc_0_2">True</label></li>\
</ul><input onclick="check(&#x27;mc_0&#x27;,[0,0.5,1])" value="Validate" type="button"></fieldset>`);
});

test('multi-check', t => {
  const {contents} = render(`
 - [X] = caps
 - [] ! empty
 - [ ] ! space
 - [x] = checkmark`);
  t.is(contents,
`<fieldset class="mc check" id="mc_0"><ul>\
<li><input checked type="checkbox" id="mc_0_0" class="="><label for="mc_0_0">caps</label></li>\
<li><input type="checkbox" id="mc_0_1" class="!"><label for="mc_0_1">empty</label></li>\
<li><input type="checkbox" id="mc_0_2" class="!"><label for="mc_0_2">space</label></li>\
<li><input checked type="checkbox" id="mc_0_3" class="="><label for="mc_0_3">checkmark</label></li>\
</ul><input onclick="check(&#x27;mc_0&#x27;,[1,0,0,1])" value="Validate" type="button"></fieldset>`);
});

test('mchoide-raw-snap', t => {
  const {contents} = renderRaw(file(join(__dirname, 'mchoice-raw.md')));
  t.snapshot(contents);
});

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
