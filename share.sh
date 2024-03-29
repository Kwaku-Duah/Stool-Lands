#!/bin/bash

# SSH command to expose the local server (running on port 5000) to the world
ssh -R stool:80:localhost:5000 serveo.net
