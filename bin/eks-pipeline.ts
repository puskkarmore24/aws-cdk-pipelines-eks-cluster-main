#!/usr/bin/env node
import 'source-map-support/register';
import { EksPipelineStack } from '../lib/eks-pipeline-stack';
import * as cdk from '@aws-cdk/core';

const app = new cdk.App();
new EksPipelineStack(app, 'EksPipelineStack', {
  env: { account: '861976376325', region: 'eu-north-1c' },
});

app.synth()
