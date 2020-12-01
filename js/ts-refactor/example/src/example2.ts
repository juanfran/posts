import ParentTest from './null';

// old code
// class Test extends ParentTest {
//     name: string;

//     constructor() {
//         super();

//         const name = 'Test';
//     }
// }

class Test extends ParentTest {
    name: string;

    constructor() {
        super();

        const name = 'my new test';
        console.log(name);
    }
}