import { sandbox } from 'wool-ui/program';
import {
  column,
  el,
  layout,
  link,
  paragraph,
  region,
  row,
  spacing,
  text,
} from 'wool-ui/elements';

const init = null;
const update = () => {};

const viewBenefit = (title, content) =>
  column(
    [spacing(28)],
    [
      el([region.heading2()], text(title)),
      ...content.map(c => paragraph([], text(c))),
    ],
  );

const view = layout(
  [],
  column(
    [spacing(110)],
    [
      column(
        [spacing(90)],
        [
          row(
            [],
            el([region.heading1()], text`wool`),
            el([], text`an ecosystem for typescript`),
          ),
          link([], { label: text`Install`, url: '/install' }),
        ],
      ),
      column(
        [spacing(50)],
        [
          row(
            [spacing(50)],
            [
              viewBenefit('Package Manager', [
                'With only TypeScript packages allowed, you can ensure your ' +
                  'project is safer and more stable.',
                'Semantic versioning is no longer human led, but defined by ' +
                  'a package’s public interface.',
              ]),
              viewBenefit('Monorepos', [
                'Structure your projects how you want, without restriction, ' +
                  'nested as deep as necessary.',
                'Each package can opt to share its version or be ' +
                  'individually versioned.',
              ]),
            ],
          ),
          row(
            [spacing(50)],
            [
              viewBenefit('Decentralised', [
                'Development is not tied to a single point of failure.',
                'Create your own registries to mirror any packages you depend ' +
                  'on, or to host your company’s private projects.',
              ]),
              viewBenefit('Free & Open Source', [
                'Wool is free and open source. Forever.',
                'Build with confidence and the guarantee bad actors can not ' +
                  'cause damage to your business.',
              ]),
            ],
          ),
        ],
      ),
    ],
  ),
);

sandbox({ init, view, update });
