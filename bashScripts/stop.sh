#!/bin/bash
kill -9 `ps xa | grep ffmpeg | awk '{print $1}'`