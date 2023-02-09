import * as cdk from "@aws-cdk/core";
import eks = require("@aws-cdk/aws-eks");
import ec2 = require("@aws-cdk/aws-ec2");
import iam = require("@aws-cdk/aws-iam");
import * as ssm from "@aws-cdk/aws-ssm";
import { Construct } from 'constructs';

export interface EksClusterStackProps extends cdk.StackProps {
  clusterVersion: eks.KubernetesVersion;
  nameSuffix: string;
}

export class EksClusterStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: EksClusterStackProps) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, "Vpc", { maxAzs: 3 });

    const cluster = new eks.Cluster(this, `acme-${props.nameSuffix}`, {
      clusterName: `acme-${props.nameSuffix}`,
      version: props.clusterVersion,
      defaultCapacity: 0,
      vpc,
      vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE }],
    });
  }
}
