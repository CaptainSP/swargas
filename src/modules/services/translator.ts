let language: string = "tr";

let translatorFunc: (key: string) => string;

export function swargasTr(key: string) {
  return translatorFunc(key);
}

export function setTranslatorFunction(func: (key: string) => string) {
  translatorFunc = func;
}