import request from 'graphql-request';
import { User } from '../../entity/User';
import { startServer } from '../../startServer';

const email = 'tom@user.com';
const password = '1234123';

let getHost = () => '';

beforeAll(async () => {
  const app = await startServer();
  const { port } = app.address() as any;
  getHost = () => `http://127.0.0.1:${port}`;
});

const mutation = `
    mutation {
        register(email: "${email}", password: "${password}") {
          path
          message
        }
    }
`;

test('Register an user', async () => {
  const response = await request(getHost(), mutation);
  expect(response).toEqual({ register: null });
  const users = await User.find({ where: { email } });
  expect(users).toHaveLength(1);
  const user = users[0];
  expect(user.email).toEqual(email);
  expect(user.password).not.toEqual(password);

  const response2 = await request(getHost(), mutation);
  expect(response2.register).toHaveLength(1);
  expect(response2.register[0].path).toEqual('email');
});
