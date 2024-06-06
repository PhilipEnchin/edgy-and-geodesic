import Vector3 from '../models/Vector.js';
import Vertex from '../models/Vertex.js';
import intToLetter from '../util/intToLetter.js';

/**
 * @returns {Vertex}
 */
const makeOctahedron = () => {
  let i = 0;
  const top = new Vertex(intToLetter(i++), new Vector3(0, 1, 0));
  const bottom = new Vertex(intToLetter(i++), new Vector3(0, -1, 0));
  const near = new Vertex(intToLetter(i++), new Vector3(0, 0, 1));
  const far = new Vertex(intToLetter(i++), new Vector3(0, 0, -1));
  const left = new Vertex(intToLetter(i++), new Vector3(-1, 0, 0));
  const right = new Vertex(intToLetter(i++), new Vector3(1, 0, 0));

  top.connect(left).connect(right).connect(near).connect(far);
  bottom.connect(left).connect(right).connect(near).connect(far);
  left.connect(near).connect(far);
  right.connect(near).connect(far);

  return top;
};

export default makeOctahedron;
