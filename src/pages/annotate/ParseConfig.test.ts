import { describe, expect, it } from "vitest"
import { isValidConfig, parseJsonConfig } from "./ParseJsonConfig"
import { parseStandoffConfig } from "./ParseStandoffConfig"

describe("parseStandoffConfig", () => {
  it("parses entities, entity attributes and global attributes", () => {
    const content = [
      "[entities]",
      "Drug",
      "Dose",
      "",
      "[relations]",
      "Treats Arg1:Drug, Arg2:Condition",
      "",
      "[attributes]",
      "Route Arg:Drug, Value:oral|iv|",
      "Negated Arg:<ENTITY>, Value:yes|no",
      "Unit Arg:Missing, Value:mg",
      "",
      "[events]",
    ].join("\n")

    expect(parseStandoffConfig(content)).toEqual({
      entities: [
        {
          name: "Drug",
          attributes: [{ name: "Route", values: ["oral", "iv"], allowCustomValues: false }],
        },
        { name: "Dose", attributes: [] },
      ],
      globalAttributes: [{ name: "Negated", values: ["yes", "no"], allowCustomValues: false }],
    })
  })

  it("matches section headers case-insensitively", () => {
    expect(parseStandoffConfig("[ENTITIES]\nDrug\n").entities).toEqual([
      { name: "Drug", attributes: [] },
    ])
  })

  it("returns an empty config when there are no sections", () => {
    expect(parseStandoffConfig("")).toEqual({ entities: [], globalAttributes: [] })
  })
})

describe("parseJsonConfig and isValidConfig", () => {
  const config = {
    entities: [
      { name: "Drug", attributes: [{ name: "Route", values: ["oral"], allowCustomValues: true }] },
    ],
    globalAttributes: [{ name: "Negated", values: [], allowCustomValues: false }],
  }

  it("round-trips a valid config", () => {
    const parsed = parseJsonConfig(JSON.stringify(config))

    expect(parsed).toEqual(config)
    expect(isValidConfig(parsed)).toBe(true)
  })

  it.each([
    ["null", null],
    ["missing entities", { globalAttributes: [] }],
    ["missing globalAttributes", { entities: [] }],
    ["entity without a name", { entities: [{ attributes: [] }], globalAttributes: [] }],
    ["entity without attributes", { entities: [{ name: "Drug" }], globalAttributes: [] }],
    [
      "attribute with non-string values",
      { entities: [], globalAttributes: [{ name: "Dose", values: [10], allowCustomValues: false }] },
    ],
    [
      "attribute without allowCustomValues",
      { entities: [], globalAttributes: [{ name: "Dose", values: [] }] },
    ],
  ])("rejects %s", (_label, value) => {
    expect(isValidConfig(value)).toBe(false)
  })
})
