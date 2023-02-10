import * as cdk from "@aws-cdk/core";
import eks = require("@aws-cdk/aws-eks");
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "@aws-cdk/pipelines";
import { EksClusterStage } from "./eks-cluster-stage";

export class EksPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const pipeline = new CodePipeline(this, "Pipeline", {
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.gitHub(
          "puskkarmore24/aws-cdk-pipelines-eks-cluster-main",
          "main",
          {
            authentication:
              cdk.SecretValue.secretsManager("github-oauth-token"),
          }
        ),
        commands: ["npm ci", "npm run build", "npx cdk synth"],
      }),
      pipelineName: "EKSCluster",
    });
  }
}
