#!/usr/bin/env node

import { decorateEdges, groupDecoratedEdgesByLength } from '../lib/util/edgeProcessor.js';
import makeIcosahedron from '../lib/util/icosahedron.js';
import { DEFAULT_PRECISION } from './lib/constants.js';
import parseArgs from './lib/parseArgs.js';

const main = () => {
  const args = parseArgs();
  if (!args) process.exit();
  const {
    frequency, sizeKey, sizeValue, fullOutput,
  } = args;

  const icosahedron = makeIcosahedron();
  const subdivided = icosahedron.subdivide(frequency);
  const sphere = subdivided.spherify(sizeKey, sizeValue);

  const decoratedEdges = decorateEdges(sphere, DEFAULT_PRECISION);
  const groupedEdges = groupDecoratedEdgesByLength(decoratedEdges);

  if (fullOutput) {
    console.log(groupedEdges.map(({ edgeLength, edges }) => `Edge length: ${edgeLength}\nCount: ${edges.length}\n\t${edges.map(({ label }) => label).join('\n\t')}`).join('\n'));
  } else {
    console.log(groupedEdges.map((group) => `Length of ${group.edgeLength}: ${group.edges.length}`).join('\n'));
  }
  console.log(`TOTAL EDGES: ${decoratedEdges.length}`);
};

main();
