import {
  JoinerRelationship,
  ModuleJoinerConfig,
} from "@medusajs/framework/types"
import {
  composeTableName,
  compressName,
  mikroOrmSoftDeletableFilterOptions,
  simpleHash,
  SoftDeletableFilterKey,
} from "@medusajs/framework/utils"

import { EntitySchema } from "@mikro-orm/core"

function getClass(...properties) {
  return class LinkModel {
    constructor(...values) {
      properties.forEach((name, idx) => {
        this[name] = values[idx]
      })
    }
  }
}

export function generateEntity(
  joinerConfig: ModuleJoinerConfig,
  primary: JoinerRelationship,
  foreign: JoinerRelationship
) {
  const fieldNames = primary.foreignKey.split(",").concat(foreign.foreignKey)

  const tableName =
    joinerConfig.databaseConfig?.tableName ??
    composeTableName(
      primary.serviceName,
      primary.foreignKey,
      foreign.serviceName,
      foreign.foreignKey
    ).toLowerCase()

  const fields = fieldNames.reduce((acc, curr) => {
    acc[curr] = {
      type: "string",
      nullable: false,
      primary: true,
    }
    return acc
  }, {})

  const extraFields = joinerConfig.databaseConfig?.extraFields ?? {}

  for (const column in extraFields) {
    fieldNames.push(column)

    fields[column] = {
      type: extraFields[column].type,
      nullable: !!extraFields[column].nullable,
      defaultRaw: extraFields[column].defaultValue,
      ...(extraFields[column].options ?? {}),
    }
  }

  const hashTableName = simpleHash(tableName)

  return new EntitySchema({
    class: getClass(
      ...fieldNames.concat("created_at", "updated_at", "deleted_at")
    ) as any,
    tableName: compressName(tableName),
    properties: {
      id: {
        type: "string",
        nullable: false,
      },
      ...fields,
      created_at: {
        columnType: "timestamptz",
        type: "date",
        nullable: false,
        defaultRaw: "CURRENT_TIMESTAMP",
      },
      updated_at: {
        columnType: "timestamptz",
        type: "date",
        nullable: false,
        defaultRaw: "CURRENT_TIMESTAMP",
      },
      deleted_at: {
        columnType: "timestamptz",
        type: "date",
        nullable: true,
      },
    },
    filters: {
      [SoftDeletableFilterKey]: mikroOrmSoftDeletableFilterOptions,
    },
    hooks: {
      beforeUpdate: [
        (args) => {
          args.entity.updated_at = new Date()
        },
      ],
    },
    indexes: [
      {
        properties: ["id"],
        name: "IDX_id_" + hashTableName,
      },
      {
        properties: primary.foreignKey.split(","),
        name:
          "IDX_" +
          primary.foreignKey.split(",").join("_") +
          "_" +
          hashTableName,
      },
      {
        properties: foreign.foreignKey,
        name: "IDX_" + foreign.foreignKey + "_" + hashTableName,
      },
      {
        properties: ["deleted_at"],
        name: "IDX_deleted_at_" + hashTableName,
      },
    ],
  })
}
