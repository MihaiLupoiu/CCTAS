FROM ubuntu
MAINTAINER DeployerGenerator Mihai Lupoiu
RUN   apt-get update
RUN   apt-get install -y curl
RUN   curl -sL https://deb.nodesource.com/setup_4.x | sudo -E bash -
RUN   apt-get install -y nodejs
RUN   apt-get install -y build-essential 
RUN   apt-get install -y libzmq-dev 
RUN   apt-get install -y python 
RUN   npm install zmq 