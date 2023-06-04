📦 JSRPC - JavaScript Remote Procedure Calls

JSRPC provides an effortless way to enable client-backend communication for applications utilizing JavaScript in both the Frontend and Backend.

## How to Use

**Initial Setup**
- Navigate to the root folder of your npm project
- Run `npm install @philippkoch/jsrpc`
- Run `npx @philippkoch/jsrpc init`

**Generate Classes**
- Run `npx @philippkoch/jsrpc generate-classes` from anywhere within your project

**Start Server** (for development purposes)
- Run `npx @philippkoch/jsrpc start-server`

**Example**
1. In the shared folder (e.g., src/shared), create interfaces as shown below:
   ```typescript
   export interface MyService extends RpcService {
       helloWorld(): string;
   }
   ```
   💡 **Hint**: Make sure the interface extends `RpcService`.

2. In the server folder (e.g., src/server), create service implementations as shown below:
   ```typescript
   @Rpc
   export class MyServiceImpl implements MyService {
       helloWorld(): string {
           return 'Hello World!';
       }
   }
   ```
   💡 **Hint**: Implement the service interface and use the `@Rpc` decorator.

3. In the client code (e.g., src/client), once you have generated the classes (see above), you can effortlessly access the implementations:
   ```typescript
   new RpcClientFactory({
           host: 'http://localhost',
           port: 3000
       })
       .getClient<ServiceMapping>('MyService')
       .helloWorld()
       .then(message => alert(message));
   ```

Feel free to explore the possibilities with JSRPC and simplify your client-backend communication seamlessly. Happy coding! 🚀