export type BodyObj = {
  key: string;
};

export type BodyArray = {
  key: string;
};

// get string | number ... as a type in data bu must be a typeof
export interface BodyAny {
  key: string;
  data: any;
}