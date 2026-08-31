import { useEffect, useMemo, useState } from "react";
import { loadClaims, type Claim } from "../data/claims";

export default function MainPage() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [providerSearch, setProviderSearch] = useState("");
  const [procedureSearch, setProcedureSearch] = useState("");
  const [placeSearch, setPlaceSearch] = useState("");

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

  const clearFilters = () => {
    setProviderSearch("");
    setProcedureSearch("");
    setPlaceSearch("");
  };

  return (
    <main className="min-h-full bg-gray-50 px-6 py-8">
      <div className="mx-auto max-w-7xl space-y-6">
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
              ${totalAllowed.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">Total Paid</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
              ${totalPaid.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </section>

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
                  ${totalBilled.toLocaleString(undefined, {
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
                    <tr key={claim.claimId} className="hover:bg-gray-50">
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
                        ${claim.billed.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 font-medium text-gray-900">
                        ${claim.allowed.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      <td className="whitespace-nowrap px-6 py-4 text-gray-700">
                        ${claim.paid.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
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