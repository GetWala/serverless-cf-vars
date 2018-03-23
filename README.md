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

Whenever you want the cloudformation template to have a string that contains `${}`, simply use `#{}` instead, and it will get transformed into correct `${}` (with `Fn::Sub` inserted for you) in the cloudformation template before deployment.

If you want to make use of `Fn::Sub` [with mapping](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-sub.html#w2ab2c21c28c60c11) you need to insert the `Fn::Sub` yourself and the plugin will just convert `#{}` into `${}`.

### Example

```
resources:
  Resources:
    myApiIdentityPool:
      Type: "AWS::Cognito::IdentityPool"
      Properties:
        IdentityPoolName:
          Fn::Sub:
            - "my#{thing}IdentityPool${self:custom.stage}"
            - thing: Api
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

Becomes

```
resources:
  Resources:
    myApiIdentityPool:
      Type: "AWS::Cognito::IdentityPool"
      Properties:
        IdentityPoolName: myApiIdentityPoolmyStage
        AllowUnauthenticatedIdentities: True
    cognitoUnauthRole:
      Type: 'AWS::IAM::Role'
      Properties:
        RoleName:
          Fn::Sub: Cognito_${myApiIdentityPool.Name}_Unauth_Role
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
                    - Fn::Sub:
                        "arn:aws:lambda:${AWS::Region}:${AWS::AccountId}:function:myService-myStage-myFunction"
```

## Information

Inspired by [serverless-pseudo-parameters](https://www.npmjs.com/package/serverless-pseudo-parameters), this plugin allows you to use [Cloudformation pseudo parameters](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/pseudo-parameter-reference.html), as well as [substitute](https://docs.aws.amazon.com/AWSCloudFormation/latest/UserGuide/intrinsic-function-reference-sub.html) in other variables.

Because the same syntax is used for variables in both `serverless.yml` and in cloudformation templates, there's currently no way to use variables in the generated cloudformation template. This plugin works around that by transforming `#{}` into `${}` after serverless has taken care of all its variable substitutions.

## Changelog

### 0.2.0

Now allows you to use `Fn::Sub` manually, which means you can make use of the mapping functionality.

### 0.1.0

Initial release

## License

Released under the [Copyfree Open Innovation License](http://coil.apotheon.org/).

