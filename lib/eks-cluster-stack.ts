import * as cdk from "aws-cdk-lib/core";
import eks = require("aws-cdk-lib/aws-eks");
import ec2 = require("aws-cdk-lib/aws-ec2");
import iam = require("aws-cdk-lib/aws-iam");
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from 'constructs';
import { StackProps } from "aws-cdk-lib";

export interface EksClusterStackProps extends StackProps {
  clusterVersion: eks.KubernetesVersion;
  nameSuffix: string;
}

export class EksClusterStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: EksClusterStackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", { maxAzs: 3 });

    const cluster = new eks.Cluster(this, `acme-${props.nameSuffix}`, {
      clusterName: `acme-${props.nameSuffix}`,
      version: props.clusterVersion,
      defaultCapacity: 0,
      vpc,
      vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE_ISOLATED }],
    });
  }
}
