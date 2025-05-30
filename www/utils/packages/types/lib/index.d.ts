export type SectionKey =
  | "comment"
  | "member_declaration"
  | "member_declaration_title"
  | "member_declaration_comment"
  | "member_declaration_typeParameters"
  | "member_declaration_indexSignature"
  | "member_declaration_signatures"
  | "member_declaration_typeDeclaration"
  | "member_declaration_example"
  | "member_declaration_children"
  | "member_getteSetter_getSignature"
  | "member_getteSetter_setSignature"
  | "member_signatures"
  | "member_getterSetter"
  | "member_reference"
  | "member_signature_title"
  | "member_signature_comment"
  | "member_signature_typeParameters"
  | "member_signature_parameters"
  | "member_signature_example"
  | "member_signature_returns"
  | "member_signature_declarationSignatures"
  | "member_signature_declarationChildren"
  | "member_signature_sources"
  | "member_sources_implementationOf"
  | "member_sources_inheritedFrom"
  | "member_sources_overrides"
  | "member_sources_definedIn"
  | "members_group_categories"
  | "members_categories"
  | "member_returns"
  | "member_force_title"
  | "title_reflectionPath"
  | "reflection_comment"
  | "reflection_typeParameters"
  | "reflection_hierarchy"
  | "reflection_implements"
  | "reflection_implementedBy"
  | "reflection_callable"
  | "reflection_indexable"

export type Sections = {
  [k in SectionKey]?: boolean
}

export type ParameterStyle = "table" | "list" | "component"

export type FormattingOptionsType = {
  [k: string]: FormattingOptionType
}

export type Tag =
  | string
  | {
      name: string
      label: string
    }

export type FrontmatterData = {
  slug?: string
  sidebar_label?: string
  displayed_sidebar?: string
  tags?: Tag[]
  keywords?: string[]
  [k: string]: unknown
}

export type FormattingOptionType = {
  sections?: Sections
  reflectionGroups?: {
    [k: string]: boolean
  }
  reflectionGroupRename?: {
    [k: string]: string
  }
  reflectionCategories?: {
    [k: string]: boolean
  }
  reflectionTitle?: {
    kind?: boolean
    typeParameters?: boolean
    prefix?: string
    suffix?: string
    fullReplacement?: string
  }
  reflectionDescription?: string
  expandMembers?: boolean
  expandProperties?: boolean
  showCommentsAsHeader?: boolean
  showCommentsAsDetails?: boolean
  parameterStyle?: ParameterStyle
  frontmatterData?: FrontmatterData
  parameterComponent?: string
  parameterComponentExtraProps?: Record<string, unknown>
  mdxImports?: string[]
  maxLevel?: number
  fileNameSeparator?: string
  startSections?: string[]
  endSections?: string[]
  shouldIncrementAfterStartSections?: boolean
  hideTocHeaders?: boolean
  workflowDiagramComponent?: string
  isEventsReference?: boolean
  sortMembers?: boolean
}

export type AllowedProjectDocumentsOption = {
  [k: string]: Record<number, boolean>
}

export declare module "typedoc" {
  declare interface TypeDocOptionMap {
    /**
     * Enable resolving internal types.
     * @defaultValue false
     */
    enableInternalResolve: boolean
    /**
     * The name of the internal module. Requires enabling `enableInternalResolve`.
     * @defaultValue "internal"
     */
    internalModule: string
    /**
     * Whether to remove reflections having the `@apiIgnore` tag.
     * @defaultValue false
     */
    ignoreApi: boolean
    /**
     * The path to the ESLint configurations to apply.
     */
    eslintPathName: string
    /**
     * The path to resolve plugins used in the ESLint configurations.
     */
    pluginsResolvePath: string
    /**
     * An object of key-value pairs to be added to frontmatter
     */
    frontmatterData: Record<string, unknown>
    /**
     * [Markdown Plugin] Do not render page title.
     * @defaultValue false
     */
    hidePageTitle: boolean
    /**
     * [Markdown Plugin] Do not render breadcrumbs in template.
     * @defaultValue false
     */
    hideBreadcrumbs: boolean
    /**
     * [Markdown Plugin] Specifies the base path that all links to be served from.
     * If omitted all urls will be relative.
     */
    publicPath: string
    /**
     * [Markdown Plugin] Use HTML named anchors as fragment identifiers for engines
     * that do not automatically assign header ids. Should be set for Bitbucket Server docs.
     * @defaultValue false
     */
    namedAnchors: boolean
    allowedProjectDocuments: AllowedProjectDocumentsOption
    /**
     * [Markdown Plugin] Separator used to format filenames.
     * @defaultValue "."
     */
    filenameSeparator: string
    /**
     * [Markdown Plugin] The file name of the entry document.
     * @defaultValue "README.md"
     */
    entryDocument: string
    /**
     * [Markdown Plugin] Do not render in-page table of contents items.
     * @defaultValue false
     */
    hideInPageTOC: boolean
    /**
     * [Markdown Plugin] Customise the index page title.
     */
    indexTitle: string
    /**
     * [Markdown Plugin] Do not add special symbols for class members.
     * @defaultValue true
     */
    hideMembersSymbol: boolean
    /**
     * [Markdown Plugin] Preserve anchor casing when generating links.
     * @defaultValue false
     */
    preserveAnchorCasing: boolean
    /**
     * [Markdown Plugin] Specify the Type Declaration Render Style
     * @defaultValue table
     */
    objectLiteralTypeDeclarationStyle: ParameterStyle
    /**
     * [Markdown Plugin] Formatting options that can be specified either on a specific document or to all documents
     */
    formatting: FormattingOptionType
    /**
     * [Markdown Plugin] Whether outputted files should have an mdx extension.
     * @defaultValue false
     */
    mdxOutput: boolean
    /**
     * [Markdown Plugin] The maximum level to expand when retrieving reflection types.
     * @defaultValue 3
     */
    maxLevel: number
    /**
     * [Markdown Plugin] Whether to output modules file for namespaces.
     * @defaultValue true
     */
    outputNamespace: boolean
    /**
     * [Markdown Plugin] Whether to output module files.
     * @defaultValue true
     */
    outputModules: boolean
    /**
     * Whether to enable the React Query manipulator.
     * @defaultValue false
     */
    enableReactQueryManipulator: boolean
    /**
     * Namespace names whose child members should have their own documents.
     */
    allReflectionsHaveOwnDocumentInNamespace: string[]
    /**
     * Whether to ignore items with the `@parentIgnore` tag.
     * @defaultValue false
     */
    parentIgnore: boolean
    /**
     * Whether to check for and add variables.
     * @defaultValue false
     */
    checkVariables: boolean
    /**
     * Whether to generate a Mermaid.js class diagram for data models in the reference.
     */
    generateModelsDiagram: boolean
    /**
     * The file to add the mermaid diagram to. The diagram is added as a package comment.
     */
    diagramAddToFile: string
    /**
     * Whether to generate a Mermaid.js class diagram for data models in the reference.
     * (Used for DML)
     */
    generateDMLsDiagram: boolean
    /**
     * The file to add the mermaid diagram to. The diagram is added as a package comment.
     * (Used for DML)
     */
    diagramDMLAddToFile: string
    /**
     * Whether to enable resolving DML relations.
     * @defaultValue false
     */
    resolveDmlRelations: boolean
    /**
     * Whether to normalize DML types.
     * @defaultValue false
     */
    normalizeDmlTypes: boolean
    /**
     * Whether to enable the workflows plugin.
     * @defaultValue false
     */
    enableWorkflowsPlugins: boolean
    /**
     * Whether to enable the namespace generator plugin for paths.
     * @defaultValue false
     */
    enablePathNamespaceGenerator: boolean
    /**
     * The namespaces to generate for paths.
     */
    generatePathNamespaces: NamespaceGenerateDetails[]
    /**
     * Whether to enable the namespace generator plugin for `@customNamespaces` usage.
     * @defaultValue false
     */
    generateCustomNamespaces: boolean
    /**
     * Optionally specify a parent namespace to place all generated custom namespaces in.
     */
    customParentNamespace: string
    /**
     * Optionally specify a name prefix for all custom namespaces.
     */
    customNamespaceNamePrefix: string
    /**
     * Whether to resolve events.
     * @defaultValue false
     */
    enableEventsResolver: boolean
  }
}

export declare type DmlObject = Record<string, string>

export declare type DmlFile = {
  [k: string]: {
    filePath: string
    properties: DmlObject
  }
}

export declare type RouteExamples = {
  [k: string]: {
    [k: string]: string
  }
}

export declare type NamespaceGenerateDetails = {
  /**
   * The namespace's names.
   */
  name: string
  /**
   * The namespace's description. Will be attached
   * as a summary comment.
   */
  description?: string
  /**
   * A path pattern to pass to minimatch that
   * checks if a file / its reflections belong to the
   * namespace
   */
  pathPattern: string
  /**
   * The namespace's children
   */
  children?: NamespaceGenerateDetails[]
}

export declare type MedusaEvent = {
  name: string
  parentName: string
  propertyName: string
  payload: string
  description?: string
  workflows: string[]
  version?: string
  deprecated?: boolean
  deprecated_message?: string
  version?: string
}
