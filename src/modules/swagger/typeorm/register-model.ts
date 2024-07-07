import { type } from "os";
import { AppDataSource } from "../../../../../../data-source";
import { swagger } from "../swagger";

export function registerModel(model: any) {
  const metadata = AppDataSource.getMetadata(model);
  const columns = metadata.ownColumns;

  const properties = getProperties(columns);
  addOneToManys(properties, metadata.oneToManyRelations);
  addManyToOnes(properties, metadata.manyToOneRelations);
  addOneToOnes(properties, metadata.oneToOneRelations);
  
  swagger.components.schemas[model.name] = {
    type: "object",
    properties: properties,
  };
  console.log(swagger)
}

function addOneToManys(properties: any, relations: any) {
  for (const relation of relations) {
    const constuctor = new relation.type();
    const name = constuctor.constructor.name;
    properties[relation.propertyPath] = {
      type: "array",
      items: {
        $ref: `#/components/schemas/${name}`,
      },
    };
  }
}

function addManyToOnes(properties: any, relations: any) {
  for (const relation of relations) {
    const constuctor = new relation.type();
    const name = constuctor.constructor.name;
    properties[relation.propertyPath] = {
      type: "object",
      $ref: `#/components/schemas/${name}`,
    };
  }
}

function addOneToOnes(properties: any, relations: any) {
  for (const relation of relations) {
    const constuctor = new relation.type();
    const name = constuctor.constructor.name;
    properties[relation.propertyPath] = {
      type: "object",
      $ref: `#/components/schemas/${name}`,
    };
  }
}

function getProperties(columns: any) {
  const properties: any = {};
  for (const column of columns) {
    let type = getTypeFromTypeof(column.type());
    let items = undefined;
    let ref = undefined;

    if (type == "array") {
      type = "array";

      items = {
        type: type,
        $ref: getTypeOrRef(column),
      };
    } else if (type == "mixed") {
      type = "object";
    }

    properties[column.propertyPath] = {
      type: type,
      required: column.isRequired,
      items: items,
      $ref: ref,
    };
  }
  return properties;
}

function getTypeOrRef(path: any) {
  if (path.options.ref) {
    // is function ref
    if (path.options.ref == Function) {
      return `#/components/schemas/${path.options.ref().name}`;
    }
    // is string ref
    return `#/components/schemas/${path.options.ref}`;
  } else {
    if (path.caster?.options?.ref) {
      // is function ref
      if (path.caster.options.ref == Function) {
        return `#/components/schemas/${path.caster.options.ref().name}`;
      }
      // is string ref
      return `#/components/schemas/${path.caster.options.ref}`;
    } else {
      return undefined;
    }
  }
}

function getTypeFromTypeof(path: any) {
  // evulate if its is function
  if (typeof path == "object" && Array.isArray(path)) {
    return "array";
  }
  return typeof path;
}
