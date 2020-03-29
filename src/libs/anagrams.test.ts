import Anagram, {InvalidAnagramError, Transition} from "./anagrams";

let targetString: string;
let initialString: string;

const constructAnagram = () => new Anagram(initialString, targetString);

describe('Anagram', () => {
    describe('constructor', () => {
        const subject = constructAnagram;

        describe('is not an anagram', () => {
            beforeEach(() => {
                targetString = 'details';
                initialString = 'entails';
            });

            it('throws exception', () => {
                expect(() => subject()).toThrow(InvalidAnagramError)
            })
        });

        describe('is an anagram', () => {
            beforeEach(() => {
                targetString = 'He bugs Gore!';
                initialString = 'George Bush';
            });

            it('creates an instance', () => {
                expect(subject()).toBeInstanceOf(Anagram);
            })
        })
    });


    describe('transformCharacters', () => {
        const subject = () => constructAnagram().calculateTransitionSteps();

        describe('Both empty strings', () => {
            beforeEach(() => {
                initialString = '';
                targetString = '';
            });

            it('Returns expected', () => {
                expect(subject()).toEqual(['']);
            })
        });

        describe('Empty to something', () => {
            beforeEach(() => {
                initialString = '';
                targetString = 'Something';
            });

            it('Returns expected', () => {
                expect(subject()).toEqual([
                    '',
                    'S',
                    'So',
                    'Som',
                    'Some',
                    'Somet',
                    'Someth',
                    'Somethi',
                    'Somethin',
                    'Something',
                ]);
            })
        });

        describe('Something to empty', () => {
            beforeEach(() => {
                initialString = '';
                targetString = 'Something';
            });

            it('Returns expected', () => {
                expect(subject()).toEqual([
                    'Something',
                    'something',
                    'omething',
                    'mething',
                    'ething',
                    'thing',
                    'hing',
                    'ing',
                    'ng',
                    'g',
                    '',
                ]);
            })
        });

        describe('Aggronerd!!!', () => {
            beforeEach(() => {
                initialString = 'Greg Doran';
                targetString = 'Aggronerd!!!';
            });

            it('returns expected', () => {
                expect(subject()).toEqual([
                    'Greg Doran',
                    'greg Doran',
                    'greg doran',
                    'grge doran',
                    'grgedoran',
                    'grgeodran',
                    'grgeordan',
                    'grgeoradn',
                    'grgeorand',
                    'ggreorand',
                    'ggroerand',
                    'ggroearnd',
                    'ggroeanrd',
                    'ggroaenrd',
                    'ggroanerd',
                    'ggraonerd',
                    'ggaronerd',
                    'gagronerd',
                    'aggronerd',
                    'Aggronerd',
                    'Aggronerd!',
                    'Aggronerd!!',
                    'Aggronerd!!!',
                ])
            });
        });

        describe('He bugs gore!', () => {
            beforeEach(() => {
                targetString = 'He bugs Gore!';
                initialString = 'George Bush';
            });

            it('returns expected', () => {

                expect(subject()).toEqual([])
            });
        });
    });
});

describe('Transition', () => {
    let transitionStep: Transition;

    const prepareTransitionStep = () => {
        transitionStep = new Transition(constructAnagram());
        return transitionStep;
    };


    beforeEach(() => {
        initialString = 'Listen';
        targetString = 'Silent';
    });

    describe('currentIndexToOrder', () => {
        const subject = () => prepareTransitionStep().currentIndexToOrder;

        it('matches expectation', () => {
            expect(subject()).toEqual([2, 1, 0, 5, 3, 4])
        });

        describe('with duplicate characters', () => {
            beforeEach(() => {
                initialString = 'aakBa';
                targetString = 'AkbAa';
            });

            it('equals expected', () => {
                expect(subject()).toEqual([0, 3, 1, 2, 4])
            })
        });

        describe('with none existent characters in to', () => {
            beforeEach(() => {
                initialString = 'Li st en';
                targetString = 'Silent';
            });

            it('equals expected', () => {
                expect(subject()).toEqual([2, 1, null, 0, 5, null, 3, 4])
            })
        });

        describe('with none existent characters in from', () => {
            beforeEach(() => {
                initialString = 'Listen';
                targetString = 'Si-l-ent';
            });

            it('equals expected', () => {
                expect(subject()).toEqual([3, 1, 0, 7, 5, 6])
            })
        })
    });

   describe('next', () => {
        const subject = () => prepareTransitionStep().next();

        describe('basic case', () => {
            it('downcase case first', () => {
                subject();

                expect(transitionStep.getCurrentString()).toEqual('listen');
            });

            it('step 2', () => {
                initialString = 'listen';

                subject();

                expect(transitionStep.getCurrentString()).toEqual('ilsten');
            })
        })
   })
});
