import { Dataset, Flow, Pipeline, Worker } from "@/lib/types"

export type DatasetWithIcon = Dataset & {
  icon: React.ReactNode;
  files?: File[];
  showFiles?: boolean;
};

export type WorkerWithIcon = Worker & {
  icon: React.ReactNode;
  scripts?: File[];
  showScripts?: boolean;
};

export type PipelineItemWithIcon = DatasetWithIcon | WorkerWithIcon;

export type PipelineWithIcons = Omit<Pipeline, "worker"> & {
  worker: {
    input: PipelineItemWithIcon[];
    output: PipelineItemWithIcon[];
  };
};

export type FlowWithIcons = Omit<Flow, "pipelines"> & {
  pipelines: PipelineWithIcons[];
};