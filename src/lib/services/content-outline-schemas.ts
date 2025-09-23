import { z } from "zod";

import type { OutlineMetadata } from "@/types/workflow";

export const EMPTY_OUTLINE_METADATA: OutlineMetadata = {
  projectName: "",
  projectTagline: "",
  problemStatement: "",
  primaryPersona: {
    presetId: undefined,
    customValue: "",
  },
  secondaryPersonas: {
    presetIds: [],
    customValues: [],
  },
  valuePropositions: {
    presetIds: [],
    customValues: [],
  },
  targetUsers: {
    presetIds: [],
    customValues: [],
  },
  platforms: {
    presetIds: [],
    customValues: [],
  },
  regions: {
    presetIds: [],
    customValues: [],
  },
  strategicRisks: {
    presetIds: [],
    customValues: [],
  },
  notes: "",
};

const MetadataListSelectionSchema = z
  .object({
    presetIds: z.array(z.string()).optional().default([]),
    customValues: z.array(z.string()).optional().default([]),
  })
  .default(EMPTY_OUTLINE_METADATA.secondaryPersonas);

const MetadataSchemaBase = z.object({
  projectName: z
    .string()
    .optional()
    .default(EMPTY_OUTLINE_METADATA.projectName),
  projectTagline: z
    .string()
    .optional()
    .default(EMPTY_OUTLINE_METADATA.projectTagline),
  problemStatement: z
    .string()
    .optional()
    .default(EMPTY_OUTLINE_METADATA.problemStatement),
  primaryPersona: z
    .object({
      presetId: z.string().optional(),
      customValue: z
        .string()
        .optional()
        .default(EMPTY_OUTLINE_METADATA.primaryPersona.customValue),
    })
    .optional()
    .default(EMPTY_OUTLINE_METADATA.primaryPersona),
  secondaryPersonas: MetadataListSelectionSchema.optional().default(
    EMPTY_OUTLINE_METADATA.secondaryPersonas
  ),
  valuePropositions: MetadataListSelectionSchema.optional().default(
    EMPTY_OUTLINE_METADATA.valuePropositions
  ),
  targetUsers: MetadataListSelectionSchema.optional().default(
    EMPTY_OUTLINE_METADATA.targetUsers
  ),
  platforms: MetadataListSelectionSchema.optional().default(
    EMPTY_OUTLINE_METADATA.platforms
  ),
  regions: MetadataListSelectionSchema.optional().default(
    EMPTY_OUTLINE_METADATA.regions
  ),
  strategicRisks: MetadataListSelectionSchema.optional().default(
    EMPTY_OUTLINE_METADATA.strategicRisks
  ),
  notes: z.string().optional().default(EMPTY_OUTLINE_METADATA.notes),
});

export const MetadataSchema = MetadataSchemaBase.default(
  EMPTY_OUTLINE_METADATA
);

export const CustomerJourneySchema = z.object({
  id: z.string(),
  title: z.string(),
  role: z.string(),
  goal: z.string(),
  successCriteria: z.string().optional(),
  steps: z
    .array(
      z.object({
        id: z.string(),
        description: z.string(),
      })
    )
    .optional()
    .default([]),
  painPoints: z.array(z.string()).optional().default([]),
});

export const SuccessMetricFieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  dataType: z
    .enum(["string", "number", "percentage", "boolean", "enum"])
    .optional()
    .default("string"),
  required: z.boolean().optional().default(false),
  allowedValues: z.array(z.string()).optional().default([]),
  sourceSystem: z.string().optional().default(""),
});

export const SuccessMetricSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  fields: z.array(SuccessMetricFieldSchema).optional().default([]),
});

export const ContentOutlineSchema = z.object({
  metadata: MetadataSchema,
  functionalRequirements: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      priority: z.enum(["P0", "P1", "P2"]),
      userStory: z.string().optional(),
      acceptanceCriteria: z.array(z.string()).optional(),
      dependencies: z.array(z.string()).optional(),
      estimatedEffort: z.string().optional(),
    })
  ),
  successMetrics: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      type: z.enum(["engagement", "adoption", "performance", "business"]),
      target: z.string().optional(),
      measurement: z.string().optional(),
      frequency: z.string().optional(),
      owner: z.string().optional(),
    })
  ),
  milestones: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      description: z.string(),
      phase: z.enum([
        "research",
        "design",
        "development",
        "testing",
        "launch",
        "post-launch",
      ]),
      estimatedDate: z.string().optional(),
      dependencies: z.array(z.string()).optional(),
      deliverables: z.array(z.string()).optional(),
    })
  ),
  executiveSummary: z
    .object({
      problemStatement: z.string(),
      proposedSolution: z.string(),
      businessValue: z.string(),
      targetUsers: z.string(),
    })
    .optional(),
  customerJourneys: z.array(CustomerJourneySchema).optional().default([]),
  metricSchemas: z.array(SuccessMetricSchema).optional().default([]),
});
