#! /bin/bash

cloudformation_tail() {
  set -e
  local stack="jake-load-balancing"
  local stackId


  local stackStatus=$(aws-vault exec jake -- aws cloudformation describe-stacks --stack-name $stack | jq -c -r .Stacks[0].StackId) 
  set -e
  if [ -z "$stackStatus" ] ; then 
    echo -e "\nStack does not exist, creating ..."
    stackId=$(aws-vault exec jake -- aws cloudformation create-stack --stack-name $stack --template-body file://template.yaml --capabilities CAPABILITY_IAM | jq -c -r .StackId)

    echo "Waiting for stack to be created ..."
    aws-vault exec jake -- aws cloudformation wait stack-create-complete \
        --stack-name $stackId \

  else

    echo -e "\nStack exists, attempting update ..."

    set +e
    stackId=$(aws-vault exec jake -- aws cloudformation update-stack --stack-name $stack --template-body file://template.yaml --capabilities CAPABILITY_IAM | jq -c -r .StackId  2>&1)
    status=$?

    set -e

    if [ $status -ne 0 ] ; then
       
        # Don't fail for no-op update
        if [[ $stackId == *"ValidationError"* ]] ; then

            echo -e "\nFinished create/update - no updates to be performed"
            exit 0

        else

            exit $status

        fi

    fi

    echo "Waiting for stack to be updated ..."
    aws-vault exec jake -- aws cloudformation wait stack-update-complete \
        --stack-name $stackId \

  fi


  echo "Finished create/update successfully!"

  stackResources=$(aws-vault exec jake -- aws cloudformation describe-stack-resources --stack-name $stackId | jq -r -c .StackResources[])
  

  for resource in $stackResources
  do

    resourceType=$(jq -r  '.ResourceType' <<< "${resource}" ) 
    resourceTypePhysicalResourceId=$(jq -r  '.PhysicalResourceId' <<< "${resource}" ) 

    if [ $resourceType == 'AWS::EC2::Instance' ]; then

        instance=$(aws-vault exec jake -- aws ec2 describe-instances \
    --instance-ids $resourceTypePhysicalResourceId)
    jq <<<  $instance


    fi

  done
}

cloudformation_tail $SERVICE_STACK_NAME $REGION