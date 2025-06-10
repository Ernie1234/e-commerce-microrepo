import swaggerAutogen from 'swagger-autogen';

const doc = {
  info: {
    title: 'Auth Service API',
    description:
      'Automated Swagger Docs for Authentication Service API Documentation for my-microrepo project',
  },
  host: 'localhost:6001',
  schemes: ['http'],
};

const outputFile = './swagger-output.json';
const endpointsFiles = ['../../routes/auth-router.ts'];

swaggerAutogen()(outputFile, endpointsFiles, doc);
