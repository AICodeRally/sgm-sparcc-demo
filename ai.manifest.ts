import type { BlockManifest } from "@rally/blocks-ai";
import type { RagDomain } from "@rally/ai-contracts";

export const aiManifest: BlockManifest = {
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
    glowBar: { enabled: true, slot: "global.overlay.bottomCenter" },
  },
};

export const enabledRagDomains: RagDomain[] = ["spm_plans", "governance", "interviews", "frameworks"];

export const aiConfig = {
  telemetryBufferCapacity: 100,
  signalBusCapacity: 50,
  ragDomainsEnabled: enabledRagDomains,
};
