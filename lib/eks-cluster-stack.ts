import * as cdk from "@aws-cdk/core";
import eks = require("@aws-cdk/aws-eks");
import ec2 = require("@aws-cdk/aws-ec2");
import iam = require("@aws-cdk/aws-iam");
import * as ssm from "@aws-cdk/aws-ssm";

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
      defaultCapacity: 2,
      vpc,
      vpcSubnets: [{ subnetType: ec2.SubnetType.PRIVATE }],
    });

    const aud = `${cluster.clusterOpenIdConnectIssuer}:aud`;
    const sub = `${cluster.clusterOpenIdConnectIssuer}:sub`;

    const conditions = new cdk.CfnJson(this, "awsNodeOIDCCondition", {
      value: {
        [aud]: "sts.amazonaws.com",
        [sub]: "system:serviceaccount:kube-system:aws-node",
      },
    });

    const awsNodeIamRole = new iam.Role(this, "awsNodeIamRole", {
      assumedBy: new iam.WebIdentityPrincipal(
        `arn:aws:iam::${cdk.Aws.ACCOUNT_ID}:oidc-provider/${cluster.clusterOpenIdConnectIssuer}`
      ).withConditions({
        StringEquals: conditions,
      }),
    });

    awsNodeIamRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonEKS_CNI_Policy")
    );

    const awsNodeCniPatch = new eks.KubernetesPatch(
      this,
      "serviceAccount/aws-node",
      {
        cluster,
        resourceName: "serviceAccount/aws-node",
        resourceNamespace: "kube-system",
        applyPatch: {
          metadata: {
            annotations: {
              "eks.amazonaws.com/role-arn": awsNodeIamRole.roleArn,
            },
          },
        },
        restorePatch: {
          metadata: {
            annotations: {},
          },
        },
      }
    );
  }
}
