#!/bin/bash

sudo docker pull burkegm/bucstop

sudo docker compose up --no-deps -d bucstop

sudo docker image prune -f
