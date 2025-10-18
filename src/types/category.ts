
export type CategoryStatus = "ACTIVE" | "HIDDEN";

export type Category = {
  _id: string;
  title: string;
  slug: string;
  image?: string;
  status: CategoryStatus;
  createdAt?: string;
  updatedAt?: string;
};

// UI helper: status থেকে active derive
export const isActive = (c: Pick<Category, "status">) => c.status === "ACTIVE";
