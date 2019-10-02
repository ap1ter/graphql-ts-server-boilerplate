import { GraphQLServer } from 'graphql-yoga';
import { importSchema } from 'graphql-import';
import * as path from 'path';
import { createTypeormConn } from './utils/createConnection';
import { makeExecutableSchema, mergeSchemas } from 'graphql-tools';

import * as fs from 'fs';
import { GraphQLSchema } from 'graphql';

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const featuresFolder = 'modules';
  const folders = fs.readdirSync(path.join(__dirname, `./${featuresFolder}`));
  folders.forEach(folder => {
    const { resolvers } = require(`./${featuresFolder}/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(__dirname, `./${featuresFolder}/${folder}/schema.graphql`)
    );

    schemas.push(makeExecutableSchema({ resolvers, typeDefs }));
  });

  const server = new GraphQLServer({ schema: mergeSchemas({ schemas }) });
  await createTypeormConn();
  const app = await server.start({
    port: process.env.NODE_ENV === 'test' ? 0 : 4000
  });
  console.log('Server is running on localhost:4000');
  return app;
};
