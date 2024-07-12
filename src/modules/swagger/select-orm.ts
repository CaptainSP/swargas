export let selectedOrm = "typegoose";

export function selectOrm(orm: "typegoose" | "typeorm") {
  selectedOrm = orm;
}