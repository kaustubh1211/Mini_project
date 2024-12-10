const request = require('supertest');
const express = require('express');
const mysql = require('mysql');
const app = express();

const productRoutes = require('../server');

app.use(express.json());
app.use(productRoutes);

describe('POST /api/product', () => {

});
