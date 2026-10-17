import { Autocomplete, Button, Card, CloseButton, Group, Select, Stack, TagsInput, Text, TextInput } from "@mantine/core"
import { IconPlus } from "@tabler/icons-react"
import { IConfig, IConfigAttribute } from "pages/setup/ConfigTable"

export const ANY_ENTITY = "*"

export type ConditionOperator =
  | "is"
  | "isNot"
  | "isAnyOf"
  | "contains"
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "exists"
  | "notExists"

export interface AttributeCondition {
  id: string
  attribute: string | null
  operator: ConditionOperator
  value: string
  values: string[]
}

export interface QueryRule {
  id: string
  include: boolean
  entity: string | null
  text: string
  conditions: AttributeCondition[]
}

const OPERATORS: Array<{ value: ConditionOperator, label: string }> = [
  { value: "is", label: "is" },
  { value: "isNot", label: "is not" },
  { value: "isAnyOf", label: "is any of" },
  { value: "contains", label: "contains" },
  { value: "gt", label: ">" },
  { value: "gte", label: "≥" },
  { value: "lt", label: "<" },
  { value: "lte", label: "≤" },
  { value: "exists", label: "is set" },
  { value: "notExists", label: "is not set" },
]

const COMPARISON_KEYS: Partial<Record<ConditionOperator, string>> = {
  gt: "$gt",
  gte: "$gte",
  lt: "$lt",
  lte: "$lte",
}

export function newQueryRule(): QueryRule {
  return {
    id: crypto.randomUUID(),
    include: true,
    entity: null,
    text: "",
    conditions: [],
  }
}

function newCondition(): AttributeCondition {
  return {
    id: crypto.randomUUID(),
    attribute: null,
    operator: "is",
    value: "",
    values: [],
  }
}

// Builds the JSON filter understood by the server's structured search, or null
// when no rule is complete enough to search with.
export function buildAnnotationQuery(rules: QueryRule[]): string | null {
  const all: object[] = []
  const none: object[] = []

  for (const rule of rules) {
    const filter = ruleFilter(rule)

    if (filter) {
      (rule.include ? all : none).push(filter)
    }
  }

  if (all.length === 0 && none.length === 0) {
    return null
  }

  return JSON.stringify({ $all: all, $none: none })
}

function ruleFilter(rule: QueryRule): object | null {
  const parts: object[] = []

  if (rule.entity && rule.entity !== ANY_ENTITY) {
    parts.push({ entity: rule.entity })
  }

  if (rule.text.trim() !== "") {
    parts.push({ text: { $contains: rule.text.trim() } })
  }

  for (const condition of rule.conditions) {
    const part = conditionFilter(condition)

    if (part) {
      parts.push(part)
    }
  }

  if (parts.length === 0) {
    return rule.entity === ANY_ENTITY ? { entity: { $exists: true } } : null
  }

  return parts.length === 1 ? parts[0] : { $and: parts }
}

function conditionFilter(condition: AttributeCondition): object | null {
  if (!condition.attribute) {
    return null
  }

  const key = `attributes.${condition.attribute}`
  const value = condition.value.trim()

  switch (condition.operator) {
    case "exists":
      return { [key]: { $exists: true } }
    case "notExists":
      return { [key]: { $exists: false } }
    case "isAnyOf":
      return condition.values.length > 0 ? { [key]: { $in: condition.values } } : null
  }

  if (value === "") {
    return null
  }

  switch (condition.operator) {
    case "is":
      return { [key]: value }
    case "isNot":
      return { [key]: { $ne: value } }
    case "contains":
      return { [key]: { $contains: value } }
  }

  // Attribute values have no declared type, so compare numerically whenever
  // the input looks like a number and fall back to text comparison otherwise.
  const number = Number(value)
  return { [key]: { [COMPARISON_KEYS[condition.operator]!]: Number.isFinite(number) ? number : value } }
}

function attributesFor(config: IConfig, entity: string | null): IConfigAttribute[] {
  const entities = entity && entity !== ANY_ENTITY
    ? config.entities.filter((item) => item.name === entity)
    : config.entities
  const byName = new Map<string, IConfigAttribute>()

  for (const attribute of [...entities.flatMap((item) => item.attributes), ...config.globalAttributes]) {
    const existing = byName.get(attribute.name)

    byName.set(attribute.name, existing
      ? {
        name: attribute.name,
        values: [...new Set([...existing.values, ...attribute.values])],
        allowCustomValues: existing.allowCustomValues || attribute.allowCustomValues,
      }
      : attribute)
  }

  return [...byName.values()]
}

interface Props {
  config: IConfig
  rules: QueryRule[]
  onChange: (rules: QueryRule[]) => void
}

function AnnotationQueryBuilder({ config, rules, onChange }: Props) {
  const updateRule = (id: string, patch: Partial<QueryRule>) => {
    onChange(rules.map((rule) => rule.id === id ? { ...rule, ...patch } : rule))
  }

  return (
    <Stack gap={10}>
      {rules.map((rule) => (
        <RuleCard
          key={rule.id}
          config={config}
          rule={rule}
          onChange={(patch) => updateRule(rule.id, patch)}
          onRemove={rules.length > 1 ? () => onChange(rules.filter((item) => item.id !== rule.id)) : undefined}
        />
      ))}

      <Group>
        <Button
          variant="subtle"
          color="brand"
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={() => onChange([...rules, newQueryRule()])}
        >
          Add rule
        </Button>
      </Group>
    </Stack>
  )
}

function RuleCard({
  config,
  rule,
  onChange,
  onRemove,
}: {
  config: IConfig
  rule: QueryRule
  onChange: (patch: Partial<QueryRule>) => void
  onRemove?: () => void
}) {
  const attributes = attributesFor(config, rule.entity)

  const updateCondition = (id: string, patch: Partial<AttributeCondition>) => {
    onChange({
      conditions: rule.conditions.map((condition) => condition.id === id ? { ...condition, ...patch } : condition),
    })
  }

  return (
    <Card withBorder radius={5} p="sm">
      <Group gap={8} wrap="nowrap" align="center">
        <Select
          w={190}
          allowDeselect={false}
          value={rule.include ? "include" : "exclude"}
          onChange={(value) => onChange({ include: value === "include" })}
          data={[
            { value: "include", label: "Has an annotation" },
            { value: "exclude", label: "Has no annotation" },
          ]}
        />

        <Select
          style={{ flex: 1 }}
          placeholder="Select entity"
          searchable
          value={rule.entity}
          onChange={(value) => onChange({ entity: value })}
          data={[
            { value: ANY_ENTITY, label: "Any entity" },
            ...config.entities.map((entity) => ({ value: entity.name, label: entity.name })),
          ]}
        />

        {onRemove && <CloseButton aria-label="Remove rule" onClick={onRemove} />}
      </Group>

      <Group gap={8} wrap="nowrap" mt={8}>
        <Text size="sm" c="dimmed" w={190} ta="right">
          where text contains
        </Text>

        <TextInput
          style={{ flex: 1 }}
          placeholder="Optional"
          value={rule.text}
          onChange={(e) => onChange({ text: e.currentTarget.value })}
        />

        {onRemove && <CloseButton style={{ visibility: "hidden" }} />}
      </Group>

      {rule.conditions.map((condition) => (
        <ConditionRow
          key={condition.id}
          attributes={attributes}
          condition={condition}
          onChange={(patch) => updateCondition(condition.id, patch)}
          onRemove={() => onChange({ conditions: rule.conditions.filter((item) => item.id !== condition.id) })}
        />
      ))}

      <Group mt={8}>
        <Button
          variant="subtle"
          color="gray"
          size="xs"
          leftSection={<IconPlus size={14} />}
          onClick={() => onChange({ conditions: [...rule.conditions, newCondition()] })}
        >
          Add attribute condition
        </Button>
      </Group>
    </Card>
  )
}

function ConditionRow({
  attributes,
  condition,
  onChange,
  onRemove,
}: {
  attributes: IConfigAttribute[]
  condition: AttributeCondition
  onChange: (patch: Partial<AttributeCondition>) => void
  onRemove: () => void
}) {
  const attribute = attributes.find((item) => item.name === condition.attribute)
  const options = attribute?.values ?? []
  const attributeNames = attributes.map((item) => item.name)

  if (condition.attribute && !attributeNames.includes(condition.attribute)) {
    attributeNames.push(condition.attribute)
  }

  return (
    <Group gap={8} wrap="nowrap" mt={8}>
      <Text size="sm" c="dimmed" w={60} ta="right">
        and
      </Text>

      <Select
        w={122}
        placeholder="Attribute"
        searchable
        value={condition.attribute}
        onChange={(value) => onChange({ attribute: value, value: "", values: [] })}
        data={attributeNames}
        nothingFoundMessage="No attributes in config"
      />

      <Select
        w={120}
        allowDeselect={false}
        value={condition.operator}
        onChange={(value) => onChange({ operator: value as ConditionOperator })}
        data={OPERATORS}
      />

      <ConditionValue
        condition={condition}
        options={options}
        allowCustomValues={attribute?.allowCustomValues ?? true}
        onChange={onChange}
      />

      <CloseButton aria-label="Remove condition" onClick={onRemove} />
    </Group>
  )
}

function ConditionValue({
  condition,
  options,
  allowCustomValues,
  onChange,
}: {
  condition: AttributeCondition
  options: string[]
  allowCustomValues: boolean
  onChange: (patch: Partial<AttributeCondition>) => void
}) {
  const style = { flex: 1 }

  if (condition.operator === "exists" || condition.operator === "notExists") {
    return <div style={style} />
  }

  if (condition.operator === "isAnyOf") {
    return (
      <TagsInput
        style={style}
        placeholder={condition.values.length === 0 ? "Values" : undefined}
        data={options}
        value={condition.values}
        onChange={(values) => onChange({ values })}
        acceptValueOnBlur
        clearable
      />
    )
  }

  const choosable = condition.operator === "is" || condition.operator === "isNot"

  if (choosable && options.length > 0 && !allowCustomValues) {
    return (
      <Select
        style={style}
        placeholder="Value"
        value={condition.value || null}
        onChange={(value) => onChange({ value: value ?? "" })}
        data={options}
      />
    )
  }

  return (
    <Autocomplete
      style={style}
      placeholder="Value"
      value={condition.value}
      onChange={(value) => onChange({ value })}
      data={choosable ? options : []}
    />
  )
}

export default AnnotationQueryBuilder
