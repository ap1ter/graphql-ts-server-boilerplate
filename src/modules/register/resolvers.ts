import * as bcrypt from 'bcryptjs';
import * as yup from 'yup';
import { ResolverMap } from '../../types/graphql-utils';
import { User } from '../../entity/User';
import { GQL } from '../../types/schema';
import { formatyupError } from '../../utils/formatYupErrors';
import {
  duplicateEmail,
  emailNotLongEnough,
  emailInvalid,
  passwordNotLongEnough
} from './errorMessages';

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
    .email(emailInvalid),
  password: yup
    .string()
    .min(3, passwordNotLongEnough)
    .max(255)
});

export const resolvers: ResolverMap = {
  Query: {
    bye: () => 'Bye'
  },
  Mutation: {
    register: async (_, args: GQL.IRegisterOnMutationArguments) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (err) {
        return formatyupError(err);
      }

      let { email, password } = args;

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
            message: duplicateEmail
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
