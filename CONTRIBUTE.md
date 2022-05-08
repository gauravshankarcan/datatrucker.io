# Contributing

## Building your environment locally

### Prerequisites 
- minikube environment required
- docker login required to docker hub 
- nodejs environment
- postman
- linux environment
- install oracle thin client locally https://gist.github.com/ajinkya-bhosale/57c2ef05835784cca588b43046db1b3f


### Building your local dev environment

- clone the repo https://github.com/gauravshankarcan/datatrucker.io
- switch to develop branch , follow standard gitflow for branching strategy https://nvie.com/posts/a-successful-git-branching-model/

- login to dockerhub , you may need to register for oracle database images , depending on what you are doing
- switch to the ci folder
- make sure minikube is running  
- run setup-minikube.sh to build a test environment

### Branch merges
 All codes needs to go into there own new branch and integrate first in develop branch .. The administrators will test the branch before pushing to main to make a release
 - No direct pushes to develop or main
 - All merges to develop branch should be tested by the code committer

### getting started
https://www.datatrucker.io/docs/Overview/Getting%20Started
