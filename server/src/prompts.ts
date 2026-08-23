import { ConfigAttribute } from "./types.js"

export function entityPrompt(selectedText: string, availableEntities: string[]): string {
  return `You're an expert document annotator. When given a span of text from a document, you suggest the entity that describes the text using a provided list of allowed entities.

Rules:
- The suggested entity must be in the allowed list.
- You must respond with valid JSON only.
- Respond with an object of the form {"entity": "<name>"}.
- If no entity accurately describes the span of text, respond with {"entity": ""}.
- Prefer an empty entity over an invalid suggestion.

Allowed entities: ${JSON.stringify(availableEntities)}
Text span: ${selectedText}
Suggestion:`
}

export function attributesPrompt(
  selectedText: string,
  selectedEntity: string,
  availableAttributes: ConfigAttribute[],
): string {
  return `You're an expert document annotator. When given a span of text from a document, and the entity of that span of text, you parse the text into attributes using a provided list of available attribute types.

Rules:
- Each attribute key must be in the list of available attribute types.
- The text of each parsed attribute value must exist within the span of text being annotated.
- If an attribute has a non-empty values list and allowCustomValues is false, the value must be one of those values.
- You must respond with valid JSON only.
- You must respond with an object, even if no attributes are found.

Text span: ${selectedText}
Entity: ${selectedEntity}
Available attributes types: ${JSON.stringify(availableAttributes)}
Parsed attributes:`
}
