import {
  Context,
  DAL,
  FilterableProductOptionValueProps,
  FindConfig,
  IEventBusModuleService,
  InferEntityType,
  InternalModuleDeclaration,
  ModuleJoinerConfig,
  ModulesSdkTypes,
  ProductTypes,
} from "@medusajs/framework/types"
import {
  Product,
  ProductCategory,
  ProductCollection,
  ProductImage,
  ProductOption,
  ProductOptionValue,
  ProductTag,
  ProductType,
  ProductVariant,
} from "@models"
import { ProductCategoryService } from "@services"

import {
  arrayDifference,
  EmitEvents,
  generateEntityId,
  InjectManager,
  InjectTransactionManager,
  isDefined,
  isPresent,
  isString,
  isValidHandle,
  kebabCase,
  MedusaContext,
  MedusaError,
  MedusaService,
  Modules,
  ProductStatus,
  removeUndefined,
  toHandle,
} from "@medusajs/framework/utils"
import { ProductRepository } from "../repositories"
import {
  UpdateCategoryInput,
  UpdateCollectionInput,
  UpdateProductInput,
  UpdateProductOptionInput,
  UpdateProductVariantInput,
  UpdateTagInput,
  UpdateTypeInput,
} from "../types"
import { eventBuilders } from "../utils"
import { joinerConfig } from "./../joiner-config"

type InjectedDependencies = {
  baseRepository: DAL.RepositoryService
  productRepository: ProductRepository
  productService: ModulesSdkTypes.IMedusaInternalService<any, any>
  productVariantService: ModulesSdkTypes.IMedusaInternalService<any, any>
  productTagService: ModulesSdkTypes.IMedusaInternalService<any>
  productCategoryService: ProductCategoryService
  productCollectionService: ModulesSdkTypes.IMedusaInternalService<any>
  productImageService: ModulesSdkTypes.IMedusaInternalService<any>
  productImageProductService: ModulesSdkTypes.IMedusaInternalService<any>
  productTypeService: ModulesSdkTypes.IMedusaInternalService<any>
  productOptionService: ModulesSdkTypes.IMedusaInternalService<any>
  productOptionValueService: ModulesSdkTypes.IMedusaInternalService<any>
  [Modules.EVENT_BUS]?: IEventBusModuleService
}

export default class ProductModuleService
  extends MedusaService<{
    Product: {
      dto: ProductTypes.ProductDTO
    }
    ProductCategory: {
      dto: ProductTypes.ProductCategoryDTO
    }
    ProductCollection: {
      dto: ProductTypes.ProductCollectionDTO
    }
    ProductOption: {
      dto: ProductTypes.ProductOptionDTO
    }
    ProductOptionValue: {
      dto: ProductTypes.ProductOptionValueDTO
    }
    ProductTag: {
      dto: ProductTypes.ProductTagDTO
    }
    ProductType: {
      dto: ProductTypes.ProductTypeDTO
    }
    ProductVariant: {
      dto: ProductTypes.ProductVariantDTO
    }
    ProductImage: {
      dto: ProductTypes.ProductImageDTO
    }
  }>({
    Product,
    ProductCategory,
    ProductCollection,
    ProductOption,
    ProductOptionValue,
    ProductTag,
    ProductType,
    ProductVariant,
    ProductImage,
  })
  implements ProductTypes.IProductModuleService
{
  protected baseRepository_: DAL.RepositoryService
  protected readonly productRepository_: ProductRepository
  protected readonly productService_: ModulesSdkTypes.IMedusaInternalService<
    InferEntityType<typeof Product>
  >
  protected readonly productVariantService_: ModulesSdkTypes.IMedusaInternalService<
    InferEntityType<typeof ProductVariant>
  >
  protected readonly productCategoryService_: ProductCategoryService
  protected readonly productTagService_: ModulesSdkTypes.IMedusaInternalService<
    InferEntityType<typeof ProductTag>
  >
  protected readonly productCollectionService_: ModulesSdkTypes.IMedusaInternalService<
    InferEntityType<typeof ProductCollection>
  >
  protected readonly productImageService_: ModulesSdkTypes.IMedusaInternalService<
    InferEntityType<typeof ProductImage>
  >
  protected readonly productTypeService_: ModulesSdkTypes.IMedusaInternalService<
    InferEntityType<typeof ProductType>
  >
  protected readonly productOptionService_: ModulesSdkTypes.IMedusaInternalService<
    InferEntityType<typeof ProductOption>
  >
  protected readonly productOptionValueService_: ModulesSdkTypes.IMedusaInternalService<
    InferEntityType<typeof ProductOptionValue>
  >
  protected readonly eventBusModuleService_?: IEventBusModuleService

  constructor(
    {
      baseRepository,
      productRepository,
      productService,
      productVariantService,
      productTagService,
      productCategoryService,
      productCollectionService,
      productImageService,
      productTypeService,
      productOptionService,
      productOptionValueService,
      [Modules.EVENT_BUS]: eventBusModuleService,
    }: InjectedDependencies,
    protected readonly moduleDeclaration: InternalModuleDeclaration
  ) {
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params
    super(...arguments)

    this.baseRepository_ = baseRepository
    this.productRepository_ = productRepository
    this.productService_ = productService
    this.productVariantService_ = productVariantService
    this.productTagService_ = productTagService
    this.productCategoryService_ = productCategoryService
    this.productCollectionService_ = productCollectionService
    this.productImageService_ = productImageService
    this.productTypeService_ = productTypeService
    this.productOptionService_ = productOptionService
    this.productOptionValueService_ = productOptionValueService
    this.eventBusModuleService_ = eventBusModuleService
  }

  __joinerConfig(): ModuleJoinerConfig {
    return joinerConfig
  }

  @InjectManager()
  // @ts-ignore
  async retrieveProduct(
    productId: string,
    config?: FindConfig<ProductTypes.ProductDTO>,
    @MedusaContext() sharedContext?: Context
  ): Promise<ProductTypes.ProductDTO> {
    const product = await this.productService_.retrieve(
      productId,
      this.getProductFindConfig_(config),
      sharedContext
    )

    return this.baseRepository_.serialize<ProductTypes.ProductDTO>(product)
  }

  @InjectManager()
  // @ts-ignore
  async listProducts(
    filters?: ProductTypes.FilterableProductProps,
    config?: FindConfig<ProductTypes.ProductDTO>,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductDTO[]> {
    const products = await this.productService_.list(
      filters,
      this.getProductFindConfig_(config),
      sharedContext
    )

    return this.baseRepository_.serialize<ProductTypes.ProductDTO[]>(products)
  }

  @InjectManager()
  // @ts-ignore
  async listAndCountProducts(
    filters?: ProductTypes.FilterableProductProps,
    config?: FindConfig<ProductTypes.ProductDTO>,
    sharedContext?: Context
  ): Promise<[ProductTypes.ProductDTO[], number]> {
    const [products, count] = await this.productService_.listAndCount(
      filters,
      this.getProductFindConfig_(config),
      sharedContext
    )
    const serializedProducts = await this.baseRepository_.serialize<
      ProductTypes.ProductDTO[]
    >(products)
    return [serializedProducts, count]
  }

  protected getProductFindConfig_(
    config?: FindConfig<ProductTypes.ProductDTO>
  ): FindConfig<ProductTypes.ProductDTO> {
    const hasImagesRelation = config?.relations?.includes("images")

    return {
      ...config,
      order: {
        ...(config?.order ?? { id: "ASC" }),
        ...(hasImagesRelation
          ? {
              images: {
                rank: "ASC",
                ...((config?.order?.images as object) ?? {}),
              },
            }
          : {}),
      },
    }
  }

  // @ts-expect-error
  createProductVariants(
    data: ProductTypes.CreateProductVariantDTO[],
    sharedContext?: Context
  ): Promise<ProductTypes.ProductVariantDTO[]>
  // @ts-expect-error
  createProductVariants(
    data: ProductTypes.CreateProductVariantDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductVariantDTO>

  @InjectManager()
  @EmitEvents()
  // @ts-expect-error
  async createProductVariants(
    data:
      | ProductTypes.CreateProductVariantDTO[]
      | ProductTypes.CreateProductVariantDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<
    ProductTypes.ProductVariantDTO[] | ProductTypes.ProductVariantDTO
  > {
    const input = Array.isArray(data) ? data : [data]

    const variants = await this.createVariants_(input, sharedContext)

    const createdVariants = await this.baseRepository_.serialize<
      ProductTypes.ProductVariantDTO[]
    >(variants)

    return Array.isArray(data) ? createdVariants : createdVariants[0]
  }

  @InjectTransactionManager()
  protected async createVariants_(
    data: ProductTypes.CreateProductVariantDTO[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<InferEntityType<typeof ProductVariant>[]> {
    if (data.some((v) => !v.product_id)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Unable to create variants without specifying a product_id"
      )
    }

    const productOptions = await this.productOptionService_.list(
      {
        product_id: [...new Set<string>(data.map((v) => v.product_id!))],
      },
      {
        relations: ["values"],
      },
      sharedContext
    )

    const variants = await this.productVariantService_.list(
      {
        product_id: [...new Set<string>(data.map((v) => v.product_id!))],
      },
      {
        relations: ["options"],
      },
      sharedContext
    )

    const productVariantsWithOptions =
      ProductModuleService.assignOptionsToVariants(data, productOptions)

    ProductModuleService.checkIfVariantWithOptionsAlreadyExists(
      productVariantsWithOptions as any,
      variants
    )

    const createdVariants = await this.productVariantService_.create(
      productVariantsWithOptions,
      sharedContext
    )

    eventBuilders.createdProductVariant({
      data: createdVariants,
      sharedContext,
    })

    return createdVariants
  }

  async upsertProductVariants(
    data: ProductTypes.UpsertProductVariantDTO[],
    sharedContext?: Context
  ): Promise<ProductTypes.ProductVariantDTO[]>
  async upsertProductVariants(
    data: ProductTypes.UpsertProductVariantDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductVariantDTO>

  @InjectTransactionManager()
  @EmitEvents()
  async upsertProductVariants(
    data:
      | ProductTypes.UpsertProductVariantDTO[]
      | ProductTypes.UpsertProductVariantDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<
    ProductTypes.ProductVariantDTO[] | ProductTypes.ProductVariantDTO
  > {
    const input = Array.isArray(data) ? data : [data]
    const forUpdate = input.filter(
      (variant): variant is UpdateProductVariantInput => !!variant.id
    )
    const forCreate = input.filter(
      (variant): variant is ProductTypes.CreateProductVariantDTO => !variant.id
    )

    let created: InferEntityType<typeof ProductVariant>[] = []
    let updated: InferEntityType<typeof ProductVariant>[] = []

    if (forCreate.length) {
      created = await this.createVariants_(forCreate, sharedContext)
    }
    if (forUpdate.length) {
      updated = await this.updateVariants_(forUpdate, sharedContext)
    }

    const result = [...created, ...updated]
    const allVariants = await this.baseRepository_.serialize<
      ProductTypes.ProductVariantDTO[] | ProductTypes.ProductVariantDTO
    >(result)

    return Array.isArray(data) ? allVariants : allVariants[0]
  }

  // @ts-expect-error
  updateProductVariants(
    id: string,
    data: ProductTypes.UpdateProductVariantDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductVariantDTO>
  // @ts-expect-error
  updateProductVariants(
    selector: ProductTypes.FilterableProductVariantProps,
    data: ProductTypes.UpdateProductVariantDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductVariantDTO[]>

  @InjectManager()
  @EmitEvents()
  // @ts-expect-error
  async updateProductVariants(
    idOrSelector: string | ProductTypes.FilterableProductVariantProps,
    data: ProductTypes.UpdateProductVariantDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<
    ProductTypes.ProductVariantDTO[] | ProductTypes.ProductVariantDTO
  > {
    let normalizedInput: UpdateProductVariantInput[] = []
    if (isString(idOrSelector)) {
      normalizedInput = [{ id: idOrSelector, ...data }]
    } else {
      const variants = await this.productVariantService_.list(
        idOrSelector,
        {},
        sharedContext
      )

      normalizedInput = variants.map((variant) => ({
        id: variant.id,
        ...data,
      }))
    }

    const variants = await this.updateVariants_(normalizedInput, sharedContext)

    const updatedVariants = await this.baseRepository_.serialize<
      ProductTypes.ProductVariantDTO[]
    >(variants)

    return isString(idOrSelector) ? updatedVariants[0] : updatedVariants
  }

  @InjectTransactionManager()
  protected async updateVariants_(
    data: UpdateProductVariantInput[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<InferEntityType<typeof ProductVariant>[]> {
    // Validation step
    const variantIdsToUpdate = data.map(({ id }) => id)
    const variants = await this.productVariantService_.list(
      { id: variantIdsToUpdate },
      {},
      sharedContext
    )

    const allVariants = await this.productVariantService_.list(
      { product_id: variants.map((v) => v.product_id) },
      { relations: ["options"] },
      sharedContext
    )

    if (variants.length !== data.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot update non-existing variants with ids: ${arrayDifference(
          variantIdsToUpdate,
          variants.map(({ id }) => id)
        ).join(", ")}`
      )
    }

    // Data normalization
    const variantsWithProductId: UpdateProductVariantInput[] = variants.map(
      (v) => ({
        ...data.find((d) => d.id === v.id),
        id: v.id,
        product_id: v.product_id,
      })
    )

    const productOptions = await this.productOptionService_.list(
      {
        product_id: Array.from(
          new Set(variantsWithProductId.map((v) => v.product_id!))
        ),
      },
      { relations: ["values"] },
      sharedContext
    )

    const productVariantsWithOptions =
      ProductModuleService.assignOptionsToVariants(
        variantsWithProductId,
        productOptions
      )

    if (data.some((d) => !!d.options)) {
      ProductModuleService.checkIfVariantWithOptionsAlreadyExists(
        productVariantsWithOptions as any,
        allVariants
      )
    }

    const { entities: productVariants, performedActions } =
      await this.productVariantService_.upsertWithReplace(
        productVariantsWithOptions,
        {
          relations: ["options"],
        },
        sharedContext
      )

    eventBuilders.createdProductVariant({
      data: performedActions.created[ProductVariant.name] ?? [],
      sharedContext,
    })
    eventBuilders.updatedProductVariant({
      data: performedActions.updated[ProductVariant.name] ?? [],
      sharedContext,
    })
    eventBuilders.deletedProductVariant({
      data: performedActions.deleted[ProductVariant.name] ?? [],
      sharedContext,
    })

    return productVariants
  }

  // @ts-expect-error
  createProductTags(
    data: ProductTypes.CreateProductTagDTO[],
    sharedContext?: Context
  ): Promise<ProductTypes.ProductTagDTO[]>
  // @ts-expect-error
  createProductTags(
    data: ProductTypes.CreateProductTagDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductTagDTO>

  @InjectManager()
  @EmitEvents()
  // @ts-expect-error
  async createProductTags(
    data: ProductTypes.CreateProductTagDTO[] | ProductTypes.CreateProductTagDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ProductTypes.ProductTagDTO[] | ProductTypes.ProductTagDTO> {
    const input = Array.isArray(data) ? data : [data]

    const tags = await this.productTagService_.create(input, sharedContext)

    const createdTags = await this.baseRepository_.serialize<
      ProductTypes.ProductTagDTO[]
    >(tags)

    eventBuilders.createdProductTag({
      data: createdTags,
      sharedContext,
    })

    return Array.isArray(data) ? createdTags : createdTags[0]
  }

  async upsertProductTags(
    data: ProductTypes.UpsertProductTagDTO[],
    sharedContext?: Context
  ): Promise<ProductTypes.ProductTagDTO[]>
  async upsertProductTags(
    data: ProductTypes.UpsertProductTagDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductTagDTO>

  @InjectTransactionManager()
  @EmitEvents()
  async upsertProductTags(
    data: ProductTypes.UpsertProductTagDTO[] | ProductTypes.UpsertProductTagDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ProductTypes.ProductTagDTO[] | ProductTypes.ProductTagDTO> {
    const input = Array.isArray(data) ? data : [data]
    const forUpdate = input.filter((tag): tag is UpdateTagInput => !!tag.id)
    const forCreate = input.filter(
      (tag): tag is ProductTypes.CreateProductTagDTO => !tag.id
    )

    let created: InferEntityType<typeof ProductTag>[] = []
    let updated: InferEntityType<typeof ProductTag>[] = []

    if (forCreate.length) {
      created = await this.productTagService_.create(forCreate, sharedContext)
      eventBuilders.createdProductTag({
        data: created,
        sharedContext,
      })
    }
    if (forUpdate.length) {
      updated = await this.productTagService_.update(forUpdate, sharedContext)
      eventBuilders.updatedProductTag({
        data: updated,
        sharedContext,
      })
    }

    const result = [...created, ...updated]
    const allTags = await this.baseRepository_.serialize<
      ProductTypes.ProductTagDTO[] | ProductTypes.ProductTagDTO
    >(result)

    return Array.isArray(data) ? allTags : allTags[0]
  }

  // @ts-expect-error
  updateProductTags(
    id: string,
    data: ProductTypes.UpdateProductTagDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductTagDTO>
  // @ts-expect-error
  updateProductTags(
    selector: ProductTypes.FilterableProductTagProps,
    data: ProductTypes.UpdateProductTagDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductTagDTO[]>

  @InjectManager()
  @EmitEvents()
  // @ts-expect-error
  async updateProductTags(
    idOrSelector: string | ProductTypes.FilterableProductTagProps,
    data: ProductTypes.UpdateProductTagDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ProductTypes.ProductTagDTO[] | ProductTypes.ProductTagDTO> {
    let normalizedInput: UpdateTagInput[] = []
    if (isString(idOrSelector)) {
      // Check if the tag exists in the first place
      await this.productTagService_.retrieve(idOrSelector, {}, sharedContext)
      normalizedInput = [{ id: idOrSelector, ...data }]
    } else {
      const tags = await this.productTagService_.list(
        idOrSelector,
        {},
        sharedContext
      )

      normalizedInput = tags.map((tag) => ({
        id: tag.id,
        ...data,
      }))
    }

    const tags = await this.productTagService_.update(
      normalizedInput,
      sharedContext
    )

    const updatedTags = await this.baseRepository_.serialize<
      ProductTypes.ProductTagDTO[]
    >(tags)

    eventBuilders.updatedProductTag({
      data: updatedTags,
      sharedContext,
    })

    return isString(idOrSelector) ? updatedTags[0] : updatedTags
  }

  // @ts-expect-error
  createProductTypes(
    data: ProductTypes.CreateProductTypeDTO[],
    sharedContext?: Context
  ): Promise<ProductTypes.ProductTypeDTO[]>
  // @ts-expect-error
  createProductTypes(
    data: ProductTypes.CreateProductTypeDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductTypeDTO>

  @InjectManager()
  // @ts-expect-error
  async createProductTypes(
    data:
      | ProductTypes.CreateProductTypeDTO[]
      | ProductTypes.CreateProductTypeDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ProductTypes.ProductTypeDTO[] | ProductTypes.ProductTypeDTO> {
    const input = Array.isArray(data) ? data : [data]

    const types = await this.productTypeService_.create(input, sharedContext)

    const createdTypes = await this.baseRepository_.serialize<
      ProductTypes.ProductTypeDTO[]
    >(types)

    return Array.isArray(data) ? createdTypes : createdTypes[0]
  }

  async upsertProductTypes(
    data: ProductTypes.UpsertProductTypeDTO[],
    sharedContext?: Context
  ): Promise<ProductTypes.ProductTypeDTO[]>
  async upsertProductTypes(
    data: ProductTypes.UpsertProductTypeDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductTypeDTO>

  @InjectTransactionManager()
  async upsertProductTypes(
    data:
      | ProductTypes.UpsertProductTypeDTO[]
      | ProductTypes.UpsertProductTypeDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ProductTypes.ProductTypeDTO[] | ProductTypes.ProductTypeDTO> {
    const input = Array.isArray(data) ? data : [data]
    const forUpdate = input.filter((type): type is UpdateTypeInput => !!type.id)
    const forCreate = input.filter(
      (type): type is ProductTypes.CreateProductTypeDTO => !type.id
    )

    let created: InferEntityType<typeof ProductType>[] = []
    let updated: InferEntityType<typeof ProductType>[] = []

    if (forCreate.length) {
      created = await this.productTypeService_.create(forCreate, sharedContext)
    }
    if (forUpdate.length) {
      updated = await this.productTypeService_.update(forUpdate, sharedContext)
    }

    const result = [...created, ...updated]
    const allTypes = await this.baseRepository_.serialize<
      ProductTypes.ProductTypeDTO[] | ProductTypes.ProductTypeDTO
    >(result)

    return Array.isArray(data) ? allTypes : allTypes[0]
  }

  // @ts-expect-error
  updateProductTypes(
    id: string,
    data: ProductTypes.UpdateProductTypeDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductTypeDTO>
  // @ts-expect-error
  updateProductTypes(
    selector: ProductTypes.FilterableProductTypeProps,
    data: ProductTypes.UpdateProductTypeDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductTypeDTO[]>

  @InjectManager()
  // @ts-expect-error
  async updateProductTypes(
    idOrSelector: string | ProductTypes.FilterableProductTypeProps,
    data: ProductTypes.UpdateProductTypeDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ProductTypes.ProductTypeDTO[] | ProductTypes.ProductTypeDTO> {
    let normalizedInput: UpdateTypeInput[] = []
    if (isString(idOrSelector)) {
      // Check if the type exists in the first place
      await this.productTypeService_.retrieve(idOrSelector, {}, sharedContext)
      normalizedInput = [{ id: idOrSelector, ...data }]
    } else {
      const types = await this.productTypeService_.list(
        idOrSelector,
        {},
        sharedContext
      )

      normalizedInput = types.map((type) => ({
        id: type.id,
        ...data,
      }))
    }

    const types = await this.productTypeService_.update(
      normalizedInput,
      sharedContext
    )

    const updatedTypes = await this.baseRepository_.serialize<
      ProductTypes.ProductTypeDTO[]
    >(types)

    return isString(idOrSelector) ? updatedTypes[0] : updatedTypes
  }

  // @ts-expect-error
  createProductOptions(
    data: ProductTypes.CreateProductOptionDTO[],
    sharedContext?: Context
  ): Promise<ProductTypes.ProductOptionDTO[]>
  // @ts-expect-error
  createProductOptions(
    data: ProductTypes.CreateProductOptionDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductOptionDTO>

  @InjectManager()
  // @ts-expect-error
  async createProductOptions(
    data:
      | ProductTypes.CreateProductOptionDTO[]
      | ProductTypes.CreateProductOptionDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ProductTypes.ProductOptionDTO[] | ProductTypes.ProductOptionDTO> {
    const input = Array.isArray(data) ? data : [data]

    const options = await this.createOptions_(input, sharedContext)

    const createdOptions = await this.baseRepository_.serialize<
      ProductTypes.ProductOptionDTO[]
    >(options)

    return Array.isArray(data) ? createdOptions : createdOptions[0]
  }

  @InjectTransactionManager()
  protected async createOptions_(
    data: ProductTypes.CreateProductOptionDTO[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<InferEntityType<typeof ProductOption>[]> {
    if (data.some((v) => !v.product_id)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Tried to create options without specifying a product_id"
      )
    }

    const normalizedInput = data.map((opt) => {
      return {
        ...opt,
        values: opt.values?.map((v) => {
          return typeof v === "string" ? { value: v } : v
        }),
      }
    })

    return await this.productOptionService_.create(
      normalizedInput,
      sharedContext
    )
  }

  async upsertProductOptions(
    data: ProductTypes.UpsertProductOptionDTO[],
    sharedContext?: Context
  ): Promise<ProductTypes.ProductOptionDTO[]>
  async upsertProductOptions(
    data: ProductTypes.UpsertProductOptionDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductOptionDTO>

  @InjectTransactionManager()
  async upsertProductOptions(
    data:
      | ProductTypes.UpsertProductOptionDTO[]
      | ProductTypes.UpsertProductOptionDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ProductTypes.ProductOptionDTO[] | ProductTypes.ProductOptionDTO> {
    const input = Array.isArray(data) ? data : [data]
    const forUpdate = input.filter(
      (option): option is UpdateProductOptionInput => !!option.id
    )
    const forCreate = input.filter(
      (option): option is ProductTypes.CreateProductOptionDTO => !option.id
    )

    let created: InferEntityType<typeof ProductOption>[] = []
    let updated: InferEntityType<typeof ProductOption>[] = []

    if (forCreate.length) {
      created = await this.createOptions_(forCreate, sharedContext)
    }
    if (forUpdate.length) {
      updated = await this.updateOptions_(forUpdate, sharedContext)
    }

    const result = [...created, ...updated]
    const allOptions = await this.baseRepository_.serialize<
      ProductTypes.ProductOptionDTO[] | ProductTypes.ProductOptionDTO
    >(result)

    return Array.isArray(data) ? allOptions : allOptions[0]
  }

  // @ts-expect-error
  updateProductOptions(
    id: string,
    data: ProductTypes.UpdateProductOptionDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductOptionDTO>
  // @ts-expect-error
  updateProductOptions(
    selector: ProductTypes.FilterableProductOptionProps,
    data: ProductTypes.UpdateProductOptionDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductOptionDTO[]>

  @InjectManager()
  // @ts-expect-error
  async updateProductOptions(
    idOrSelector: string | ProductTypes.FilterableProductOptionProps,
    data: ProductTypes.UpdateProductOptionDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ProductTypes.ProductOptionDTO[] | ProductTypes.ProductOptionDTO> {
    let normalizedInput: UpdateProductOptionInput[] = []
    if (isString(idOrSelector)) {
      await this.productOptionService_.retrieve(idOrSelector, {}, sharedContext)
      normalizedInput = [{ id: idOrSelector, ...data }]
    } else {
      const options = await this.productOptionService_.list(
        idOrSelector,
        {},
        sharedContext
      )

      normalizedInput = options.map((option) => ({
        id: option.id,
        ...data,
      }))
    }

    const options = await this.updateOptions_(normalizedInput, sharedContext)

    const updatedOptions = await this.baseRepository_.serialize<
      ProductTypes.ProductOptionDTO[]
    >(options)

    return isString(idOrSelector) ? updatedOptions[0] : updatedOptions
  }

  @InjectTransactionManager()
  protected async updateOptions_(
    data: UpdateProductOptionInput[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<InferEntityType<typeof ProductOption>[]> {
    // Validation step
    if (data.some((option) => !option.id)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Tried to update options without specifying an ID"
      )
    }

    const dbOptions = await this.productOptionService_.list(
      { id: data.map(({ id }) => id) },
      { relations: ["values"] },
      sharedContext
    )

    if (dbOptions.length !== data.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot update non-existing options with ids: ${arrayDifference(
          data.map(({ id }) => id),
          dbOptions.map(({ id }) => id)
        ).join(", ")}`
      )
    }

    // Data normalization
    const normalizedInput = data.map((opt) => {
      const dbValues = dbOptions.find(({ id }) => id === opt.id)?.values || []
      const normalizedValues = opt.values?.map((v) => {
        return typeof v === "string" ? { value: v } : v
      })

      return {
        ...opt,
        ...(normalizedValues
          ? {
              // Oftentimes the options are only passed by value without an id, even if they exist in the DB
              values: normalizedValues.map((normVal) => {
                if ("id" in normVal) {
                  return normVal
                }

                const dbVal = dbValues.find(
                  (dbVal) => dbVal.value === normVal.value
                )
                if (!dbVal) {
                  return normVal
                }

                return {
                  id: dbVal.id,
                  value: normVal.value,
                }
              }),
            }
          : {}),
      } as UpdateProductOptionInput
    })

    const { entities: productOptions } =
      await this.productOptionService_.upsertWithReplace(
        normalizedInput,
        { relations: ["values"] },
        sharedContext
      )

    return productOptions
  }

  // @ts-expect-error
  createProductCollections(
    data: ProductTypes.CreateProductCollectionDTO[],
    sharedContext?: Context
  ): Promise<ProductTypes.ProductCollectionDTO[]>
  // @ts-expect-error
  createProductCollections(
    data: ProductTypes.CreateProductCollectionDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductCollectionDTO>

  @InjectManager()
  @EmitEvents()
  // @ts-expect-error
  async createProductCollections(
    data:
      | ProductTypes.CreateProductCollectionDTO[]
      | ProductTypes.CreateProductCollectionDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<
    ProductTypes.ProductCollectionDTO[] | ProductTypes.ProductCollectionDTO
  > {
    const input = Array.isArray(data) ? data : [data]

    const collections = await this.createCollections_(input, sharedContext)

    const createdCollections = await this.baseRepository_.serialize<
      ProductTypes.ProductCollectionDTO[]
    >(collections)

    eventBuilders.createdProductCollection({
      data: collections,
      sharedContext,
    })

    return Array.isArray(data) ? createdCollections : createdCollections[0]
  }

  @InjectTransactionManager()
  async createCollections_(
    data: ProductTypes.CreateProductCollectionDTO[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<InferEntityType<typeof ProductCollection>[]> {
    const normalizedInput = data.map(
      ProductModuleService.normalizeCreateProductCollectionInput
    )

    // It's safe to use upsertWithReplace here since we only have product IDs and the only operation to do is update the product
    // with the collection ID
    const { entities: productCollections } =
      await this.productCollectionService_.upsertWithReplace(
        normalizedInput,
        { relations: ["products"] },
        sharedContext
      )

    return productCollections
  }

  async upsertProductCollections(
    data: ProductTypes.UpsertProductCollectionDTO[],
    sharedContext?: Context
  ): Promise<ProductTypes.ProductCollectionDTO[]>
  async upsertProductCollections(
    data: ProductTypes.UpsertProductCollectionDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductCollectionDTO>

  @InjectTransactionManager()
  @EmitEvents()
  async upsertProductCollections(
    data:
      | ProductTypes.UpsertProductCollectionDTO[]
      | ProductTypes.UpsertProductCollectionDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<
    ProductTypes.ProductCollectionDTO[] | ProductTypes.ProductCollectionDTO
  > {
    const input = Array.isArray(data) ? data : [data]
    const forUpdate = input.filter(
      (collection): collection is UpdateCollectionInput => !!collection.id
    )
    const forCreate = input.filter(
      (collection): collection is ProductTypes.CreateProductCollectionDTO =>
        !collection.id
    )

    let created: InferEntityType<typeof ProductCollection>[] = []
    let updated: InferEntityType<typeof ProductCollection>[] = []

    if (forCreate.length) {
      created = await this.createCollections_(forCreate, sharedContext)
    }

    if (forUpdate.length) {
      updated = await this.updateCollections_(forUpdate, sharedContext)
    }

    const result = [...created, ...updated]
    const allCollections = await this.baseRepository_.serialize<
      ProductTypes.ProductCollectionDTO[] | ProductTypes.ProductCollectionDTO
    >(result)

    if (created.length) {
      eventBuilders.createdProductCollection({
        data: created,
        sharedContext,
      })
    }

    if (updated.length) {
      eventBuilders.updatedProductCollection({
        data: updated,
        sharedContext,
      })
    }

    return Array.isArray(data) ? allCollections : allCollections[0]
  }

  // @ts-expect-error
  updateProductCollections(
    id: string,
    data: ProductTypes.UpdateProductCollectionDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductCollectionDTO>
  // @ts-expect-error
  updateProductCollections(
    selector: ProductTypes.FilterableProductCollectionProps,
    data: ProductTypes.UpdateProductCollectionDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductCollectionDTO[]>

  @InjectManager()
  @EmitEvents()
  // @ts-expect-error
  async updateProductCollections(
    idOrSelector: string | ProductTypes.FilterableProductCollectionProps,
    data: ProductTypes.UpdateProductCollectionDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<
    ProductTypes.ProductCollectionDTO[] | ProductTypes.ProductCollectionDTO
  > {
    let normalizedInput: UpdateCollectionInput[] = []
    if (isString(idOrSelector)) {
      await this.productCollectionService_.retrieve(
        idOrSelector,
        {},
        sharedContext
      )
      normalizedInput = [{ id: idOrSelector, ...data }]
    } else {
      const collections = await this.productCollectionService_.list(
        idOrSelector,
        {},
        sharedContext
      )

      normalizedInput = collections.map((collection) => ({
        id: collection.id,
        ...data,
      }))
    }

    const collections = await this.updateCollections_(
      normalizedInput,
      sharedContext
    )

    const updatedCollections = await this.baseRepository_.serialize<
      ProductTypes.ProductCollectionDTO[]
    >(collections)

    eventBuilders.updatedProductCollection({
      data: updatedCollections,
      sharedContext,
    })

    return isString(idOrSelector) ? updatedCollections[0] : updatedCollections
  }

  @InjectTransactionManager()
  protected async updateCollections_(
    data: UpdateCollectionInput[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<InferEntityType<typeof ProductCollection>[]> {
    const normalizedInput = data.map(
      ProductModuleService.normalizeUpdateProductCollectionInput
    ) as UpdateCollectionInput[]

    // TODO: Maybe we can update upsertWithReplace to not remove oneToMany entities, but just disassociate them? With that we can remove the code below.
    // Another alternative is to not allow passing product_ids to a collection, and instead set the collection_id through the product update call.
    const updatedCollections = await this.productCollectionService_.update(
      normalizedInput.map((c) =>
        removeUndefined({ ...c, products: undefined })
      ),
      sharedContext
    )

    const collections: InferEntityType<typeof ProductCollection>[] = []
    const toUpdate: {
      selector: ProductTypes.FilterableProductProps
      data: ProductTypes.UpdateProductDTO
    }[] = []

    updatedCollections.forEach((collectionData) => {
      const input = normalizedInput.find((c) => c.id === collectionData.id)
      const productsToUpdate = (input as any)?.products

      const dissociateSelector = {
        collection_id: collectionData.id,
      }
      const associateSelector = {}

      if (isDefined(productsToUpdate)) {
        const productIds = productsToUpdate.map((p) => p.id)

        dissociateSelector["id"] = { $nin: productIds }
        associateSelector["id"] = { $in: productIds }
      }

      if (isPresent(dissociateSelector["id"])) {
        toUpdate.push({
          selector: dissociateSelector,
          data: {
            collection_id: null,
          },
        })
      }

      if (isPresent(associateSelector["id"])) {
        toUpdate.push({
          selector: associateSelector,
          data: {
            collection_id: collectionData.id,
          },
        })
      }

      collections.push({
        ...collectionData,
        products: productsToUpdate ?? [],
      } as InferEntityType<typeof ProductCollection>)
    })

    if (toUpdate.length) {
      await this.productService_.update(toUpdate, sharedContext)
    }

    return collections
  }

  // @ts-expect-error
  createProductCategories(
    data: ProductTypes.CreateProductCategoryDTO[],
    sharedContext?: Context
  ): Promise<ProductTypes.ProductCategoryDTO[]>
  // @ts-expect-error
  createProductCategories(
    data: ProductTypes.CreateProductCategoryDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductCategoryDTO>

  @InjectManager()
  @EmitEvents()
  // @ts-expect-error
  async createProductCategories(
    data:
      | ProductTypes.CreateProductCategoryDTO[]
      | ProductTypes.CreateProductCategoryDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<
    ProductTypes.ProductCategoryDTO[] | ProductTypes.ProductCategoryDTO
  > {
    const input = (Array.isArray(data) ? data : [data]).map(
      (productCategory) => {
        productCategory.handle ??= kebabCase(productCategory.name)
        return productCategory
      }
    )

    const categories = await this.productCategoryService_.create(
      input,
      sharedContext
    )

    const createdCategories = await this.baseRepository_.serialize<
      ProductTypes.ProductCategoryDTO[]
    >(categories)

    eventBuilders.createdProductCategory({
      data: createdCategories,
      sharedContext,
    })

    return Array.isArray(data) ? createdCategories : createdCategories[0]
  }

  async upsertProductCategories(
    data: ProductTypes.UpsertProductCategoryDTO[],
    sharedContext?: Context
  ): Promise<ProductTypes.ProductCategoryDTO[]>
  async upsertProductCategories(
    data: ProductTypes.UpsertProductCategoryDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductCategoryDTO>

  @InjectTransactionManager()
  @EmitEvents()
  async upsertProductCategories(
    data:
      | ProductTypes.UpsertProductCategoryDTO[]
      | ProductTypes.UpsertProductCategoryDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<
    ProductTypes.ProductCategoryDTO[] | ProductTypes.ProductCategoryDTO
  > {
    const input = Array.isArray(data) ? data : [data]
    const forUpdate = input.filter(
      (category): category is UpdateCategoryInput => !!category.id
    )
    const forCreate = input.filter(
      (category): category is ProductTypes.CreateProductCategoryDTO =>
        !category.id
    )

    let created: InferEntityType<typeof ProductCategory>[] = []
    let updated: InferEntityType<typeof ProductCategory>[] = []

    if (forCreate.length) {
      created = await this.productCategoryService_.create(
        forCreate,
        sharedContext
      )
    }
    if (forUpdate.length) {
      updated = await this.productCategoryService_.update(
        forUpdate,
        sharedContext
      )
    }

    const createdCategories = await this.baseRepository_.serialize<
      ProductTypes.ProductCategoryDTO[]
    >(created)
    const updatedCategories = await this.baseRepository_.serialize<
      ProductTypes.ProductCategoryDTO[]
    >(updated)

    eventBuilders.createdProductCategory({
      data: createdCategories,
      sharedContext,
    })

    eventBuilders.updatedProductCategory({
      data: updatedCategories,
      sharedContext,
    })

    const result = [...createdCategories, ...updatedCategories]
    return Array.isArray(data) ? result : result[0]
  }

  // @ts-expect-error
  updateProductCategories(
    id: string,
    data: ProductTypes.UpdateProductCategoryDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductCategoryDTO>
  // @ts-expect-error
  updateProductCategories(
    selector: ProductTypes.FilterableProductTypeProps,
    data: ProductTypes.UpdateProductCategoryDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductCategoryDTO[]>

  @InjectManager()
  @EmitEvents()
  // @ts-expect-error
  async updateProductCategories(
    idOrSelector: string | ProductTypes.FilterableProductTypeProps,
    data: ProductTypes.UpdateProductCategoryDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<
    ProductTypes.ProductCategoryDTO[] | ProductTypes.ProductCategoryDTO
  > {
    let normalizedInput: UpdateCategoryInput[] = []
    if (isString(idOrSelector)) {
      // Check if the type exists in the first place
      await this.productCategoryService_.retrieve(
        idOrSelector,
        {},
        sharedContext
      )
      normalizedInput = [{ id: idOrSelector, ...data }]
    } else {
      const categories = await this.productCategoryService_.list(
        idOrSelector,
        {},
        sharedContext
      )

      normalizedInput = categories.map((type) => ({
        id: type.id,
        ...data,
      }))
    }

    const categories = await this.productCategoryService_.update(
      normalizedInput,
      sharedContext
    )

    const updatedCategories = await this.baseRepository_.serialize<
      ProductTypes.ProductCategoryDTO[]
    >(categories)

    eventBuilders.updatedProductCategory({
      data: updatedCategories,
      sharedContext,
    })

    return isString(idOrSelector) ? updatedCategories[0] : updatedCategories
  }

  //@ts-expect-error
  createProducts(
    data: ProductTypes.CreateProductDTO[],
    sharedContext?: Context
  ): Promise<ProductTypes.ProductDTO[]>
  // @ts-expect-error
  createProducts(
    data: ProductTypes.CreateProductDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductDTO>

  @InjectManager()
  @EmitEvents()
  // @ts-expect-error
  async createProducts(
    data: ProductTypes.CreateProductDTO[] | ProductTypes.CreateProductDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ProductTypes.ProductDTO[] | ProductTypes.ProductDTO> {
    const input = Array.isArray(data) ? data : [data]
    const products = await this.createProducts_(input, sharedContext)

    const createdProducts = await this.baseRepository_.serialize<
      ProductTypes.ProductDTO[]
    >(products)

    eventBuilders.createdProduct({
      data: createdProducts,
      sharedContext,
    })

    return Array.isArray(data) ? createdProducts : createdProducts[0]
  }

  async upsertProducts(
    data: ProductTypes.UpsertProductDTO[],
    sharedContext?: Context
  ): Promise<ProductTypes.ProductDTO[]>
  async upsertProducts(
    data: ProductTypes.UpsertProductDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductDTO>

  @InjectTransactionManager()
  @EmitEvents()
  async upsertProducts(
    data: ProductTypes.UpsertProductDTO[] | ProductTypes.UpsertProductDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ProductTypes.ProductDTO[] | ProductTypes.ProductDTO> {
    const input = Array.isArray(data) ? data : [data]
    const forUpdate = input.filter(
      (product): product is UpdateProductInput => !!product.id
    )
    const forCreate = input.filter(
      (product): product is ProductTypes.CreateProductDTO => !product.id
    )

    let created: InferEntityType<typeof Product>[] = []
    let updated: InferEntityType<typeof Product>[] = []

    if (forCreate.length) {
      created = await this.createProducts_(forCreate, sharedContext)
    }
    if (forUpdate.length) {
      updated = await this.updateProducts_(forUpdate, sharedContext)
    }

    const result = [...created, ...updated]
    const allProducts = await this.baseRepository_.serialize<
      ProductTypes.ProductDTO[] | ProductTypes.ProductDTO
    >(result)

    if (created.length) {
      eventBuilders.createdProduct({
        data: created,
        sharedContext,
      })
    }

    if (updated.length) {
      eventBuilders.updatedProduct({
        data: updated,
        sharedContext,
      })
    }

    return Array.isArray(data) ? allProducts : allProducts[0]
  }

  // @ts-expect-error
  updateProducts(
    id: string,
    data: ProductTypes.UpdateProductDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductDTO>
  // @ts-expect-error
  updateProducts(
    selector: ProductTypes.FilterableProductProps,
    data: ProductTypes.UpdateProductDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductDTO[]>

  @InjectManager()
  @EmitEvents()
  // @ts-expect-error
  async updateProducts(
    idOrSelector: string | ProductTypes.FilterableProductProps,
    data: ProductTypes.UpdateProductDTO,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<ProductTypes.ProductDTO[] | ProductTypes.ProductDTO> {
    let normalizedInput: UpdateProductInput[] = []
    if (isString(idOrSelector)) {
      // This will throw if the product does not exist
      await this.productService_.retrieve(idOrSelector, {}, sharedContext)

      normalizedInput = [{ id: idOrSelector, ...data }]
    } else {
      const products = await this.productService_.list(
        idOrSelector,
        {},
        sharedContext
      )

      normalizedInput = products.map((product) => ({
        id: product.id,
        ...data,
      }))
    }

    const products = await this.updateProducts_(normalizedInput, sharedContext)

    const updatedProducts = await this.baseRepository_.serialize<
      ProductTypes.ProductDTO[]
    >(products)

    eventBuilders.updatedProduct({
      data: updatedProducts,
      sharedContext,
    })

    return isString(idOrSelector) ? updatedProducts[0] : updatedProducts
  }

  @InjectTransactionManager()
  protected async createProducts_(
    data: ProductTypes.CreateProductDTO[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<InferEntityType<typeof Product>[]> {
    const normalizedProducts = await this.normalizeCreateProductInput(
      data,
      sharedContext
    )

    for (const product of normalizedProducts) {
      this.validateProductCreatePayload(product)
    }

    const tagIds = normalizedProducts
      .flatMap((d) => (d as any).tags ?? [])
      .map((t) => t.id)
    let existingTags: InferEntityType<typeof ProductTag>[] = []

    if (tagIds.length) {
      existingTags = await this.productTagService_.list(
        {
          id: tagIds,
        },
        {},
        sharedContext
      )
    }

    const existingTagsMap = new Map(existingTags.map((tag) => [tag.id, tag]))

    const productsToCreate = normalizedProducts.map((product) => {
      const productId = generateEntityId(product.id, "prod")
      product.id = productId

      if ((product as any).categories?.length) {
        ;(product as any).categories = (product as any).categories.map(
          (category: { id: string }) => category.id
        )
      }

      if (product.variants?.length) {
        const normalizedVariants = product.variants.map((variant) => {
          const variantId = generateEntityId((variant as any).id, "variant")
          ;(variant as any).id = variantId

          Object.entries(variant.options ?? {}).forEach(([key, value]) => {
            const productOption = product.options?.find(
              (option) => option.title === key
            )!
            const productOptionValue = productOption.values?.find(
              (optionValue) => (optionValue as any).value === value
            )!
            ;(productOptionValue as any).variants ??= []
            ;(productOptionValue as any).variants.push(variant)
          })

          delete variant.options

          return variant
        })

        product.variants = normalizedVariants
      }

      if ((product as any).tags?.length) {
        ;(product as any).tags = (product as any).tags.map(
          (tag: { id: string }) => {
            const existingTag = existingTagsMap.get(tag.id)
            if (existingTag) {
              return existingTag
            }

            throw new MedusaError(
              MedusaError.Types.INVALID_DATA,
              `Tag with id ${tag.id} not found. Please create the tag before associating it with the product.`
            )
          }
        )
      }

      return product
    })

    const createdProducts = await this.productService_.create(
      productsToCreate,
      sharedContext
    )

    return createdProducts
  }

  @InjectTransactionManager()
  protected async updateProducts_(
    data: UpdateProductInput[],
    @MedusaContext() sharedContext: Context = {}
  ): Promise<InferEntityType<typeof Product>[]> {
    const normalizedProducts = await this.normalizeUpdateProductInput(
      data,
      sharedContext
    )

    for (const product of normalizedProducts) {
      this.validateProductUpdatePayload(product)
    }

    return this.productRepository_.deepUpdate(
      normalizedProducts,
      ProductModuleService.validateVariantOptions,
      sharedContext
    )
  }

  // @ts-expect-error
  updateProductOptionValues(
    idOrSelector: string,
    data: ProductTypes.UpdateProductOptionValueDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductOptionValueDTO>
  // @ts-expect-error
  updateProductOptionValues(
    selector: FilterableProductOptionValueProps,
    data: ProductTypes.UpdateProductOptionValueDTO,
    sharedContext?: Context
  ): Promise<ProductTypes.ProductOptionValueDTO[]>
  // @ts-expect-error
  async updateProductOptionValues(
    idOrSelector: string | FilterableProductOptionValueProps,
    data: ProductTypes.UpdateProductOptionValueDTO,
    sharedContext: Context = {}
  ): Promise<
    ProductTypes.ProductOptionValueDTO | ProductTypes.ProductOptionValueDTO[]
  > {
    let normalizedInput: ({
      id: string
    } & ProductTypes.UpdateProductOptionValueDTO)[] = []
    if (isString(idOrSelector)) {
      // This will throw if the product option value does not exist
      await this.productOptionValueService_.retrieve(
        idOrSelector,
        {},
        sharedContext
      )

      normalizedInput = [{ id: idOrSelector, ...data }]
    } else {
      const productOptionValues = await this.productOptionValueService_.list(
        idOrSelector,
        {},
        sharedContext
      )

      normalizedInput = productOptionValues.map((product) => ({
        id: product.id,
        ...data,
      }))
    }

    const productOptionValues = await super.updateProductOptionValues(
      normalizedInput,
      sharedContext
    )

    const updatedProductOptionValues = await this.baseRepository_.serialize<
      ProductTypes.ProductOptionValueDTO[]
    >(productOptionValues)

    eventBuilders.updatedProductOptionValue({
      data: updatedProductOptionValues,
      sharedContext: sharedContext,
    })

    return isString(idOrSelector)
      ? updatedProductOptionValues[0]
      : updatedProductOptionValues
  }

  /**
   * Validates the manually provided handle value of the product
   * to be URL-safe
   */
  protected validateProductPayload(
    productData: UpdateProductInput | ProductTypes.CreateProductDTO
  ) {
    if (productData.handle && !isValidHandle(productData.handle)) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Invalid product handle '${productData.handle}'. It must contain URL safe characters`
      )
    }
  }

  protected validateProductCreatePayload(
    productData: ProductTypes.CreateProductDTO
  ) {
    this.validateProductPayload(productData)

    if (!productData.title) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Product title is required`
      )
    }

    const options = productData.options
    const missingOptionsVariants: string[] = []

    if (options?.length) {
      productData.variants?.forEach((variant) => {
        options.forEach((option) => {
          if (!variant.options?.[option.title]) {
            missingOptionsVariants.push(variant.title)
          }
        })
      })
    }

    if (missingOptionsVariants.length) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Product "${
          productData.title
        }" has variants with missing options: [${missingOptionsVariants.join(
          ", "
        )}]`
      )
    }
  }

  protected validateProductUpdatePayload(productData: UpdateProductInput) {
    this.validateProductPayload(productData)
  }

  protected async normalizeCreateProductInput<
    T extends ProductTypes.CreateProductDTO | ProductTypes.CreateProductDTO[],
    TOutput = T extends ProductTypes.CreateProductDTO[]
      ? ProductTypes.CreateProductDTO[]
      : ProductTypes.CreateProductDTO
  >(
    products: T,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<TOutput> {
    const products_ = Array.isArray(products) ? products : [products]

    const normalizedProducts = (await this.normalizeUpdateProductInput(
      products_ as UpdateProductInput[],
      sharedContext
    )) as ProductTypes.CreateProductDTO[]

    for (const productData of normalizedProducts) {
      if (!productData.handle && productData.title) {
        productData.handle = toHandle(productData.title)
      }

      if (!productData.status) {
        productData.status = ProductStatus.DRAFT
      }

      if (!productData.thumbnail && productData.images?.length) {
        productData.thumbnail = productData.images[0].url
      }

      if (productData.images?.length) {
        productData.images = productData.images.map((image, index) =>
          (image as { rank?: number }).rank != null
            ? image
            : {
                ...image,
                rank: index,
              }
        )
      }
    }

    return (
      Array.isArray(products) ? normalizedProducts : normalizedProducts[0]
    ) as TOutput
  }

  protected async normalizeUpdateProductInput<
    T extends UpdateProductInput | UpdateProductInput[],
    TOutput = T extends UpdateProductInput[]
      ? UpdateProductInput[]
      : UpdateProductInput
  >(
    products: T,
    @MedusaContext() sharedContext: Context = {}
  ): Promise<TOutput> {
    const products_ = Array.isArray(products) ? products : [products]
    const productsIds = products_.map((p) => p.id).filter(Boolean)

    let dbOptions: InferEntityType<typeof ProductOption>[] = []

    if (productsIds.length) {
      dbOptions = await this.productOptionService_.list(
        { product_id: productsIds },
        { relations: ["values"] },
        sharedContext
      )
    }

    const normalizedProducts: UpdateProductInput[] = []

    for (const product of products_) {
      const productData = { ...product }
      if (productData.is_giftcard) {
        productData.discountable = false
      }

      if (productData.options?.length) {
        ;(productData as any).options = productData.options?.map((option) => {
          const dbOption = dbOptions.find(
            (o) => o.title === option.title && o.product_id === productData.id
          )
          return {
            title: option.title,
            values: option.values?.map((value) => {
              const dbValue = dbOption?.values?.find(
                (val) => val.value === value
              )
              return {
                value: value,
                ...(dbValue ? { id: dbValue.id } : {}),
              }
            }),
            ...(dbOption ? { id: dbOption.id } : {}),
          }
        })
      }

      if (productData.tag_ids) {
        ;(productData as any).tags = productData.tag_ids.map((cid) => ({
          id: cid,
        }))
        delete productData.tag_ids
      }

      if (productData.category_ids) {
        ;(productData as any).categories = productData.category_ids.map(
          (cid) => ({
            id: cid,
          })
        )
        delete productData.category_ids
      }

      normalizedProducts.push(productData)
    }

    return (
      Array.isArray(products) ? normalizedProducts : normalizedProducts[0]
    ) as TOutput
  }

  protected static normalizeCreateProductCollectionInput(
    collection: ProductTypes.CreateProductCollectionDTO
  ): ProductTypes.CreateProductCollectionDTO {
    const collectionData =
      ProductModuleService.normalizeUpdateProductCollectionInput(
        collection
      ) as ProductTypes.CreateProductCollectionDTO

    if (!collectionData.handle && collectionData.title) {
      collectionData.handle = kebabCase(collectionData.title)
    }

    return collectionData
  }

  protected static normalizeUpdateProductCollectionInput(
    collection: ProductTypes.CreateProductCollectionDTO | UpdateCollectionInput
  ): ProductTypes.CreateProductCollectionDTO | UpdateCollectionInput {
    const collectionData = { ...collection }
    if (Array.isArray(collectionData.product_ids)) {
      ;(collectionData as any).products = collectionData.product_ids.map(
        (pid) => ({ id: pid })
      )

      delete collectionData.product_ids
    }

    return collectionData
  }

  protected static validateVariantOptions(
    variants:
      | ProductTypes.CreateProductVariantDTO[]
      | ProductTypes.UpdateProductVariantDTO[],
    options: InferEntityType<typeof ProductOption>[]
  ) {
    const variantsWithOptions = ProductModuleService.assignOptionsToVariants(
      variants.map((v) => ({
        ...v,
        // adding product_id to the variant to make it valid for the assignOptionsToVariants function
        ...(options.length ? { product_id: options[0].product_id } : {}),
      })),
      options
    )

    ProductModuleService.checkIfVariantsHaveUniqueOptionsCombinations(
      variantsWithOptions as any
    )
  }

  protected static assignOptionsToVariants(
    variants:
      | ProductTypes.CreateProductVariantDTO[]
      | ProductTypes.UpdateProductVariantDTO[],
    options: InferEntityType<typeof ProductOption>[]
  ):
    | ProductTypes.CreateProductVariantDTO[]
    | ProductTypes.UpdateProductVariantDTO[] {
    if (!variants.length) {
      return variants
    }
    const variantsWithOptions = variants.map((variant: any) => {
      const numOfProvidedVariantOptionValues = Object.keys(
        variant.options || {}
      ).length

      const productsOptions = options.filter(
        (o) => o.product_id === variant.product_id
      )

      if (
        numOfProvidedVariantOptionValues &&
        productsOptions.length !== numOfProvidedVariantOptionValues
      ) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Product has ${productsOptions.length} option values but there were ${numOfProvidedVariantOptionValues} provided option values for the variant: ${variant.title}.`
        )
      }

      const variantOptions = Object.entries(variant.options || {}).map(
        ([key, val]) => {
          const option = productsOptions.find((o) => o.title === key)

          const optionValue = option?.values?.find(
            (v: any) => (v.value?.value ?? v.value) === val
          )

          if (!optionValue) {
            throw new MedusaError(
              MedusaError.Types.INVALID_DATA,
              `Option value ${val} does not exist for option ${key}`
            )
          }

          return {
            id: optionValue.id,
          }
        }
      )

      if (!variantOptions.length) {
        return variant
      }

      return {
        ...variant,
        options: variantOptions,
      }
    })

    return variantsWithOptions
  }

  /**
   * Validate that `data` doesn't create or update a variant to have same options combination
   * as an existing variant on the product.
   * @param data - create / update payloads
   * @param variants - existing variants
   * @protected
   */
  protected static checkIfVariantWithOptionsAlreadyExists(
    data: ((
      | ProductTypes.CreateProductVariantDTO
      | UpdateProductVariantInput
    ) & { options: { id: string }[]; product_id: string })[],
    variants: InferEntityType<typeof ProductVariant>[]
  ) {
    for (const variantData of data) {
      const existingVariant = variants.find((v) => {
        if (
          variantData.product_id! !== v.product_id ||
          !variantData.options?.length
        ) {
          return false
        }

        if ((variantData as UpdateProductVariantInput)?.id === v.id) {
          return false
        }

        return (variantData.options as unknown as { id: string }[])!.every(
          (optionValue) => {
            const variantOptionValue = v.options.find(
              (vo) => vo.id === optionValue.id
            )
            return !!variantOptionValue
          }
        )
      })

      if (existingVariant) {
        throw new MedusaError(
          MedusaError.Types.INVALID_DATA,
          `Variant (${existingVariant.title}) with provided options already exists.`
        )
      }
    }
  }

  /**
   * Validate that array of variants that we are upserting doesn't have variants with the same options.
   * @param variants -
   * @protected
   */
  protected static checkIfVariantsHaveUniqueOptionsCombinations(
    variants: (ProductTypes.UpdateProductVariantDTO & {
      options: { id: string }[]
    })[]
  ) {
    for (let i = 0; i < variants.length; i++) {
      const variant = variants[i]
      for (let j = i + 1; j < variants.length; j++) {
        const compareVariant = variants[j]

        const exists = variant.options?.every(
          (optionValue) =>
            !!compareVariant.options.find(
              (compareOptionValue) => compareOptionValue.id === optionValue.id
            )
        )

        if (exists) {
          throw new MedusaError(
            MedusaError.Types.INVALID_DATA,
            `Variant "${variant.title}" has same combination of option values as "${compareVariant.title}".`
          )
        }
      }
    }
  }
}
