#! /bin/bash

echo "Creating stacks"
regions="$(jq -r '.regions | .[]' input.json)" 

for region in $regions
do
aws-vault exec jake -- aws cloudformation create-stack --stack-name bash-stack --template-body file://template.yaml  --parameters file://parameters.json --region ${region}
done
