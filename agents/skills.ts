export type AgentSkill = {
  intent: string;
  description: string;
};

export const conciergeSkills: AgentSkill[] = [
  { intent: "product.search", description: "Find products matching constraints" },
  { intent: "checkout.handoff", description: "Prepare checkout handoff token" },
];

export const brandVoiceSkills: AgentSkill[] = [
  { intent: "copy.review", description: "Review and rewrite copy for compliance" },
];

export const inventorySkills: AgentSkill[] = [
  { intent: "inventory.reserve", description: "Reserve inventory for a SKU" },
];

