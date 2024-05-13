import Vector3 from '../models/Vector.js';
import Vertex from '../models/Vertex.js';

const toSequentialLetter = (n) => {
  const A = 65;
  return String.fromCharCode(n + A).toUpperCase();
};

const VERTEX_COUNT = 12;

/**
 * @returns {Vertex}
 */
const makeIcosahedron = () => {
  const PHI = (1 + Math.sqrt(5)) / 2;
  let key = 0;
  const vertices = [...Array(VERTEX_COUNT)].map((_, i) => {
    const A = 0;
    const B = 2 * (i % 2) - 1;
    const C = (2 * (Math.floor(i / 2) % 2) - 1) * PHI;
    if (i < VERTEX_COUNT / 3) return new Vertex(toSequentialLetter(key++), new Vector3(A, B, C));
    if (i < 2 * VERTEX_COUNT / 3) return new Vertex(toSequentialLetter(key++), new Vector3(B, C, A));
    return new Vertex(toSequentialLetter(key++), new Vector3(C, A, B));
  });

  vertices[0]
    .connect(vertices[1])
    .connect(vertices[8])
    .connect(vertices[4])
    .connect(vertices[5])
    .connect(vertices[10]);
  vertices[1]
    .connect(vertices[0])
    .connect(vertices[8])
    .connect(vertices[6])
    .connect(vertices[7])
    .connect(vertices[10]);
  vertices[2]
    .connect(vertices[3])
    .connect(vertices[9])
    .connect(vertices[4])
    .connect(vertices[5])
    .connect(vertices[11]);
  vertices[3]
    .connect(vertices[2])
    .connect(vertices[9])
    .connect(vertices[6])
    .connect(vertices[7])
    .connect(vertices[11]);
  vertices[4]
    .connect(vertices[0])
    .connect(vertices[5])
    .connect(vertices[2])
    .connect(vertices[9])
    .connect(vertices[8]);
  vertices[5]
    .connect(vertices[0])
    .connect(vertices[4])
    .connect(vertices[2])
    .connect(vertices[11])
    .connect(vertices[10]);
  vertices[6]
    .connect(vertices[1])
    .connect(vertices[7])
    .connect(vertices[3])
    .connect(vertices[9])
    .connect(vertices[8]);
  vertices[7]
    .connect(vertices[1])
    .connect(vertices[6])
    .connect(vertices[3])
    .connect(vertices[11])
    .connect(vertices[10]);
  vertices[8]
    .connect(vertices[0])
    .connect(vertices[1])
    .connect(vertices[6])
    .connect(vertices[9])
    .connect(vertices[4]);
  vertices[9]
    .connect(vertices[2])
    .connect(vertices[3])
    .connect(vertices[4])
    .connect(vertices[6])
    .connect(vertices[8]);
  vertices[10]
    .connect(vertices[0])
    .connect(vertices[1])
    .connect(vertices[5])
    .connect(vertices[7])
    .connect(vertices[11]);
  vertices[11]
    .connect(vertices[2])
    .connect(vertices[3])
    .connect(vertices[5])
    .connect(vertices[7])
    .connect(vertices[10]);

  return vertices[0];
};

export default makeIcosahedron;
