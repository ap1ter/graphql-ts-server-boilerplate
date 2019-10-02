import request from 'graphql-request';
import { User } from '../../entity/User';
import { startServer } from '../../startServer';
import {
  duplicateEmail,
  emailNotLongEnough,
  emailInvalid,
  passwordNotLongEnough
} from './errorMessages';

const email = 'tom@user.com';
const password = '1234123';

let getHost = () => '';

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address() as any;
  getHost = () => `http://127.0.0.1:${port}`;
});

const mutation = (e: string, p: string) => `
    mutation {
        register(email: "${e}", password: "${p}") {
          path
          message
        }
    }
`;

test('Register an user successfully', async () => {
  const response = await request(getHost(), mutation(email, password));
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);
});

test('Register duplicate email: get error', async () => {
  const response = await request(getHost(), mutation(email, password));
  expect(response.register).toHaveLength(1);
  expect(response.register[0]).toEqual({
    path: 'email',
    message: duplicateEmail
  });
});

test('Catch bad email', async () => {
  const response = await request(getHost(), mutation('@c', password));
  expect(response.register).toEqual([
    {
      path: 'email',
      message: emailNotLongEnough
    },
    {
      path: 'email',
      message: emailInvalid
    }
  ]);
});

test('Catch bad invalid email', async () => {
  const response = await request(getHost(), mutation('123@c', password));
  expect(response.register).toHaveLength(1);
  expect(response.register[0]).toEqual({
    path: 'email',
    message: emailInvalid
  });
});

test('Catch bad password', async () => {
  const response = await request(getHost(), mutation(email, 'sd'));
  expect(response.register).toHaveLength(1);
  expect(response.register[0]).toEqual({
    path: 'password',
    message: passwordNotLongEnough
  });
});

test('Catch bad email and bad password', async () => {
  const response = await request(getHost(), mutation('@c', '1h'));
  expect(response.register).toEqual([
    {
      path: 'email',
      message: emailNotLongEnough
    },
    {
      path: 'email',
      message: emailInvalid
    },
    {
      path: 'password',
      message: passwordNotLongEnough
    }
  ]);
});
