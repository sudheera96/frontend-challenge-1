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

  await document.modelContext.registerTool({
    name: "compare_healthcare_prices",
    title: "Compare Healthcare Prices",
    description:
      "Compare healthcare claim prices for a procedure. Returns claim count, average, minimum, and maximum billed, allowed, and paid amounts, plus calculated differences between billed, allowed, and paid amounts.",
    inputSchema: {
      type: "object",
      properties: {
        procedureCode: {
          type: "string",
          description: "Procedure code to analyze.",
        },
      },
      required: ["procedureCode"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
    },
    execute: async ({
      procedureCode,
    }: {
      procedureCode: string;
    }) => {
      const claims = await getClaims();

      const matches = claims.filter(
        (claim) =>
          claim.procedureCode.toLowerCase() === procedureCode.toLowerCase()
      );

      if (matches.length === 0) {
        return JSON.stringify({
          procedureCode,
          matchCount: 0,
          message: "No claims found for this procedure code.",
        });
      }

      const billedValues = matches.map((claim) => claim.billed);
      const allowedValues = matches.map((claim) => claim.allowed);
      const paidValues = matches.map((claim) => claim.paid);

      const totalBilled = billedValues.reduce(
        (sum, value) => sum + value,
        0
      );

      const totalAllowed = allowedValues.reduce(
        (sum, value) => sum + value,
        0
      );

      const totalPaid = paidValues.reduce(
        (sum, value) => sum + value,
        0
      );

      const average = (values: number[]) =>
        values.reduce((sum, value) => sum + value, 0) / values.length;

      return JSON.stringify({
        procedureCode,
        matchCount: matches.length,

        billed: {
          average: average(billedValues),
          minimum: Math.min(...billedValues),
          maximum: Math.max(...billedValues),
          total: totalBilled,
        },

        allowed: {
          average: average(allowedValues),
          minimum: Math.min(...allowedValues),
          maximum: Math.max(...allowedValues),
          total: totalAllowed,
        },

        paid: {
          average: average(paidValues),
          minimum: Math.min(...paidValues),
          maximum: Math.max(...paidValues),
          total: totalPaid,
        },

        paymentBreakdown: {
          billedMinusAllowed: totalBilled - totalAllowed,
          allowedMinusPaid: totalAllowed - totalPaid,
          billedMinusPaid: totalBilled - totalPaid,
        },

        providers: [
          ...new Set(matches.map((claim) => claim.providerName)),
        ],
      });
    },
  });

  await document.modelContext.registerTool({
    name: "summarize_provider_claims",
    title: "Summarize Provider Claims",
    description:
      "Summarize healthcare claims for a provider. Returns claim count, total billed, total allowed, total paid, average allowed amount, and procedures used by the provider.",
    inputSchema: {
      type: "object",
      properties: {
        providerName: {
          type: "string",
          description: "Provider name to summarize.",
        },
      },
      required: ["providerName"],
      additionalProperties: false,
    },
    annotations: {
      readOnlyHint: true,
    },
    execute: async ({
      providerName,
    }: {
      providerName: string;
    }) => {
      const claims = await getClaims();

      const matches = claims.filter((claim) =>
        claim.providerName
          .toLowerCase()
          .includes(providerName.toLowerCase())
      );

      if (matches.length === 0) {
        return JSON.stringify({
          providerName,
          matchCount: 0,
          message: "No claims found for this provider.",
        });
      }

      const totalBilled = matches.reduce(
        (sum, claim) => sum + claim.billed,
        0
      );

      const totalAllowed = matches.reduce(
        (sum, claim) => sum + claim.allowed,
        0
      );

      const totalPaid = matches.reduce(
        (sum, claim) => sum + claim.paid,
        0
      );

      const averageAllowed = totalAllowed / matches.length;

      const procedures = [
        ...new Set(matches.map((claim) => claim.procedureCode)),
      ];

      return JSON.stringify({
        providerName: matches[0].providerName,
        matchCount: matches.length,
        totalBilled,
        totalAllowed,
        totalPaid,
        averageAllowed,
        procedures,
      });
    },
  });

  toolsRegistered = true;
}