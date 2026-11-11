/** Prepare the complete table and its summary in one pass over the API result. */
export function prepareSuppliers<T extends { status: "active" | "suspended"; categories: string[] }>(suppliers: T[]) {
  const counts = { active: 0, suspended: 0 };
  const rows = suppliers.map(supplier => {
    counts[supplier.status] += 1;
    return { ...supplier, categoryLabel: supplier.categories.join(", ") };
  });
  return { rows, counts };
}
