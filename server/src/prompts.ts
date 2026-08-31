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

export function documentAnnotationsPrompt(
  document: string,
  config: unknown,
  annotations: unknown,
  guidelines?: string,
): string {
  const guidelinesBlock = guidelines?.trim()
    ? `
Guidelines (follow these if they do not conflict with the rules below):
${guidelines.trim()}
`
    : ""

  return `You're an expert document annotator. Suggest annotations for a document using a provided config of allowed entities and attributes.

Example:
Document: Dr. Gupta prescribed 10mg of Sodium Valporate twice a day. Her mother has also been prescribed Sodium Valporate at 50mg.
Config: {"entities":[{"name":"Prescription","attributes":[{"name":"Frequency","values":[],"allowCustomValues":true},{"name":"Unit","values":["g","mg","ml"],"allowCustomValues":true},{"name":"Dose","values":[],"allowCustomValues":true},{"name":"Name","values":[],"allowCustomValues":true}]}],"globalAttributes":[]}
Current annotations: []
Suggestion: {"annotations":[{"entity":"Prescription","text_span":"10mg of Sodium Valporate twice a day","attributes":{"Frequency":"twice a day","Unit":"mg","Dose":"10","Name":"Sodium Valporate"}},{"entity":"Prescription","text_span":"Sodium Valporate at 50mg","attributes":{"Unit":"mg","Dose":"50","Name":"Sodium Valporate"}}]}

Rules:
- Respond with valid JSON only: {"annotations":[{"entity":"<name>","text_span":"<exact substring>","attributes":{}}]}
- The suggested entity must be in the config.
- Each attribute key must belong to that entity or to global attributes.
- Each attribute value must appear inside the corresponding text_span.
- text_span must be copied exactly from the document (an exact substring).
- Do not suggest spans that overlap current annotations.
- Prefer fewer high-quality annotations over many weak ones.
- If nothing fits, respond with {"annotations":[]}.
${guidelinesBlock}
Document: ${document}
Config: ${JSON.stringify(config)}
Current annotations: ${JSON.stringify(annotations)}
Suggestion:`
}

export function searchExpandPrompt(query: string): string {
  return `You turn a document search query into retrieval keywords and a match criterion.

Rules:
- Respond with valid JSON only.
- keywords: 4 to 16 terms and synonyms that would appear in matching documents. Include morphological variants (for example female, woman, she). Do not include stopwords.
- criteria: one sentence describing what a matching document must satisfy. This is used as a yes/no filter.

Query: ${query}
`
}

export function searchJudgePrompt(
  criteria: string,
  documents: Array<{ id: string, name: string, text: string }>,
): string {
  return `You decide whether each document matches a search criterion.

Rules:
- Respond with valid JSON only: {"results":[{"id":"<id>","match":true,"reason":"<short why>","snippet":"<short quote>"}]}
- Include every document id exactly once.
- match is true only if the document clearly satisfies the criterion.
- reason is at most 20 words.
- snippet is a short exact quote from the document, or an empty string.

Criterion: ${criteria}
Documents: ${JSON.stringify(documents)}
`
}
