import * as THREE from "three";
const temp = new THREE.Object3D();

export const computeMatrix = ({ position, quaternion }) => {
  temp.position.copy(position);
  temp.quaternion.copy(quaternion);
  temp.updateMatrix();
  return temp.matrix.toArray();
};
