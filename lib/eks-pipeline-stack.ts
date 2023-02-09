import * as cdk from "@aws-cdk/core";
import eks = require("@aws-cdk/aws-eks");
import * as ssm from "@aws-cdk/aws-ssm";
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
  ManualApprovalStep,
} from "@aws-cdk/pipelines";
import { EksClusterStage } from "./eks-cluster-stage";

export class EksPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, "Pipeline", {
      synth: new ShellStep("Synth", {
        input: CodePipelineSource.gitHub(
          "puskkarmore24/aws-cdk-pipelines-eks-cluster",
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

    const clusterANameSuffix = "Application";
    const clusterBNameSuffix = "Developer";

    const eksClusterStageA = new EksClusterStage(this, "ApplicationCluster", {
      clusterVersion: eks.KubernetesVersion.V1_21,
      nameSuffix: clusterANameSuffix,
      env: {
        account: '861976376325',
        region: 'eu-north-1c',
      },
    });

    const eksClusterStageB = new EksClusterStage(this, "DeveloperCluster", {
      clusterVersion: eks.KubernetesVersion.V1_21,
      nameSuffix: clusterBNameSuffix,
      env: {
        account: '861976376325',
        region: 'eu-north-1c',
      },
    });

    const eksClusterWave = pipeline.addWave("DeployEKSClusters");  
  }
}
