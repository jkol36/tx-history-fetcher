#!/bin/sh

PATH_TO_KEY="~/Dropbox/edgebet/Aws/Keypairs/trademate.pem"
INSTANCE_IP="ec2-54-229-63-207.eu-west-1.compute.amazonaws.com"

ssh -i $PATH_TO_KEY "ec2-user@${INSTANCE_IP}"