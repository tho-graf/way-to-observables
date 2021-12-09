import Observable from "zen-observable";

// lets introduce what a getter looks like
type Setter<A> = (a: A) => void;

// oh there we've got a setter...
const logger: Setter<any> = console.log;

// performs side effect :(
// will calculate 42 eagerly... ok... imagine a heavy computation ;)
logger(42);

// lets get fancy. How about a setter setter?
const listenToArray: Setter<Setter<number>> = (setter: Setter<number>) => {
    [42, 4711].forEach((x) => setter(x));
};

// no more pull - values are pushed (inversion of control)
// logger could be called asynchronously
listenToArray(logger);

// lets get even more fancy and try to compose stuff. Here is a little helper
const map = <A, B>(setterSetter: Setter<Setter<A>>, transform: (n: A) => B) => {
    return function listenToTransformed(listener: Setter<B>) {
        setterSetter((x) => listener(transform(x)));
    };
};

// still listen to array, but make the numbers a little bit tiny.
const listenToTinyNumbers: Setter<Setter<number>> = map(listenToArray, (x) => x / 100);
// and then do some other stuff with them
const listenToScreamyTinyNumbers: Setter<Setter<string>> = map(listenToTinyNumbers, (x) => `${x}!`);

// whats going on? nothing haha... did you notice nothing has been caluclated until now?
// Our setter setter is lazy until we pass the setter and start the whole engine.

// kick it
listenToScreamyTinyNumbers(logger);

// whoa this looks pretty mutch like an observable. Let's define a super simple observable.
interface Observer<A> {
    next: (a: A) => void;
}
const observable = {
    subscribe(observer: Observer<number>) {
        [0, 1, 2, 3, 4].forEach(observer.next);
    },
};

observable.subscribe({
    next: (value) => console.log(`next ${value}`),
});

// But don't reinvent the wheel. There are observable libraries out there.
// Here are some examples of the library zen-observable. This one is pretty small and overseeable.
Observable.of(1, 2, 3, 4).subscribe(logger);

Observable.from([1, 2, 3, 4]).subscribe(logger);

Observable.of(1, 2, 3, 4)
    .filter((x) => x % 2 == 0)
    .map((x) => 2 * x)
    .subscribe(logger);

Observable.of(1, 3, 5, 7)
    .concat(Observable.of(2, 4, 6))
    .reduce<number[]>((acc, cur) => (acc.push(cur), acc.sort()), [])
    .flatMap(Observable.from)
    .subscribe(logger);

// if you wanna do really crazy stuff and wanna see full blown observables: Have a look into RxJS (https://rxjs.dev/guide/overview)
