import { loadClaims, type Claim } from "../data/claims";

let claimsPromise: Promise<Claim[]> | null = null;
let toolsRegistered = false;

const getClaims = async (): Promise<Claim[]> => {
  if (!claimsPromise) {
    claimsPromise = loadClaims();
  }

  return claimsPromise;
};

export async function registerWebMCPTools() {
  if (toolsRegistered) {
    return;
  }

  if (!("modelContext" in document)) {
    console.warn("WebMCP is not available in this browser.");
    return;
  }

  await document.modelContext.registerTool({
    name: "search_healthcare_claims",
    title: "Search Healthcare Claims",
    description:
      "Search the healthcare claims dataset by provider, procedure code, or place of service. Returns matching claims with billed, allowed, and paid amounts.",
    inputSchema: {
      type: "object",
      properties: {
        providerName: {
          type: "string",
          description: "Optional provider name to search for.",
        },
        procedureCode: {
          type: "string",
          description: "Optional procedure code to search for.",
        },
        placeOfService: {
          type: "string",
          description: "Optional place of service to search for.",
        },
      },
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
    },
    execute: async ({
      providerName,
      procedureCode,
      placeOfService,
    }: {
      providerName?: string;
      procedureCode?: string;
      placeOfService?: string;
    }) => {
      const claims = await getClaims();

      const matches = claims.filter((claim) => {
        const providerMatches =
          !providerName ||
          claim.providerName
            .toLowerCase()
            .includes(providerName.toLowerCase());

        const procedureMatches =
          !procedureCode ||
          claim.procedureCode
            .toLowerCase()
            .includes(procedureCode.toLowerCase());

        const placeMatches =
          !placeOfService ||
          claim.placeOfService
            .toLowerCase()
            .includes(placeOfService.toLowerCase());

        return providerMatches && procedureMatches && placeMatches;
      });

      return JSON.stringify({
        matchCount: matches.length,
        claims: matches.slice(0, 50).map((claim) => ({
          claimId: claim.claimId,
          providerName: claim.providerName,
          procedureCode: claim.procedureCode,
          billed: claim.billed,
          allowed: claim.allowed,
          paid: claim.paid,
          placeOfService: claim.placeOfService,
          serviceDate: claim.serviceDate,
          claimStatus: claim.claimStatus,
        })),
      });
    },
  });

  toolsRegistered = true;
}