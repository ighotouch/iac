var AWS = require("aws-sdk");
var fs = require("fs");

var args = process.argv;

console.log(args);

const isDeleteMode = args.find((a) => a === "--delete");

var credentials = new AWS.SharedIniFileCredentials({ profile: "jake" });
AWS.config.credentials = credentials;

const CloudFormation = new AWS.CloudFormation({ region: "us-east-1" });

const StackName = "bash-stack-node";

const parseJson = (fileDirectory) => {
  const obj = JSON.parse(fs.readFileSync(fileDirectory, "utf8"));
  return obj;
};

const parseTemplate = (fileDirectory) => {
  const obj = fs.readFileSync(fileDirectory, "utf8");
  return obj;
};

function stackExists(stack_name) {
  return new Promise((resolve, reject) => {
    CloudFormation.listStacks({}, function (err, data) {
      if (err) {
        console.log(err);
        reject(err);
      } else {
        const stack = data.StackSummaries.find(
          (s) =>
            s.StackName === StackName &&
            s.StackStatus !== "DELETE_IN_PROGRESS" &&
            s.StackStatus !== "DELETE_COMPLETE"
        );
        if (stack) {
          console.log(
            "Stack exist: " + stack.StackId + "Status: " + stack.StackStatus
          );
          resolve(true);
        } else {
          resolve(false);
        }
      }
    });
  });
}

function createStack(name) {
  const exist = stackExists(name).then((exist) => {
    console.log(exist);
    if (exist) {
      console.log("Updating stack");
      CloudFormation.updateStack(
        {
          StackName: name,
          TemplateBody: parseTemplate("../lab3/template.yaml"),
          Parameters: parseJson("../lab3/parameters.json"),
        },
        function (err, data) {
          if (err) {
            console.log(err);
          } else {
            console.log(data);
          }
        }
      );
      return;
    }

    console.log("Creating stack");
    CloudFormation.createStack(
      {
        StackName: name,
        TemplateBody: parseTemplate("../lab3/template.yaml"),
        Parameters: parseJson("../lab3/parameters.json"),
      },
      function (err, data) {
        if (err) {
          console.log(err);
        } else {
          console.log(data);
        }
      }
    );
  });
}


function main() {
  if (isDeleteMode) {
    console.log("Removing stack");
    stackExists(StackName).then((exist) => {
      if (!exist) {
        console.log("Stack does not exist");
        return;
      }
      CloudFormation.deleteStack(
        {
          StackName,
        },
        function (err, data) {
          if (err) {
            console.log(err);
          } else {
            console.log(data);
          }
        }
      );
    });
  } else {
    createStack(StackName);
  }
}

// node index.js --delete
main();
