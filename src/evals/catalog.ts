export const evalCatalog = [
  {
    id: "router",
    dataset: "src/evals/datasets/router.jsonl",
    purpose: "Validate deterministic routing and reason-code assignment.",
  },
  {
    id: "strategic-fit",
    dataset: "src/evals/datasets/strategic-fit.jsonl",
    purpose: "Validate narrow strategic interpretation and structured output quality.",
  },
  {
    id: "report-writer",
    dataset: "src/evals/datasets/report-writer.jsonl",
    purpose: "Validate markdown report structure and decision clarity.",
  },
  {
    id: "pipeline-e2e",
    dataset: "src/evals/datasets/pipeline-e2e.jsonl",
    purpose: "Validate end-to-end screening consistency.",
  },
] as const;
