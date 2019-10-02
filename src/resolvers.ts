import { ResolverMap } from './types/graphql-utils';
import { GQL } from './types/schema';
import * as bcrypt from 'bcryptjs';
import { User } from './entity/User';

export const resolvers: ResolverMap = {
  Query: {
    hello: (_, { name }: GQL.IHelloOnQueryArguments) =>
      `Hello ${name || 'World'}`
  },
  Mutation: {
    register: async (
      _,
      { email, password }: GQL.IRegisterOnMutationArguments
    ) => {
      const hashedPassword = await bcrypt.hash(password.trim(), 10);
      const user = User.create({
        email: email.trim().toLowerCase(),
        password: hashedPassword
      });

      const saveResult = await user.save();
      return !!{ id: saveResult.id, email: saveResult.email };
    }
  }
};
