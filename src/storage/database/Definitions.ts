/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  "/": {
    get: {
      responses: {
        /** OK */
        200: unknown;
      };
    };
  };
  "/workspace_annotation": {
    get: {
      parameters: {
        query: {
          id?: parameters["rowFilter.workspace_annotation.id"];
          created_at?: parameters["rowFilter.workspace_annotation.created_at"];
          document_id?: parameters["rowFilter.workspace_annotation.document_id"];
          entity?: parameters["rowFilter.workspace_annotation.entity"];
          start_index?: parameters["rowFilter.workspace_annotation.start_index"];
          end_index?: parameters["rowFilter.workspace_annotation.end_index"];
          attributes?: parameters["rowFilter.workspace_annotation.attributes"];
          text?: parameters["rowFilter.workspace_annotation.text"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["workspace_annotation"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** workspace_annotation */
          workspace_annotation?: definitions["workspace_annotation"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          id?: parameters["rowFilter.workspace_annotation.id"];
          created_at?: parameters["rowFilter.workspace_annotation.created_at"];
          document_id?: parameters["rowFilter.workspace_annotation.document_id"];
          entity?: parameters["rowFilter.workspace_annotation.entity"];
          start_index?: parameters["rowFilter.workspace_annotation.start_index"];
          end_index?: parameters["rowFilter.workspace_annotation.end_index"];
          attributes?: parameters["rowFilter.workspace_annotation.attributes"];
          text?: parameters["rowFilter.workspace_annotation.text"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          id?: parameters["rowFilter.workspace_annotation.id"];
          created_at?: parameters["rowFilter.workspace_annotation.created_at"];
          document_id?: parameters["rowFilter.workspace_annotation.document_id"];
          entity?: parameters["rowFilter.workspace_annotation.entity"];
          start_index?: parameters["rowFilter.workspace_annotation.start_index"];
          end_index?: parameters["rowFilter.workspace_annotation.end_index"];
          attributes?: parameters["rowFilter.workspace_annotation.attributes"];
          text?: parameters["rowFilter.workspace_annotation.text"];
        };
        body: {
          /** workspace_annotation */
          workspace_annotation?: definitions["workspace_annotation"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
  "/workspace_access": {
    get: {
      parameters: {
        query: {
          id?: parameters["rowFilter.workspace_access.id"];
          created_at?: parameters["rowFilter.workspace_access.created_at"];
          user_id?: parameters["rowFilter.workspace_access.user_id"];
          workspace_id?: parameters["rowFilter.workspace_access.workspace_id"];
          role?: parameters["rowFilter.workspace_access.role"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["workspace_access"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** workspace_access */
          workspace_access?: definitions["workspace_access"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          id?: parameters["rowFilter.workspace_access.id"];
          created_at?: parameters["rowFilter.workspace_access.created_at"];
          user_id?: parameters["rowFilter.workspace_access.user_id"];
          workspace_id?: parameters["rowFilter.workspace_access.workspace_id"];
          role?: parameters["rowFilter.workspace_access.role"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          id?: parameters["rowFilter.workspace_access.id"];
          created_at?: parameters["rowFilter.workspace_access.created_at"];
          user_id?: parameters["rowFilter.workspace_access.user_id"];
          workspace_id?: parameters["rowFilter.workspace_access.workspace_id"];
          role?: parameters["rowFilter.workspace_access.role"];
        };
        body: {
          /** workspace_access */
          workspace_access?: definitions["workspace_access"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
  "/ontology_concept": {
    get: {
      parameters: {
        query: {
          id?: parameters["rowFilter.ontology_concept.id"];
          created_at?: parameters["rowFilter.ontology_concept.created_at"];
          ontology_id?: parameters["rowFilter.ontology_concept.ontology_id"];
          concept?: parameters["rowFilter.ontology_concept.concept"];
          code?: parameters["rowFilter.ontology_concept.code"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["ontology_concept"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** ontology_concept */
          ontology_concept?: definitions["ontology_concept"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          id?: parameters["rowFilter.ontology_concept.id"];
          created_at?: parameters["rowFilter.ontology_concept.created_at"];
          ontology_id?: parameters["rowFilter.ontology_concept.ontology_id"];
          concept?: parameters["rowFilter.ontology_concept.concept"];
          code?: parameters["rowFilter.ontology_concept.code"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          id?: parameters["rowFilter.ontology_concept.id"];
          created_at?: parameters["rowFilter.ontology_concept.created_at"];
          ontology_id?: parameters["rowFilter.ontology_concept.ontology_id"];
          concept?: parameters["rowFilter.ontology_concept.concept"];
          code?: parameters["rowFilter.ontology_concept.code"];
        };
        body: {
          /** ontology_concept */
          ontology_concept?: definitions["ontology_concept"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
  "/workspace_config": {
    get: {
      parameters: {
        query: {
          id?: parameters["rowFilter.workspace_config.id"];
          created_at?: parameters["rowFilter.workspace_config.created_at"];
          workspace_id?: parameters["rowFilter.workspace_config.workspace_id"];
          name?: parameters["rowFilter.workspace_config.name"];
          content?: parameters["rowFilter.workspace_config.content"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["workspace_config"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** workspace_config */
          workspace_config?: definitions["workspace_config"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          id?: parameters["rowFilter.workspace_config.id"];
          created_at?: parameters["rowFilter.workspace_config.created_at"];
          workspace_id?: parameters["rowFilter.workspace_config.workspace_id"];
          name?: parameters["rowFilter.workspace_config.name"];
          content?: parameters["rowFilter.workspace_config.content"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          id?: parameters["rowFilter.workspace_config.id"];
          created_at?: parameters["rowFilter.workspace_config.created_at"];
          workspace_id?: parameters["rowFilter.workspace_config.workspace_id"];
          name?: parameters["rowFilter.workspace_config.name"];
          content?: parameters["rowFilter.workspace_config.content"];
        };
        body: {
          /** workspace_config */
          workspace_config?: definitions["workspace_config"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
  "/workspace": {
    get: {
      parameters: {
        query: {
          id?: parameters["rowFilter.workspace.id"];
          created_at?: parameters["rowFilter.workspace.created_at"];
          name?: parameters["rowFilter.workspace.name"];
          description?: parameters["rowFilter.workspace.description"];
          views?: parameters["rowFilter.workspace.views"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["workspace"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** workspace */
          workspace?: definitions["workspace"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          id?: parameters["rowFilter.workspace.id"];
          created_at?: parameters["rowFilter.workspace.created_at"];
          name?: parameters["rowFilter.workspace.name"];
          description?: parameters["rowFilter.workspace.description"];
          views?: parameters["rowFilter.workspace.views"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          id?: parameters["rowFilter.workspace.id"];
          created_at?: parameters["rowFilter.workspace.created_at"];
          name?: parameters["rowFilter.workspace.name"];
          description?: parameters["rowFilter.workspace.description"];
          views?: parameters["rowFilter.workspace.views"];
        };
        body: {
          /** workspace */
          workspace?: definitions["workspace"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
  "/ontology": {
    get: {
      parameters: {
        query: {
          id?: parameters["rowFilter.ontology.id"];
          created_at?: parameters["rowFilter.ontology.created_at"];
          name?: parameters["rowFilter.ontology.name"];
          description?: parameters["rowFilter.ontology.description"];
          is_default?: parameters["rowFilter.ontology.is_default"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["ontology"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** ontology */
          ontology?: definitions["ontology"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          id?: parameters["rowFilter.ontology.id"];
          created_at?: parameters["rowFilter.ontology.created_at"];
          name?: parameters["rowFilter.ontology.name"];
          description?: parameters["rowFilter.ontology.description"];
          is_default?: parameters["rowFilter.ontology.is_default"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          id?: parameters["rowFilter.ontology.id"];
          created_at?: parameters["rowFilter.ontology.created_at"];
          name?: parameters["rowFilter.ontology.name"];
          description?: parameters["rowFilter.ontology.description"];
          is_default?: parameters["rowFilter.ontology.is_default"];
        };
        body: {
          /** ontology */
          ontology?: definitions["ontology"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
  "/workspace_document": {
    get: {
      parameters: {
        query: {
          id?: parameters["rowFilter.workspace_document.id"];
          created_at?: parameters["rowFilter.workspace_document.created_at"];
          workspace_id?: parameters["rowFilter.workspace_document.workspace_id"];
          name?: parameters["rowFilter.workspace_document.name"];
          content?: parameters["rowFilter.workspace_document.content"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["workspace_document"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** workspace_document */
          workspace_document?: definitions["workspace_document"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          id?: parameters["rowFilter.workspace_document.id"];
          created_at?: parameters["rowFilter.workspace_document.created_at"];
          workspace_id?: parameters["rowFilter.workspace_document.workspace_id"];
          name?: parameters["rowFilter.workspace_document.name"];
          content?: parameters["rowFilter.workspace_document.content"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          id?: parameters["rowFilter.workspace_document.id"];
          created_at?: parameters["rowFilter.workspace_document.created_at"];
          workspace_id?: parameters["rowFilter.workspace_document.workspace_id"];
          name?: parameters["rowFilter.workspace_document.name"];
          content?: parameters["rowFilter.workspace_document.content"];
        };
        body: {
          /** workspace_document */
          workspace_document?: definitions["workspace_document"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
  "/ontology_access": {
    get: {
      parameters: {
        query: {
          id?: parameters["rowFilter.ontology_access.id"];
          created_at?: parameters["rowFilter.ontology_access.created_at"];
          user_id?: parameters["rowFilter.ontology_access.user_id"];
          ontology_id?: parameters["rowFilter.ontology_access.ontology_id"];
          is_owner?: parameters["rowFilter.ontology_access.is_owner"];
          /** Filtering Columns */
          select?: parameters["select"];
          /** Ordering */
          order?: parameters["order"];
          /** Limiting and Pagination */
          offset?: parameters["offset"];
          /** Limiting and Pagination */
          limit?: parameters["limit"];
        };
        header: {
          /** Limiting and Pagination */
          Range?: parameters["range"];
          /** Limiting and Pagination */
          "Range-Unit"?: parameters["rangeUnit"];
          /** Preference */
          Prefer?: parameters["preferCount"];
        };
      };
      responses: {
        /** OK */
        200: {
          schema: definitions["ontology_access"][];
        };
        /** Partial Content */
        206: unknown;
      };
    };
    post: {
      parameters: {
        body: {
          /** ontology_access */
          ontology_access?: definitions["ontology_access"];
        };
        query: {
          /** Filtering Columns */
          select?: parameters["select"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** Created */
        201: unknown;
      };
    };
    delete: {
      parameters: {
        query: {
          id?: parameters["rowFilter.ontology_access.id"];
          created_at?: parameters["rowFilter.ontology_access.created_at"];
          user_id?: parameters["rowFilter.ontology_access.user_id"];
          ontology_id?: parameters["rowFilter.ontology_access.ontology_id"];
          is_owner?: parameters["rowFilter.ontology_access.is_owner"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
    patch: {
      parameters: {
        query: {
          id?: parameters["rowFilter.ontology_access.id"];
          created_at?: parameters["rowFilter.ontology_access.created_at"];
          user_id?: parameters["rowFilter.ontology_access.user_id"];
          ontology_id?: parameters["rowFilter.ontology_access.ontology_id"];
          is_owner?: parameters["rowFilter.ontology_access.is_owner"];
        };
        body: {
          /** ontology_access */
          ontology_access?: definitions["ontology_access"];
        };
        header: {
          /** Preference */
          Prefer?: parameters["preferReturn"];
        };
      };
      responses: {
        /** No Content */
        204: never;
      };
    };
  };
}

export interface definitions {
  workspace_annotation: {
    /**
     * Format: uuid
     * @description Note:
     * This is a Primary Key.<pk/>
     * @default gen_random_uuid()
     */
    id: string;
    /**
     * Format: timestamp without time zone
     * @default now()
     */
    created_at: string;
    /** Format: uuid */
    document_id: string;
    /** Format: character varying */
    entity: string;
    /** Format: integer */
    start_index: number;
    /** Format: integer */
    end_index: number;
    /** Format: jsonb */
    attributes: any;
    /** Format: text */
    text: string;
  };
  workspace_access: {
    /**
     * Format: uuid
     * @description Note:
     * This is a Primary Key.<pk/>
     * @default gen_random_uuid()
     */
    id: string;
    /**
     * Format: timestamp without time zone
     * @default now()
     */
    created_at: string;
    /** Format: uuid */
    user_id: string;
    /** Format: uuid */
    workspace_id: string;
    /** Format: character varying */
    role?: string;
  };
  ontology_concept: {
    /**
     * Format: uuid
     * @description Note:
     * This is a Primary Key.<pk/>
     * @default gen_random_uuid()
     */
    id: string;
    /**
     * Format: timestamp without time zone
     * @default now()
     */
    created_at: string;
    /**
     * Format: uuid
     * @description Note:
     * This is a Foreign Key to `ontology.id`.<fk table='ontology' column='id'/>
     */
    ontology_id: string;
    /** Format: character varying */
    concept: string;
    /** Format: character varying */
    code: string;
  };
  workspace_config: {
    /**
     * Format: uuid
     * @description Note:
     * This is a Primary Key.<pk/>
     * @default gen_random_uuid()
     */
    id: string;
    /**
     * Format: timestamp without time zone
     * @default now()
     */
    created_at: string;
    /** Format: uuid */
    workspace_id: string;
    /** Format: character varying */
    name: string;
    /** Format: text */
    content: string;
  };
  workspace: {
    /**
     * Format: uuid
     * @description Note:
     * This is a Primary Key.<pk/>
     * @default gen_random_uuid()
     */
    id: string;
    /**
     * Format: timestamp without time zone
     * @default now()
     */
    created_at: string;
    /** Format: character varying */
    name: string;
    /** Format: text */
    description?: string;
    /**
     * Format: integer
     * @default 0
     */
    views: number;
  };
  ontology: {
    /**
     * Format: uuid
     * @description Note:
     * This is a Primary Key.<pk/>
     * @default gen_random_uuid()
     */
    id: string;
    /**
     * Format: timestamp without time zone
     * @default now()
     */
    created_at: string;
    /** Format: character varying */
    name: string;
    /** Format: text */
    description?: string;
    /**
     * Format: boolean
     * @default false
     */
    is_default: boolean;
  };
  workspace_document: {
    /**
     * Format: uuid
     * @description Note:
     * This is a Primary Key.<pk/>
     * @default gen_random_uuid()
     */
    id: string;
    /**
     * Format: timestamp without time zone
     * @default now()
     */
    created_at: string;
    /** Format: uuid */
    workspace_id: string;
    /** Format: character varying */
    name: string;
    /** Format: text */
    content: string;
  };
  ontology_access: {
    /**
     * Format: uuid
     * @description Note:
     * This is a Primary Key.<pk/>
     * @default gen_random_uuid()
     */
    id: string;
    /**
     * Format: timestamp without time zone
     * @default now()
     */
    created_at: string;
    /** Format: uuid */
    user_id: string;
    /**
     * Format: uuid
     * @description Note:
     * This is a Foreign Key to `ontology.id`.<fk table='ontology' column='id'/>
     */
    ontology_id: string;
    /**
     * Format: boolean
     * @default false
     */
    is_owner: boolean;
  };
}

export interface parameters {
  /**
   * @description Preference
   * @enum {string}
   */
  preferParams: "params=single-object";
  /**
   * @description Preference
   * @enum {string}
   */
  preferReturn: "return=representation" | "return=minimal" | "return=none";
  /**
   * @description Preference
   * @enum {string}
   */
  preferCount: "count=none";
  /** @description Filtering Columns */
  select: string;
  /** @description On Conflict */
  on_conflict: string;
  /** @description Ordering */
  order: string;
  /** @description Limiting and Pagination */
  range: string;
  /**
   * @description Limiting and Pagination
   * @default items
   */
  rangeUnit: string;
  /** @description Limiting and Pagination */
  offset: string;
  /** @description Limiting and Pagination */
  limit: string;
  /** @description workspace_annotation */
  "body.workspace_annotation": definitions["workspace_annotation"];
  /** Format: uuid */
  "rowFilter.workspace_annotation.id": string;
  /** Format: timestamp without time zone */
  "rowFilter.workspace_annotation.created_at": string;
  /** Format: uuid */
  "rowFilter.workspace_annotation.document_id": string;
  /** Format: character varying */
  "rowFilter.workspace_annotation.entity": string;
  /** Format: integer */
  "rowFilter.workspace_annotation.start_index": string;
  /** Format: integer */
  "rowFilter.workspace_annotation.end_index": string;
  /** Format: jsonb */
  "rowFilter.workspace_annotation.attributes": string;
  /** Format: text */
  "rowFilter.workspace_annotation.text": string;
  /** @description workspace_access */
  "body.workspace_access": definitions["workspace_access"];
  /** Format: uuid */
  "rowFilter.workspace_access.id": string;
  /** Format: timestamp without time zone */
  "rowFilter.workspace_access.created_at": string;
  /** Format: uuid */
  "rowFilter.workspace_access.user_id": string;
  /** Format: uuid */
  "rowFilter.workspace_access.workspace_id": string;
  /** Format: character varying */
  "rowFilter.workspace_access.role": string;
  /** @description ontology_concept */
  "body.ontology_concept": definitions["ontology_concept"];
  /** Format: uuid */
  "rowFilter.ontology_concept.id": string;
  /** Format: timestamp without time zone */
  "rowFilter.ontology_concept.created_at": string;
  /** Format: uuid */
  "rowFilter.ontology_concept.ontology_id": string;
  /** Format: character varying */
  "rowFilter.ontology_concept.concept": string;
  /** Format: character varying */
  "rowFilter.ontology_concept.code": string;
  /** @description workspace_config */
  "body.workspace_config": definitions["workspace_config"];
  /** Format: uuid */
  "rowFilter.workspace_config.id": string;
  /** Format: timestamp without time zone */
  "rowFilter.workspace_config.created_at": string;
  /** Format: uuid */
  "rowFilter.workspace_config.workspace_id": string;
  /** Format: character varying */
  "rowFilter.workspace_config.name": string;
  /** Format: text */
  "rowFilter.workspace_config.content": string;
  /** @description workspace */
  "body.workspace": definitions["workspace"];
  /** Format: uuid */
  "rowFilter.workspace.id": string;
  /** Format: timestamp without time zone */
  "rowFilter.workspace.created_at": string;
  /** Format: character varying */
  "rowFilter.workspace.name": string;
  /** Format: text */
  "rowFilter.workspace.description": string;
  /** Format: integer */
  "rowFilter.workspace.views": string;
  /** @description ontology */
  "body.ontology": definitions["ontology"];
  /** Format: uuid */
  "rowFilter.ontology.id": string;
  /** Format: timestamp without time zone */
  "rowFilter.ontology.created_at": string;
  /** Format: character varying */
  "rowFilter.ontology.name": string;
  /** Format: text */
  "rowFilter.ontology.description": string;
  /** Format: boolean */
  "rowFilter.ontology.is_default": string;
  /** @description workspace_document */
  "body.workspace_document": definitions["workspace_document"];
  /** Format: uuid */
  "rowFilter.workspace_document.id": string;
  /** Format: timestamp without time zone */
  "rowFilter.workspace_document.created_at": string;
  /** Format: uuid */
  "rowFilter.workspace_document.workspace_id": string;
  /** Format: character varying */
  "rowFilter.workspace_document.name": string;
  /** Format: text */
  "rowFilter.workspace_document.content": string;
  /** @description ontology_access */
  "body.ontology_access": definitions["ontology_access"];
  /** Format: uuid */
  "rowFilter.ontology_access.id": string;
  /** Format: timestamp without time zone */
  "rowFilter.ontology_access.created_at": string;
  /** Format: uuid */
  "rowFilter.ontology_access.user_id": string;
  /** Format: uuid */
  "rowFilter.ontology_access.ontology_id": string;
  /** Format: boolean */
  "rowFilter.ontology_access.is_owner": string;
}

export interface operations {}

export interface external {}
