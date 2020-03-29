import Anagram, {InvalidAnagramError, Transition} from "./anagrams";

let to: string;
let from: string;

const constructAnagram = () => new Anagram(from, to);

describe('Anagram', () => {
    describe('constructor', () => {
        const subject = constructAnagram;

        describe('is not an anagram', () => {
            beforeEach(() => {
                to = 'details';
                from = 'entails';
            });

            it('throws exception', () => {
                expect(() => subject()).toThrow(InvalidAnagramError)
            })
        });

        describe('is an anagram', () => {
            beforeEach(() => {
                to = 'He bugs Gore!';
                from = 'George Bush';
            });

            it('creates an instance', () => {
                expect(subject()).toBeInstanceOf(Anagram);
            })
        })
    });


    describe('transformCharacters', () => {
        const subject = () => constructAnagram().calculateTransitionSteps();

        beforeEach(() => {
           from = 'Greg Doran';
           to = 'aggronerd';
        });

        it('returns expected', () => {
            expect(subject()).toEqual([
                'Greg Doran',
                'greg Doran',
                'greg doran',
                'gregdoran',
                'rgegdoran',
                'gegrdoran',
                'eggrdoran',
                'ggrdorean',
                'ggroreand',
                'ggroeanrd',
                'ggroanerd',
                'aggronerd',
                'Aggronerd'
            ])
        });
    });
});

describe('TransitionStep', () => {
    let transitionStep: Transition;

    const prepareTransitionStep = () => {
        transitionStep = new Transition(constructAnagram());
        return transitionStep;
    };


    beforeEach(() => {
        from = 'Listen';
        to = 'Silent';
    });

    describe('currentIndexToOrder', () => {
        const subject = () => prepareTransitionStep().currentIndexToOrder;

        it('matches expectation', () => {
            expect(subject()).toEqual([2, 1, 0, 5, 3, 4])
        });

        describe('with duplicate characters', () => {
            beforeEach(() => {
                from = 'aakBa';
                to = 'AkbAa';
            });

            it('equals expected', () => {
                expect(subject()).toEqual([0, 3, 1, 2, 4])
            })
        });

        describe('with none existent characters in to', () => {
            beforeEach(() => {
                from = 'Li st en';
                to = 'Silent';
            });

            it('equals expected', () => {
                expect(subject()).toEqual([2, 1, null, 0, 5, null, 3, 4])
            })
        });

        describe('with none existent characters in from', () => {
            beforeEach(() => {
                from = 'Listen';
                to = 'Si-l-ent';
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

                expect(transitionStep.getCurrent()).toEqual('listen');
            });

            it('step 2', () => {
                from = 'listen';

                subject();

                expect(transitionStep.getCurrent()).toEqual('ilsten');
            })
        })
   })
});
