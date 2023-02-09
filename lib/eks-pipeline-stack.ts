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
          "aws-samples/aws-cdk-pipelines-eks-cluster",
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
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });

    const eksClusterStageB = new EksClusterStage(this, "DeveloperCluster", {
      clusterVersion: eks.KubernetesVersion.V1_21,
      nameSuffix: clusterBNameSuffix,
      env: {
        account: process.env.CDK_DEFAULT_ACCOUNT,
        region: process.env.CDK_DEFAULT_REGION,
      },
    });

    const eksClusterWave = pipeline.addWave("DeployEKSClusters");

    const domainName = ssm.StringParameter.valueForStringParameter(
      this,
      "/eks-cdk-pipelines/zoneName"
    );  
  }
}
