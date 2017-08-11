# Serverless CF Vars

## Installation

```
npm i --save serverless-cf-vars
```

Add it to your `serverless.yml` plugins list:

```
plugins:
  - serverless-cf-vars
```

## Usage

Whenever you want the cloudformation template to contain `${}`, simply use `#{}` instead, and it will get transformed into the correct `${}` in the cloudformation template before deployment.

### Example

```
resources:
  Resources:
    myApiIdentityPool:
      Type: "AWS::Cognito::IdentityPool"
      Properties:
        IdentityPoolName: myApiIdentityPool${self:custom.stage}
        AllowUnauthenticatedIdentities: True
    cognitoUnauthRole:
      Type: 'AWS::IAM::Role'
      Properties:
        RoleName: Cognito_#{myApiIdentityPool.Name}_Unauth_Role
        AssumeRolePolicyDocument:
          Statement:
            - Effect: Allow
              Principal:
                Federated: cognito-identity.amazonaws.com
              Action: [ 'sts:AssumeRole' ]
        Policies:
          - PolicyName: cognitounauth
            PolicyDocument:
              Statement:
                - Effect: Allow
                  Action:
                    - mobileanalytics:PutEvents
                    - cognito-sync:*
                  Resource:
                    - "*"
          - PolicyName: CustomPermissions
            PolicyDocument:
              Statement:
                - Effect: Allow
                  Action:
                    - lambda:Invoke
                  Resource:
                    - "arn:aws:lambda:#{AWS::Region}:#{AWS::AccountId}:function:${self:service}-${self:custom.stage}-myFunction"
```

## Information

Inspired by [serverless-pseudo-parameters](https://www.npmjs.com/package/serverless-pseudo-parameters), this plugin allows you to use [Cloudformation pseudo parameters](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html), as well as substitute in other variables.

Because the same syntax is used for variables in both `serverless.yml` and in cloudformation templates, there's currently no way to use variables in the generated cloudformation template. This plugin works around that by transforming `#{}` into `${}` after serverless has taken care of all its variable substitutions.

## License

Released under the [Copyfree Open Innovation License](http://coil.apotheon.org/).

