#!/usr/bin/env node

import { decorateEdges, groupDecoratedEdgesByLength } from '../lib/util/edgeProcessor.js';
import makeIcosahedron from '../lib/polyhedra/icosahedron.js';
import { DEFAULT_PRECISION } from './lib/constants.js';
import parseArgs from './lib/parseArgs.js';

const main = () => {
  const args = parseArgs();
  if (!args) process.exit();
  const {
    frequency, sizeKey, sizeValue, fullOutput, spherify,
  } = args;

  const icosahedron = makeIcosahedron();
  const polyhedron = spherify
    ? icosahedron.subdivide(frequency).spherify(sizeKey, sizeValue)
    : icosahedron.spherify(
      sizeKey,
      sizeValue * (sizeKey === 'maxLength' || sizeKey === 'minLength' ? frequency : 1),
    ).subdivide(frequency);

  const decoratedEdges = decorateEdges(polyhedron, DEFAULT_PRECISION);
  const groupedEdges = groupDecoratedEdgesByLength(decoratedEdges);

  if (fullOutput) {
    console.log(groupedEdges.map(({ edgeLength, edges }) => `Edge length: ${edgeLength}\nCount: ${edges.length}\n\t${edges.map(({ label }) => label).join('\n\t')}`).join('\n'));
  } else {
    console.log(groupedEdges.map((group) => `Length of ${group.edgeLength}: ${group.edges.length}`).join('\n'));
  }
  console.log(`TOTAL EDGES: ${decoratedEdges.length}`);
};

main();
