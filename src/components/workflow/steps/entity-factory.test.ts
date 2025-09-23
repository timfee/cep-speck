/**
 * Tests for entity factory consolidation
 * Validates the generic factory pattern works correctly for all entity types
 */

import {
  createMilestone,
  createFunctionalRequirement,
  createSuccessMetric,
} from "./entity-factory";

describe("Entity Factory", () => {
  describe("createMilestone", () => {
    it("should create milestone with required fields", () => {
      const input = {
        title: "Test Milestone",
        description: "Test description",
      };

      const result = createMilestone(input);

      expect(result).toMatchObject({
        title: "Test Milestone",
        description: "Test description",
        phase: "development", // default value
      });
      expect(result.id).toMatch(/^ms-/);
    });

    it("should handle optional fields", () => {
      const input = {
        title: "Test Milestone",
        description: "Test description",
        phase: "testing" as const,
        estimatedDate: "Q2 2024",
        dependencies: ["dep1", "dep2"],
        deliverables: ["doc1", "doc2"],
      };

      const result = createMilestone(input);

      expect(result).toMatchObject({
        title: "Test Milestone",
        description: "Test description",
        phase: "testing",
        estimatedDate: "Q2 2024",
        dependencies: ["dep1", "dep2"],
        deliverables: ["doc1", "doc2"],
      });
    });

    it("should reject empty title", () => {
      const input = {
        title: "",
        description: "Test description",
      };

      expect(() => createMilestone(input)).toThrow(
        "Milestones require a title and description"
      );
    });

    it("should reject placeholder title", () => {
      const input = {
        title: "Enter milestone title here",
        description: "Test description",
      };

      expect(() => createMilestone(input)).toThrow(
        "Provide a milestone title instead of placeholder text"
      );
    });
  });

  describe("createFunctionalRequirement", () => {
    it("should create functional requirement with correct defaults", () => {
      const input = {
        title: "Core Feature",
        description: "Main functionality",
      };

      const result = createFunctionalRequirement(input);

      expect(result).toMatchObject({
        title: "Core Feature",
        description: "Main functionality",
        priority: "P0", // correct default for requirements
      });
      expect(result.id).toMatch(/^fr-/);
    });

    it("should handle complex requirements", () => {
      const input = {
        title: "Advanced Feature",
        description: "Complex functionality",
        priority: "P1" as const,
        userStory: "As a user, I want...",
        acceptanceCriteria: ["Criteria 1", "Criteria 2"],
        dependencies: ["Feature A"],
        estimatedEffort: "2 weeks",
      };

      const result = createFunctionalRequirement(input);

      expect(result).toMatchObject({
        title: "Advanced Feature",
        description: "Complex functionality",
        priority: "P1",
        userStory: "As a user, I want...",
        acceptanceCriteria: ["Criteria 1", "Criteria 2"],
        dependencies: ["Feature A"],
        estimatedEffort: "2 weeks",
      });
    });
  });

  describe("createSuccessMetric", () => {
    it("should create success metric with engagement default", () => {
      const input = {
        name: "User Adoption",
        description: "Measures user engagement",
      };

      const result = createSuccessMetric(input);

      expect(result).toMatchObject({
        name: "User Adoption",
        description: "Measures user engagement",
        type: "engagement", // default type
      });
      expect(result.id).toMatch(/^sm-/);
    });

    it("should handle metric with all fields", () => {
      const input = {
        name: "Daily Active Users",
        description: "Count of daily active users",
        type: "adoption" as const,
        target: "10,000 DAU",
        measurement: "Unique logins per day",
        frequency: "Daily",
        owner: "Product Team",
      };

      const result = createSuccessMetric(input);

      expect(result).toMatchObject({
        name: "Daily Active Users",
        description: "Count of daily active users",
        type: "adoption",
        target: "10,000 DAU",
        measurement: "Unique logins per day",
        frequency: "Daily",
        owner: "Product Team",
      });
    });
  });

  describe("Factory Pattern Consistency", () => {
    it("should generate unique IDs for each entity type", () => {
      const milestone = createMilestone({ title: "M1", description: "D1" });
      const requirement = createFunctionalRequirement({
        title: "R1",
        description: "D1",
      });
      const metric = createSuccessMetric({ name: "S1", description: "D1" });

      // Should have different ID prefixes
      expect(milestone.id).toMatch(/^ms-/);
      expect(requirement.id).toMatch(/^fr-/);
      expect(metric.id).toMatch(/^sm-/);

      // Should all be unique
      expect(milestone.id).not.toBe(requirement.id);
      expect(requirement.id).not.toBe(metric.id);
      expect(milestone.id).not.toBe(metric.id);
    });

    it("should consistently handle normalized optional strings", () => {
      const milestone = createMilestone({
        title: "Test",
        description: "Test",
        estimatedDate: "  Q1 2024  ", // whitespace
      });

      const requirement = createFunctionalRequirement({
        title: "Test",
        description: "Test",
        estimatedEffort: "  2 weeks  ", // whitespace
      });

      // Should trim whitespace consistently
      expect(milestone.estimatedDate).toBe("Q1 2024");
      expect(requirement.estimatedEffort).toBe("2 weeks");
    });
  });
});
