const vueCompile = (string) => {
  const script = /<script.*>((.|\n)*?)<\/script>/g.exec(string);
  const template = /<template.*>((.|\n)*?)<\/template>/gi.exec(string);
  const style = /<style[^>]*>((.|\n)*?)<\/style>/gi.exec(string);
  return script[1].replace(
    "export default {",
    `export default { template: \`${
      style ? style[0] + template[1] : template[1]
    }\`,`
  );
};

importShim.fetch = async function (url) {
  const response = await fetch(url);
  if (response.url.endsWith(".vue")) {
    const source = await response.text();
    const transformed = vueCompile(source);
    return new Response(
      new Blob([transformed], { type: "application/javascript" })
    );
  }
  return response;
};
