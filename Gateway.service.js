require('dotenv').config();
const service = require("./worker");
const express = require('express');
const { Connection } = require("rabbitmq-client");