import Vector3 from '../models/Vector.js';
import Vertex from '../models/Vertex.js';
import intToLetter from '../util/intToLetter.js';

const ROOT_2 = Math.sqrt(2);
const ROOT_3 = Math.sqrt(3);
const ROOT_6 = ROOT_2 * ROOT_3;

/**
 * @returns {Vertex}
 */
const makeTetrahedron = () => {
  let i = 0;
  const top = new Vertex(intToLetter(i++), new Vector3(0, 1, 0));
  const near = new Vertex(intToLetter(i++), new Vector3(0, -1 / 3, 2 * ROOT_2 / 3));
  const left = new Vertex(intToLetter(i++), new Vector3(-ROOT_6 / 3, -1 / 3, -ROOT_2 / 3));
  const right = new Vertex(intToLetter(i++), new Vector3(ROOT_6 / 3, -1 / 3, -ROOT_2 / 3));

  top.connect(left.connect(right)).connect(right.connect(near)).connect(near.connect(left));

  return top;
};

export default makeTetrahedron;
