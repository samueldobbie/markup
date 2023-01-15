function isValidConfig(data: any): boolean {
  if (!data || typeof data !== "object") {
    return false
  }
  
  if (!Array.isArray(data.entities) || !data.entities.every(isValidConfigEntity)) {
    return false
  }
  
  if (!Array.isArray(data.globalAttributes) || !data.globalAttributes.every(isValidConfigAttribute)) {
    return false
  }
  
  return true
}

function isValidConfigEntity(data: any): boolean {
  if (!data || typeof data !== "object") {
    return false
  }
  
  if (typeof data.name !== "string") {
    return false
  }
  
  if (!Array.isArray(data.attributes) || !data.attributes.every(isValidConfigAttribute)) {
    return false
  }
  
  return true
}

function isValidConfigAttribute(data: any): boolean {
  if (!data || typeof data !== "object") {
    return false
  }
  
  if (typeof data.name !== "string") {
    return false
  }
  
  if (!Array.isArray(data.values)) {
    return false
  }
  
  if (typeof data.allowCustomValues !== "boolean") {
    return false
  }

  return true
}

export { isValidConfig }
