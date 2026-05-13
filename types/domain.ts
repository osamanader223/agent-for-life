// [Person 1] business domain types — Invoice, ReconcileIssue, etc.
export type IssueType =
  | "unmatched"
  | "duplicate"
  | "amount_mismatch"
  | "split_payment";

export type ReconcileIssue = {
  id: string;
  type: IssueType;
  description: string;
  invoiceId?: string;
  transactionId?: string;
};

export type ReconcileResult = {
  matched: number;
  unmatched: number;
  issues: ReconcileIssue[];
};
