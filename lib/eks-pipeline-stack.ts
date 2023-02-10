import * as cdk from "@aws-cdk/core";
import eks = require("@aws-cdk/aws-eks");
import {
  CodePipeline,
  CodePipelineSource,
  ShellStep,
} from "@aws-cdk/pipelines";
import { EksClusterStage } from "./eks-cluster-stage";
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as codepipelineActions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import { SecretValue } from "@aws-cdk/core";

export class EksPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

const app = new cdk.App();
const stack = new cdk.Stack(app, 'MyStack');


// Read the secret from Secrets Manager
const pipeline = new codepipeline.Pipeline(this, 'MyPipeline');
const sourceOutput = new codepipeline.Artifact();
const sourceAction = new codepipelineActions.GitHubSourceAction({
  actionName: 'GitHub_Source',
  owner: 'awslabs',
  repo: 'aws-cdk',
  oauthToken: SecretValue.secretsManager('my-github-token'),
  output: sourceOutput,
  branch: 'develop', // default: 'master'
});
pipeline.addStage({
  stageName: 'Source',
  actions: [sourceAction],
});
  }
}
