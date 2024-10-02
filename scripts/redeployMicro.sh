#!/bin/bash

sudo docker pull burkegm/gamemicro

sudo docker compose up --no-deps -d micro

sudo docker image prune -f
