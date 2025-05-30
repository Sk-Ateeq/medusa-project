import DmlGenerator from "../classes/generators/dml.js"
import DocblockGenerator from "../classes/generators/docblock.js"
import EventsGenerator from "../classes/generators/events.js"
import { Options } from "../classes/generators/index.js"
import OasGenerator from "../classes/generators/oas.js"
import RouteExamplesGenerator from "../classes/generators/route-examples.js"
import { CommonCliOptions } from "../types/index.js"

export default async function run(
  paths: string[],
  { type, ...options }: Omit<Options, "paths"> & CommonCliOptions
) {
  console.log("Running...")

  if (type === "all" || type === "docs") {
    const docblockGenerator = new DocblockGenerator({
      paths,
      ...options,
    })

    await docblockGenerator.run()
  }

  if (type === "all" || type === "oas") {
    const oasGenerator = new OasGenerator({
      paths,
      ...options,
    })

    await oasGenerator.run()
  }

  if (type === "all" || type === "dml") {
    const dmlGenerator = new DmlGenerator({
      paths,
      ...options,
    })

    await dmlGenerator.run()
  }

  if (type === "all" || type === "route-examples") {
    const routeExamplesGenerator = new RouteExamplesGenerator({
      paths,
      ...options,
    })

    await routeExamplesGenerator.run()
  }

  if (type === "all" || type === "events") {
    const eventsGenerator = new EventsGenerator({
      paths,
      ...options,
    })

    await eventsGenerator.run()
  }

  console.log(`Finished running.`)
}
