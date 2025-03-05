#!/bin/bash

# Build the project with Webpack (without using SAM for building)
npm run build

# Build with SAM
sam build

# Invoke the function locally using the event.json file
sam local invoke SampleFunction \
    -e ./src/__mocks__/event.json \
    --debug
