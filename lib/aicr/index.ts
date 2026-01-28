/**
 * AICR Platform Integration
 *
 * Provides AI services via the AICR platform:
 *
 * 1. Expert Hierarchy (client.ts):
 *    - SGM (Sales Governance) → SPARCC/SPM → Summit → Platform
 *    - Uses /api/ask/invoke endpoint
 *
 * 2. Unified Gateway (gateway-client.ts):
 *    - Chat completions via /api/v1/chat
 *    - Budget enforcement, rate limiting, response caching
 */

// Expert hierarchy client
export {
  AICRClient,
  getAICRClient,
  isAICRConfigured,
  askGovernance,
  type AskSGMRequest,
  type AskSGMResponse,
  type AICRClientConfig,
  type SpineSearchOptions,
  type SpineSearchResult,
  type SpineSearchResponse,
} from './client';

// Unified gateway client
export {
  AICRGatewayClient,
  getAICRGatewayClient,
  isAICRGatewayConfigured,
  GATEWAY_MODELS,
  type GatewayChatMessage,
  type GatewayChatRequest,
  type GatewayChatResponse,
  type GatewayBudgetStatus,
  type GatewayModel,
} from './gateway-client';
