import { SecretValue, Stack, StackProps } from "aws-cdk-lib";
import { CodePipeline, CodePipelineSource, ShellStep } from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import {EksClusterStage} from "../lib/eks-cluster-stage";

export class EksPipelineStack extends Stack {
    constructor(scope: Construct, id: string, props?: StackProps) {
        super(scope, id, props);

        const pipeline = new CodePipeline(this, "EksDeploymentPipeline", {
            pipelineName: "Eks-Pipeline",
            synth: new ShellStep("Synth", {
                input: CodePipelineSource.gitHub(
                    "puskkarmore24/aws-cdk",
                    "main",
                    {
                      authentication:
                        SecretValue.secretsManager("github-token"),
                    }
                  ),
                commands: [
                    "cd cdk",
                    "npm ci",
                    "npm run build",
                    "npx cdk synth"
                ],
                primaryOutputDirectory: "cdk/cdk.out"
            })

        });
    }
}
