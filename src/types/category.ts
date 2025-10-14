export type Category = {
  _id: string;
  title: string;
  slug: string;
  image?: string;
  status: "ACTIVE" | "HIDDEN";
  createdAt?: string;
  updatedAt: string;
};


export type CreateCategoryDTO = {
  title: string;
  slug: string;
  image?: string;
  status?: "ACTIVE" | "HIDDEN";
};

export type UpdateCategoryDTO = Partial<CreateCategoryDTO>;