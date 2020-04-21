import importFromWorker from "import-from-worker";

export const checkSupport = () => {
  let supportsModuleWorker = false;
  const workerURL = URL.createObjectURL(new Blob([""]));
  const options = {
    get type() {
      supportsModuleWorker = true;
    },
  };
  new Worker(workerURL, options).terminate();
  URL.revokeObjectURL(workerURL);
  return supportsModuleWorker;
};

export default async () =>
  await importFromWorker(import.meta.url + "/../cannonWorker.js");
