const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');


const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'REST-like API',
      description: 'API that has a GET/POST/PATCH/PUT/DELETE Method',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://198.211.105.226:3000',
        description: 'Assignment 7/8 Server to show tables for Agents/Company/Customer',
      },
    ],
  },
  apis: ['./server.js'], 
};

const swaggerSpec = swaggerJSDoc(swaggerOptions);

module.exports = { swaggerSpec, swaggerUi };
