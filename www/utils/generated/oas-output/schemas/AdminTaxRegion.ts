/**
 * @schema AdminTaxRegion
 * type: object
 * description: The tax region's details.
 * x-schemaName: AdminTaxRegion
 * required:
 *   - id
 *   - country_code
 *   - province_code
 *   - metadata
 *   - parent_id
 *   - created_at
 *   - updated_at
 *   - deleted_at
 *   - created_by
 *   - tax_rates
 *   - parent
 *   - children
 * properties:
 *   id:
 *     type: string
 *     title: id
 *     description: The tax region's ID.
 *   country_code:
 *     type: string
 *     title: country_code
 *     description: The tax region's country code.
 *     example: us
 *   province_code:
 *     type: string
 *     title: province_code
 *     description: The tax region's lower-case ISO 3166-2 province code.
 *     example: us-ca
 *     externalDocs:
 *       url: https://en.wikipedia.org/wiki/ISO_3166-2
 *       description: Learn more about ISO 3166-2
 *   metadata:
 *     type: object
 *     description: The tax region's metadata, can hold custom key-value pairs.
 *   parent_id:
 *     type: string
 *     title: parent_id
 *     description: The ID of the parent tax region.
 *   created_at:
 *     type: string
 *     format: date-time
 *     title: created_at
 *     description: The date the tax region was created.
 *   updated_at:
 *     type: string
 *     format: date-time
 *     title: updated_at
 *     description: The date the tax region was updated.
 *   deleted_at:
 *     type: string
 *     format: date-time
 *     title: deleted_at
 *     description: The date the tax region was deleted.
 *   created_by:
 *     type: string
 *     title: created_by
 *     description: The ID of the user that created the tax region.
 *   tax_rates:
 *     type: array
 *     description: The tax region's rates.
 *     items:
 *       $ref: "#/components/schemas/AdminTaxRate"
 *   parent:
 *     $ref: "#/components/schemas/AdminTaxRegion"
 *   children:
 *     type: array
 *     description: The tax region's children.
 *     items:
 *       $ref: "#/components/schemas/AdminTaxRegion"
 * 
*/

