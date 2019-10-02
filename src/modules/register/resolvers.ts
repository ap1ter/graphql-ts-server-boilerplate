import * as bcrypt from 'bcryptjs';
import { ResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';
import { GQL } from '../../types/schema';

export const resolvers: ResolverMap = {
  Query: {
    bye: () => 'Bye'
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
