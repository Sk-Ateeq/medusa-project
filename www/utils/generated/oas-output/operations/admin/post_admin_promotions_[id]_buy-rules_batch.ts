/**
 * @oas [post] /admin/promotions/{id}/buy-rules/batch
 * operationId: PostPromotionsIdBuyRulesBatch
 * summary: Manage the Buy Rules of a Promotion
 * x-sidebar-summary: Manage Buy Rules
 * description: Manage the buy rules of a `buyget` promotion to create, update, or delete them.
 * x-authenticated: true
 * parameters:
 *   - name: id
 *     in: path
 *     description: The promotion's ID.
 *     required: true
 *     schema:
 *       type: string
 *   - name: fields
 *     in: query
 *     description: Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default
 *       fields. without prefix it will replace the entire default fields.
 *     required: false
 *     schema:
 *       type: string
 *       title: fields
 *       description: Comma-separated fields that should be included in the returned data. if a field is prefixed with `+` it will be added to the default fields, using `-` will remove it from the default
 *         fields. without prefix it will replace the entire default fields.
 *       externalDocs:
 *         url: "#select-fields-and-relations"
 * security:
 *   - api_token: []
 *   - cookie_auth: []
 *   - jwt_token: []
 * requestBody:
 *   content:
 *     application/json:
 *       schema:
 *         type: object
 *         description: The buy rules to create, update, or delete.
 *         properties:
 *           create:
 *             type: array
 *             description: The buy rules to create.
 *             items:
 *               $ref: "#/components/schemas/AdminCreatePromotionRule"
 *           update:
 *             type: array
 *             description: The buy rules to update.
 *             items:
 *               $ref: "#/components/schemas/AdminUpdatePromotionRule"
 *           delete:
 *             type: array
 *             description: The buy rules to delete.
 *             items:
 *               type: string
 *               title: delete
 *               description: A buy rule's ID.
 * x-codeSamples:
 *   - lang: Shell
 *     label: cURL
 *     source: |-
 *       curl -X POST '{backend_url}/admin/promotions/{id}/buy-rules/batch' \
 *       -H 'Authorization: Bearer {access_token}'
 * tags:
 *   - Promotions
 * responses:
 *   "200":
 *     description: OK
 *     content:
 *       application/json:
 *         schema:
 *           type: object
 *           description: The result of the batch operations.
 *           required:
 *             - created
 *             - updated
 *             - deleted
 *           properties:
 *             created:
 *               type: array
 *               description: The created buy rules.
 *               items:
 *                 $ref: "#/components/schemas/AdminPromotionRule"
 *             updated:
 *               type: array
 *               description: The updated buy rules.
 *               items:
 *                 $ref: "#/components/schemas/AdminPromotionRule"
 *             deleted:
 *               type: object
 *               description: The details of the deleted buy rules.
 *               required:
 *                 - ids
 *                 - object
 *                 - deleted
 *               properties:
 *                 ids:
 *                   type: array
 *                   description: The IDs of the buy rules that were deleted.
 *                   items:
 *                     type: string
 *                     title: ids
 *                     description: A buy rule's ID.
 *                 object:
 *                   type: string
 *                   title: object
 *                   description: The name of the object that was deleted.
 *                   default: promotion-rule
 *                 deleted:
 *                   type: boolean
 *                   title: deleted
 *                   description: Whether the buy rules were deleted.
 *   "400":
 *     $ref: "#/components/responses/400_error"
 *   "401":
 *     $ref: "#/components/responses/unauthorized"
 *   "404":
 *     $ref: "#/components/responses/not_found_error"
 *   "409":
 *     $ref: "#/components/responses/invalid_state_error"
 *   "422":
 *     $ref: "#/components/responses/invalid_request_error"
 *   "500":
 *     $ref: "#/components/responses/500_error"
 * x-workflow: batchPromotionRulesWorkflow
 * x-events: []
 * 
*/

