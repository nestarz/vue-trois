import importFromWorker from "import-from-worker";

export default async () =>
  await importFromWorker(import.meta.url + "/../cannonWorker.js");
