export const phase1CurriculumModules = [
  {
    key: "dog_behavior_stress",
    title: "Dog behavior and stress signals",
    description: "Identify observable dog behaviors and stress signals in non-contact observation.",
    tags: ["behavior", "stress", "animal_welfare"]
  },
  {
    key: "one_health_zoonosis",
    title: "One Health and zoonotic disease prevention",
    description: "Understand connections among human, animal, and environmental health.",
    tags: ["one_health", "zoonosis", "public_health"]
  },
  {
    key: "urban_ecology_population_habitat",
    title: "Urban ecology, population, and habitat",
    description: "Use urban ecology concepts to understand shelter animals, populations, and habitats.",
    tags: ["urban_ecology", "population", "habitat"]
  },
  {
    key: "shelter_safety",
    title: "Shelter safety rules",
    description: "Understand approved zones, non-contact observation, and incident reporting.",
    tags: ["safety", "non_contact", "incident"]
  },
  {
    key: "research_ethics_data_quality",
    title: "Research ethics and data quality",
    description: "Practice data minimization, objective notes, review, and data quality.",
    tags: ["ethics", "data_quality", "privacy"]
  }
] as const;

export const curriculumModules = phase1CurriculumModules;
export const passingScore = 80;

export function certificateStatusForScore(score: number): "eligible" | "unavailable" {
  return score >= passingScore ? "eligible" : "unavailable";
}
