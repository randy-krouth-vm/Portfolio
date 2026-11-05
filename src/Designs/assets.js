/* Resolves a path from the generated design data against the deployed base URL. */
export const assetUrl = (path) => `${import.meta.env.BASE_URL}${path}`;
