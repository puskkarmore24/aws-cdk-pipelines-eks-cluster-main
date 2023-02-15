#!/usr/bin/env node
import 'source-map-support/register';
import { EksPipelineStack } from '../lib/eks-pipeline-stack';
import * as cdk from 'aws-cdk-lib/core';
import { App } from 'aws-cdk-lib/core';
import { Construct } from 'constructs';

const app = new App();
new EksPipelineStack(app, 'EksPipelineStack', {
  env: { account: '861976376325', region: 'eu-north-1' },
});
app.synth();