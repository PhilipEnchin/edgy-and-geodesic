import Vector3 from '../models/Vector.js';
import Vertex from '../models/Vertex.js';

/**
 * @returns {Vertex}
 */
const makeIcosahedron = () => {
  const PHI = (1 + Math.sqrt(5)) / 2;
  let key = 10;
  const vertices = [...Array(12)].map((_, i) => {
    const A = 0;
    const B = 2 * (i % 2) - 1;
    const C = (2 * (Math.floor(i / 2) % 2) - 1) * PHI;
    if (i < 4) return new Vertex((key++).toString(36).toUpperCase(), new Vector3(A, B, C));
    if (i < 8) return new Vertex((key++).toString(36).toUpperCase(), new Vector3(B, C, A));
    return new Vertex((key++).toString(36).toUpperCase(), new Vector3(C, A, B));
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
