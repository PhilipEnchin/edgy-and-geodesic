import p5 from 'p5';
import { createIncrementor, createIncrementorUI } from './util.js';
import { COLOR, UI } from './constants.js';
import makeIcosahedron from '../../lib/util/icosahedron.js';
import Vector3 from '../../lib/models/Vector.js';

/** @typedef {import('./util.js').IncrementorUI} IncrementorUI */
/** @typedef {import('../../lib/models/Vertex.js').default} Vertex */

const s = (sketch) => {
  const rowLocationIncrementor = createIncrementor(UI.MARGIN_TOP - UI.ROW_HEIGHT - UI.PADDING_INTER, -Infinity, Infinity, UI.ROW_HEIGHT + UI.PADDING_INTER);

  /** @type {IncrementorUI[]} */ const additionalUI = [];

  let gui;

  /** @type {IncrementorUI} */ let frequencyUI;

  /**
   * @returns {Vertex}
   */
  const makePolyhedron = () => {
    const icosahedron = makeIcosahedron().spherify('radius', 200);
    const subdividedIcosahedron = icosahedron.subdivide(frequencyUI.value);

    return subdividedIcosahedron;
  };

  /** @type {Vertex} */ let polyhedron;
  const updatePolyhedron = () => { polyhedron = makePolyhedron(); };

  const simpleLayout = () => {
    additionalUI.push(frequencyUI = createIncrementorUI(sketch, 'Frequency', 1, 1, 10, 1, 10, rowLocationIncrementor.increment().value, updatePolyhedron));
  };

  sketch.setup = () => {
    const canvas = sketch.createCanvas(600, 600, sketch.WEBGL);
    simpleLayout();
    polyhedron = makePolyhedron();
  };

  const renderVertices = () => {
    polyhedron.forEach(({ vector3: v }) => {
      sketch.push();
      sketch.translate(v.x, v.y, v.z);
      sketch.sphere(15);
      sketch.pop();
    });
  };

  const renderEdges = () => {
    const verticalVector = new Vector3(0, 1, 0);
    polyhedron.edges.forEach(([{ vector3: a }, { vector3: b }]) => {
      const edgeVector = b.minus(a);
      const edgeLength = a.distanceTo(b);
      const edgeCenter = a.plus(b).dividedBy(2);

      const rotationVector = edgeVector.cross(verticalVector);
      const rotationAngle = edgeVector.angleTo(verticalVector);

      sketch.push();
      sketch.translate(edgeCenter.x, edgeCenter.y, edgeCenter.z);
      if (rotationVector.magnitude) sketch.rotate(-rotationAngle, [rotationVector.x, rotationVector.y, rotationVector.z]);

      sketch.cylinder(15, edgeLength);
      sketch.pop();
    });
  };

  sketch.draw = () => {
    sketch.background(COLOR.BACKGROUND);
    sketch.fill(255);

    sketch.orbitControl();
    renderVertices();
    renderEdges();
  };
};

// eslint-disable-next-line no-new
new p5(s);
