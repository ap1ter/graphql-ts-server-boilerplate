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
      email = email.trim().toLowerCase();
      password = password.trim();

      const alreadyExists = await User.findOne({
        where: { email },
        select: ['id']
      });
      if (alreadyExists) {
        return [
          {
            path: 'email',
            message: 'already taken'
          }
        ];
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = User.create({
        email: email,
        password: hashedPassword
      });

      await user.save();
      return null;
    }
  }
};
