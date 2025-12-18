// AI Configuration for SGM SPARCC
// Note: Rally packages (@rally/blocks-ai, @rally/ai-contracts) are optional
// This config is used when Rally AppShell is available

export type RagDomain = "spm_plans" | "governance" | "interviews" | "frameworks";

export interface AIBlockConfig {
  enabled: boolean;
  slot: string;
  config?: Record<string, any>;
}

export interface AIManifest {
  blocks: Record<string, AIBlockConfig>;
}

export const aiManifest: AIManifest = {
  blocks: {
    opsChief: {
      enabled: true,
      slot: "global.overlay.bottomLeft",
      config: {
        appName: "SGM SPARCC",
        endpoint: "/api/ai/opschief"
      }
    },
    askItem: {
      enabled: true,
      slot: "global.overlay.bottomRight",
      config: {
        appName: "SGM",
        askEndpoint: "/api/ai/asksgm"
      }
    },
    glowBar: {
      enabled: true,
      slot: "global.overlay.bottomCenter"
    },
  },
};

export const enabledRagDomains: RagDomain[] = ["spm_plans", "governance", "interviews", "frameworks"];

export const aiConfig = {
  telemetryBufferCapacity: 100,
  signalBusCapacity: 50,
  ragDomainsEnabled: enabledRagDomains,
};
