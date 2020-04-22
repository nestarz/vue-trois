import { shallowRef } from "vue";

const blackList = [
  "id",
  "uuid",
  "type",
  "children",
  "parent",
  "matrix",
  "matrixWorld",
  "matrixWorldNeedsUpdate",
  "modelViewMatrix",
  "normalMatrix",
];

function prune(props) {
  const reducedProps = { ...props };
  // Remove black listed props
  blackList.forEach((name) => delete reducedProps[name]);
  // Remove functions
  Object.keys(reducedProps).forEach(
    (name) =>
      typeof reducedProps[name] === "function" && delete reducedProps[name]
  );
  // Prune materials and geometries
  if (reducedProps.material)
    reducedProps.material = prune(reducedProps.material);
  if (reducedProps.geometry)
    reducedProps.geometry = prune(reducedProps.geometry);
  // Return cleansed object
  return reducedProps;
}

const restructureGltf = (data) => {
  // This has to be deprecated at some point!
  data.__$ = [];
  // Nodes and materials are better
  data.nodes = {};
  data.materials = {};
  data.scene.traverse((obj) => {
    data.__$.push(prune(obj));
    if (obj.name) data.nodes = { ...data.nodes, [obj.name]: obj };
    if (obj.material && !data.materials[obj.material.name])
      data.materials[obj.material.name] = obj.material;
  });
};

export const useLoader = (loaderProto, url) => {
  const loader = new loaderProto();
  const urlArray = Array.isArray(url) ? url : [url];
  const results = shallowRef(Array.isArray(url) ? [] : null);

  Promise.all(
    urlArray.map(
      (url) =>
        new Promise((res) =>
          loader.load(url, (data) => {
            if (data.scene) restructureGltf(data);
            res(data);
          })
        )
    )
  ).then((values) => {
    results.value = values.length === 1 ? values[0] : values;
  });

  return { results };
};
