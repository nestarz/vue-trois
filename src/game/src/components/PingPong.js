import { reactive, h, unref, ref, computed, watch, shallowRef } from "vue";

import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

import Object3D from "vue-three-fiber/components/Object3D.js";
import { useLoader } from "vue-three-fiber/hooks/useLoader.js";
import { useMouse } from "game/hooks/useMouse.js";

import {
  useSphere,
  useBox,
  usePlane,
  useFrame,
} from "vue-cannon/hooks/useCannon.js";

import { lerp, clamp } from "game/utils/math.js";

const pingSound = "/src/game/assets/pingpong/sounds/ping.mp3";
const earthImg = "/src/game/assets/pingpong/textures/cross.jpg";
const pingpongGlb = "/src/game/assets/pingpong/models/pingpong.glb";

const ping = new Audio(pingSound);
const store = reactive({
  count: 0,
  welcome: true,
  api: {
    pong(velocity) {
      ping.currentTime = 0;
      ping.volume = clamp(velocity / 20, 0, 1);
      ping.play();
      if (velocity > 4) set((state) => ({ count: state.count + 1 }));
    },
    reset: (welcome) =>
      set((state) => ({ welcome, count: welcome ? state.count : 0 })),
  },
});

const useGroup = ({ position, rotation, scale, childs }) => {
  const group = new THREE.Group();
  if (position) group.position.set(...unref(position));
  if (rotation) group.rotation.set(...unref(rotation));
  if (scale) group.scale.set(...unref(scale));
  if (childs && childs.length) group.add(...unref(childs));
  return group;
};

const Paddle = {
  setup() {
    const {
      api: { pong },
      welcome,
      count,
    } = store;

    const model = ref();
    const bodyConfig = {
      type: "Kinematic",
      mass: 0,
      position: [1.7, 50, 50],
      args: [10, 1, 13.5],
      onCollide: (e) => pong(e.contact.impactVelocity),
    };
    const bodies = useBox(() => bodyConfig, model);
    const mouse = useMouse();
    const values = { x: 0, y: 0 };
    watch([mouse.x, mouse.y], () => {
      if (!bodies.value) return;
      const body = bodies.value[0];
      const {
        x: { value: x },
        y: { value: y },
      } = mouse;

      values.x = lerp(values.x, (x * Math.PI) / 5, 0.2);
      values.y = lerp(values.y, (x * Math.PI) / 5, 0.2);
      body.position.set(x * 10, 10 -y * 5, 0);
      // body.rotation.set(0, 0, values.y);
      model.value.rotation.x = lerp(
        model.value.rotation.x,
        welcome ? Math.PI / 2 : 0,
        0.2
      );
      model.value.rotation.y = values.x;
    });

    const { results: gltf } = useLoader(GLTFLoader, pingpongGlb);
    const group = computed(() => {
      if (!gltf.value) {
        return new THREE.Group();
      }

      const { nodes, materials } = gltf.value;
      return useGroup({
        rotation: [0, -0.04, 0],
        scale: [1, 1, 1],
        childs: [
          useGroup({
            rotation: [1.88, -0.35, 2.32],
            scale: [2.97, 2.97, 2.97],
            childs: [
              nodes.Bone,
              nodes.Bone003,
              nodes.Bone006,
              nodes.Bone010,
              Object.assign(
                new THREE.SkinnedMesh(
                  nodes.arm.geometry,
                  Object.assign(materials.glove, { roughness: 1 })
                ),
                { skeleton: nodes.arm.skeleton }
              ),
            ],
          }),
          useGroup({
            rotation: [0, -0.04, 0],
            scale: [141.94, 141.94, 141.94],
            childs: [
              new THREE.Mesh(nodes.mesh_0.geometry, materials.wood),
              new THREE.Mesh(nodes.mesh_1.geometry, materials.side),
              new THREE.Mesh(nodes.mesh_2.geometry, materials.foam),
              new THREE.Mesh(nodes.mesh_3.geometry, materials.lower),
              new THREE.Mesh(nodes.mesh_4.geometry, materials.upper),
            ],
          }),
        ],
      });
    });

    return () => h(Object3D, { value: group.value, objectRef: model });
  },
};

const Ball = {
  setup() {
    const ball = shallowRef();
    useSphere(() => ({ mass: 1, position: [0, 5, 0] }), ball);

    const { results: map } = useLoader(THREE.TextureLoader, earthImg);
    watch(map, () => {
      if (ball.value.material.map) ball.value.material.map.dispose();
      // ball.value.material.map = map.value; // TODO: Fix issue
      ball.value.material.needsUpdate = true;
    });

    return () =>
      h(Object3D, {
        objectRef: ball,
        value: new THREE.Mesh(
          new THREE.SphereBufferGeometry(0.5, 64, 64),
          new THREE.MeshStandardMaterial()
        ),
      });
  },
};

const ContactGround = {
  setup() {
    const { reset } = store;
    const ground = ref();
    usePlane(
      () => ({
        type: "Static",
        rotation: [-Math.PI / 2, 0, 0],
        position: [0, -10, 0],
        onCollide: (i) => reset(true),
      }),
      ground
    );

    return () =>
      h(Object3D, {
        value: new THREE.Mesh(),
        meshRef: ground,
      });
  },
};

export default {
  setup() {
    return () => [h(ContactGround), h(Ball), h(Paddle)];
  },
};
