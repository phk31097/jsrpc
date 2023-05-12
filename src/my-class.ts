class MyClassHelloWorld {
    public helloWorld(): string {
        return 'asdf';
    }
}

interface MySuperInterface {
}

interface MyInterface extends MySuperInterface {
    thisIsMyProperty: () => string;
    anotherProperty: (param1: MyClassHelloWorld) => void;
}