export function splitType(param: any) {
  if (typeof param == "string") {
    const splitted = param.split("|");
    if (splitted.length > 0) {
      return splitted[0];
    }
  }
  return param;
}
