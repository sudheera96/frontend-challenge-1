import { useEffect, useMemo, useRef, useState } from "react";
import { loadClaims, type Claim } from "../data/claims";

export default function MainPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [providerSearch, setProviderSearch] = useState("");
  const [procedureSearch, setProcedureSearch] = useState("");
  const [placeSearch, setPlaceSearch] = useState("");

  const [activeTool, setActiveTool] = useState<
    "search" | "compare" | "provider" | null
  >(null);

  const [compareProcedure, setCompareProcedure] = useState("");
  const [summaryProvider, setSummaryProvider] = useState("");

  const searchInputRef = useRef<HTMLInputElement>(null);
  const compareRef = useRef<HTMLDivElement>(null);
  const providerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadClaims()
      .then(setClaims)
      .catch((err) => {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load healthcare claims."
        );
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      const providerMatches =
        !providerSearch ||
        claim.providerName
          .toLowerCase()
          .includes(providerSearch.toLowerCase());

      const procedureMatches =
        !procedureSearch ||
        claim.procedureCode
          .toLowerCase()
          .includes(procedureSearch.toLowerCase());

      const placeMatches =
        !placeSearch ||
        claim.placeOfService
          .toLowerCase()
          .includes(placeSearch.toLowerCase());

      return providerMatches && procedureMatches && placeMatches;
    });
  }, [claims, providerSearch, procedureSearch, placeSearch]);

  const totalBilled = filteredClaims.reduce(
    (sum, claim) => sum + claim.billed,
    0
  );

  const totalAllowed = filteredClaims.reduce(
    (sum, claim) => sum + claim.allowed,
    0
  );

  const totalPaid = filteredClaims.reduce(
    (sum, claim) => sum + claim.paid,
    0
  );

  const comparisonClaims = useMemo(() => {
    if (!compareProcedure.trim()) {
      return [];
    }

    return claims.filter((claim) =>
      claim.procedureCode
        .toLowerCase()
        .includes(compareProcedure.trim().toLowerCase())
    );
  }, [claims, compareProcedure]);

  const comparisonStats = useMemo(() => {
    if (comparisonClaims.length === 0) {
      return null;
    }

    const billed = comparisonClaims.reduce(
      (sum, claim) => sum + claim.billed,
      0
    );

    const allowed = comparisonClaims.reduce(
      (sum, claim) => sum + claim.allowed,
      0
    );

    const paid = comparisonClaims.reduce(
      (sum, claim) => sum + claim.paid,
      0
    );

    return {
      count: comparisonClaims.length,

      totalBilled: billed,
      totalAllowed: allowed,
      totalPaid: paid,

      averageBilled: billed / comparisonClaims.length,
      averageAllowed: allowed / comparisonClaims.length,
      averagePaid: paid / comparisonClaims.length,

      billedAboveAllowed: billed - allowed,
      allowedNotPaid: allowed - paid,
      billedToPaidDifference: billed - paid,

      minAllowed: Math.min(
        ...comparisonClaims.map((claim) => claim.allowed)
      ),

      maxAllowed: Math.max(
        ...comparisonClaims.map((claim) => claim.allowed)
      ),
    };
  }, [comparisonClaims]);

  const providerClaims = useMemo(() => {
    if (!summaryProvider.trim()) {
      return [];
    }

    return claims.filter((claim) =>
      claim.providerName
        .toLowerCase()
        .includes(summaryProvider.trim().toLowerCase())
    );
  }, [claims, summaryProvider]);

  const providerStats = useMemo(() => {
    if (providerClaims.length === 0) {
      return null;
    }

    const billed = providerClaims.reduce(
      (sum, claim) => sum + claim.billed,
      0
    );

    const allowed = providerClaims.reduce(
      (sum, claim) => sum + claim.allowed,
      0
    );

    const paid = providerClaims.reduce(
      (sum, claim) => sum + claim.paid,
      0
    );

    const procedures = new Set(
      providerClaims.map((claim) => claim.procedureCode)
    );

    return {
      count: providerClaims.length,
      billed,
      allowed,
      paid,
      procedureCount: procedures.size,
    };
  }, [providerClaims]);

  const clearFilters = () => {
    setProviderSearch("");
    setProcedureSearch("");
    setPlaceSearch("");
  };

  const activateSearch = () => {
    setActiveTool("search");

    window.setTimeout(() => {
      searchInputRef.current?.focus();
      searchInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);
  };

  const activateCompare = () => {
    setActiveTool("compare");

    window.setTimeout(() => {
      compareRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);
  };

  const activateProvider = () => {
    setActiveTool("provider");

    window.setTimeout(() => {
      providerRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 0);
  };

  return (
    <main className="min-h-full bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <header className="rounded-2xl bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-green-700">
                ClearHealth Agent
              </p>

              <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                Healthcare Price Transparency
              </h1>

              <p className="mt-2 max-w-2xl text-gray-600">
                Explore healthcare claims and let AI agents search the same
                trusted data through WebMCP.
              </p>
            </div>

            <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-600" />

                <span className="font-semibold text-green-800">
                  WebMCP Ready
                </span>
              </div>

              <p className="mt-1 text-xs text-green-700">
                Healthcare claims search is available to AI agents.
              </p>
            </div>
          </div>
        </header>

        {/* Summary cards */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Matching Claims</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              {filteredClaims.length}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Allowed</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              $
              {totalAllowed.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Paid</p>

            <p className="mt-2 text-3xl font-bold text-gray-900">
              $
              {totalPaid.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </section>

        {/* AI Agent capabilities */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
              AI Agent
            </p>

            <h2 className="mt-1 text-xl font-semibold text-gray-900">
              WebMCP Agent Capabilities
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              AI agents can use these tools to work with the same healthcare
              claims data available to people.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {/* Search Claims */}
            <button
              type="button"
              onClick={activateSearch}
              className={`rounded-xl border p-5 text-left transition hover:-translate-y-0.5 hover:border-green-400 hover:shadow-md ${
                activeTool === "search"
                  ? "border-green-500 bg-green-50 shadow-sm"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-lg">
                🔎
              </div>

              <h3 className="font-semibold text-gray-900">
                Search Claims
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Find claims using provider, procedure code, or place of
                service.
              </p>

              <p className="mt-3 font-mono text-xs text-green-700">
                search_healthcare_claims
              </p>

              <p className="mt-3 text-xs font-medium text-green-700">
                Click to search →
              </p>
            </button>

            {/* Compare Prices */}
            <button
              type="button"
              onClick={activateCompare}
              className={`rounded-xl border p-5 text-left transition hover:-translate-y-0.5 hover:border-green-400 hover:shadow-md ${
                activeTool === "compare"
                  ? "border-green-500 bg-green-50 shadow-sm"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-lg">
                💰
              </div>

              <h3 className="font-semibold text-gray-900">
                Compare Prices
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Compare billed, allowed, and paid amounts for a procedure.
              </p>

              <p className="mt-3 font-mono text-xs text-green-700">
                compare_healthcare_prices
              </p>

              <p className="mt-3 text-xs font-medium text-green-700">
                Click to compare →
              </p>
            </button>

            {/* Provider Summary */}
            <button
              type="button"
              onClick={activateProvider}
              className={`rounded-xl border p-5 text-left transition hover:-translate-y-0.5 hover:border-green-400 hover:shadow-md ${
                activeTool === "provider"
                  ? "border-green-500 bg-green-50 shadow-sm"
                  : "border-gray-200 bg-white"
              }`}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-green-50 text-lg">
                📊
              </div>

              <h3 className="font-semibold text-gray-900">
                Provider Summary
              </h3>

              <p className="mt-2 text-sm leading-6 text-gray-500">
                Summarize provider claims, spending, and procedures.
              </p>

              <p className="mt-3 font-mono text-xs text-green-700">
                summarize_provider_claims
              </p>

              <p className="mt-3 text-xs font-medium text-green-700">
                Click to summarize →
              </p>
            </button>
          </div>
        </section>

        {/* Search Claims */}
        <section className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-xl font-semibold text-gray-900">
              Search Claims
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              These filters mirror the capabilities available to the WebMCP
              healthcare claims agent.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label
                htmlFor="provider"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Provider
              </label>

              <input
                ref={searchInputRef}
                id="provider"
                value={providerSearch}
                onChange={(event) => setProviderSearch(event.target.value)}
                placeholder="Search provider..."
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="procedure"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Procedure Code
              </label>

              <input
                id="procedure"
                value={procedureSearch}
                onChange={(event) => setProcedureSearch(event.target.value)}
                placeholder="e.g. s5301"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>

            <div>
              <label
                htmlFor="place"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Place of Service
              </label>

              <input
                id="place"
                value={placeSearch}
                onChange={(event) => setPlaceSearch(event.target.value)}
                placeholder="e.g. Outpatient Hospital"
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none transition focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {filteredClaims.length} of {claims.length} claims
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Clear Filters
            </button>
          </div>
        </section>

        {/* Compare Prices */}
        {activeTool === "compare" && (
          <section
            ref={compareRef}
            className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm"
          >
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                Price Comparison
              </p>

              <h2 className="mt-1 text-xl font-semibold text-gray-900">
                Compare Healthcare Prices
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Enter a procedure code to compare the prices found in the
                claims dataset.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={compareProcedure}
                onChange={(event) => setCompareProcedure(event.target.value)}
                placeholder="Enter procedure code, e.g. s5301"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <button
                type="button"
                onClick={() => setCompareProcedure(compareProcedure.trim())}
                className="rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Compare
              </button>
            </div>

            {compareProcedure.trim() && !comparisonStats && (
              <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
                No claims found for procedure{" "}
                <span className="font-mono font-semibold">
                  {compareProcedure}
                </span>
                .
              </div>
            )}

            {comparisonStats && (
              <div className="mt-5 space-y-5">
                {/* Main price metrics */}
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Claims
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      {comparisonStats.count}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Avg. Billed
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      $
                      {comparisonStats.averageBilled.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Avg. Allowed
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      $
                      {comparisonStats.averageAllowed.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Avg. Paid
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      $
                      {comparisonStats.averagePaid.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>
                  </div>
                </div>

                {/* Payment breakdown */}
                <div className="rounded-xl border border-gray-200 bg-white p-5">
                  <h3 className="font-semibold text-gray-900">
                    Payment Breakdown
                  </h3>

                  <p className="mt-1 text-sm text-gray-500">
                    Differences calculated from the billed, allowed, and paid
                    amounts.
                  </p>

                  <div className="mt-4 grid gap-4 md:grid-cols-3">
                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Billed − Allowed
                      </p>

                      <p className="mt-1 text-xl font-bold text-gray-900">
                        $
                        {comparisonStats.billedAboveAllowed.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Amount above the allowed amount
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Allowed − Paid
                      </p>

                      <p className="mt-1 text-xl font-bold text-gray-900">
                        $
                        {comparisonStats.allowedNotPaid.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Allowed amount not paid
                      </p>
                    </div>

                    <div className="rounded-lg bg-gray-50 p-4">
                      <p className="text-xs uppercase tracking-wide text-gray-400">
                        Billed − Paid
                      </p>

                      <p className="mt-1 text-xl font-bold text-gray-900">
                        $
                        {comparisonStats.billedToPaidDifference.toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        Difference between billed and paid
                      </p>
                    </div>
                  </div>
                </div>

                {/* Allowed range */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Lowest Allowed
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      $
                      {comparisonStats.minAllowed.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>

                  <div className="rounded-xl bg-white p-4">
                    <p className="text-xs uppercase tracking-wide text-gray-400">
                      Highest Allowed
                    </p>

                    <p className="mt-1 text-2xl font-bold text-gray-900">
                      $
                      {comparisonStats.maxAllowed.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-gray-500">
                  Note: These differences describe the claim amounts in the
                  dataset. They do not represent patient responsibility or an
                  amount owed by the patient.
                </p>
              </div>
            )}
          </section>
        )}

        {/* Provider Summary */}
        {activeTool === "provider" && (
          <section
            ref={providerRef}
            className="rounded-2xl border border-green-200 bg-green-50 p-6 shadow-sm"
          >
            <div className="mb-5">
              <p className="text-sm font-semibold uppercase tracking-wider text-green-700">
                Provider Analytics
              </p>

              <h2 className="mt-1 text-xl font-semibold text-gray-900">
                Provider Claims Summary
              </h2>

              <p className="mt-1 text-sm text-gray-600">
                Enter a provider name to summarize claims and spending.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                value={summaryProvider}
                onChange={(event) => setSummaryProvider(event.target.value)}
                placeholder="Enter provider name"
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-100"
              />

              <button
                type="button"
                onClick={() => setSummaryProvider(summaryProvider.trim())}
                className="rounded-lg bg-green-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-800"
              >
                Summarize
              </button>
            </div>

            {summaryProvider.trim() && !providerStats && (
              <div className="mt-5 rounded-lg border border-gray-200 bg-white p-4 text-sm text-gray-600">
                No claims found for provider{" "}
                <span className="font-semibold">{summaryProvider}</span>.
              </div>
            )}

            {providerStats && (
              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Claims
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {providerStats.count}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Total Allowed
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    $
                    {providerStats.allowed.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Total Paid
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    $
                    {providerStats.paid.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <div className="rounded-xl bg-white p-4">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Procedures
                  </p>

                  <p className="mt-1 text-2xl font-bold text-gray-900">
                    {providerStats.procedureCount}
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* Claims table */}
        <section className="overflow-hidden rounded-2xl bg-white shadow-sm">
          <div className="border-b border-gray-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Healthcare Claims
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Claims available to both people and AI agents.
                </p>
              </div>

              <div className="text-right">
                <p className="text-xs uppercase tracking-wide text-gray-400">
                  Total Billed
                </p>

                <p className="font-semibold text-gray-800">
                  $
                  {totalBilled.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          </div>

          {loading && (
            <div className="p-10 text-center text-gray-500">
              Loading healthcare claims...
            </div>
          )}

          {error && (
            <div className="m-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    <th className="px-6 py-4">Provider</th>
                    <th className="px-6 py-4">Procedure</th>
                    <th className="px-6 py-4">Place of Service</th>
                    <th className="px-6 py-4">Billed</th>
                    <th className="px-6 py-4">Allowed</th>
                    <th className="px-6 py-4">Paid</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {filteredClaims.slice(0, 50).map((claim) => (
                    <tr
                      key={claim.claimId}
                      className="hover:bg-gray-50"
                    >
                      <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                        {claim.providerName}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 font-mono text-xs text-gray-700">
                        {claim.procedureCode}
                      </td>

                      <td className="px-6 py-4 text-gray-600">
                        {claim.placeOfService}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                        $
                        {claim.billed.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                        $
                        {claim.allowed.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                        $
                        {claim.paid.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4">
                        <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-700">
                          {claim.claimStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredClaims.length === 0 && (
                <div className="p-10 text-center text-gray-500">
                  No claims match your search.
                </div>
              )}

              {filteredClaims.length > 50 && (
                <div className="border-t border-gray-100 px-6 py-4 text-center text-xs text-gray-500">
                  Showing the first 50 matching claims.
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}