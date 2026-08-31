import Papa from "papaparse";

export interface Claim {
  claimId: string;
  subscriberId: string;
  memberSequence: string;
  claimStatus: string;
  billed: number;
  allowed: number;
  paid: number;
  paymentStatusDate: string;
  serviceDate: string;
  receivedDate: string;
  entryDate: string;
  processedDate: string;
  paidDate: string;
  paymentStatus: string;
  groupName: string;
  groupId: string;
  divisionName: string;
  divisionId: string;
  plan: string;
  planId: string;
  placeOfService: string;
  claimType: string;
  procedureCode: string;
  memberGender: string;
  providerId: string;
  providerName: string;
}

const csvToClaim = (row: Record<string, string>): Claim => ({
  claimId: row["Claim ID"],
  subscriberId: row["Subscriber ID"],
  memberSequence: row["Member Sequence"],
  claimStatus: row["Claim Status"],
  billed: Number(row["Billed"]) || 0,
  allowed: Number(row["Allowed"]) || 0,
  paid: Number(row["Paid"]) || 0,
  paymentStatusDate: row["Payment Status Date"],
  serviceDate: row["Service Date"],
  receivedDate: row["Received Date"],
  entryDate: row["Entry Date"],
  processedDate: row["Processed Date"],
  paidDate: row["Paid Date"],
  paymentStatus: row["Payment Status"],
  groupName: row["Group Name"],
  groupId: row["Group ID"],
  divisionName: row["Division Name"],
  divisionId: row["Division ID"],
  plan: row["Plan"],
  planId: row["Plan ID"],
  placeOfService: row["Place of Service"],
  claimType: row["Claim Type"],
  procedureCode: row["Procedure Code"],
  memberGender: row["Member Gender"],
  providerId: row["Provider ID"],
  providerName: row["Provider Name"],
});

export async function loadClaims(): Promise<Claim[]> {
  const response = await fetch("/sample.csv");

  if (!response.ok) {
    throw new Error("Unable to load the sample claims data.");
  }

  const csvText = await response.text();

  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  if (result.errors.length > 0) {
    throw new Error(
      `CSV parsing failed: ${result.errors[0].message}`
    );
  }

  return result.data.map(csvToClaim);
}