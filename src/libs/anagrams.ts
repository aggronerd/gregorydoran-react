const punctuationRegex = /^[.!? \-@]$/;

/**
 * Thrown if an invalid Anagram is created.
 */
export class InvalidAnagramError implements Error {
    name: string;
    message: string;

    constructor(to: string, from: string) {
        this.name = 'Invalid Anagram';
        this.message = `"${from}" and "${to}" are not an anagram`;
    }
}

/**
 * F.F.S. EMCA6 consider order in equality unlike other languages.
 *
 * @param set1
 * @param set2
 * @returns True if the two sets are equal (ignoring order)
 */
function setIsEqual(set1: Set<any>, set2: Set<any>): boolean {
    if(set1.size !== set2.size) {
        return false;
    }

    set1.forEach((i) => {
        if(!set2.has(i)) { return false }
    });

    return true;
}

/**
 * Representation of an anagram which provide utility methods on it.
 */
export default class Anagram {
    to: string;
    from: string;

    /**
     * Returns true if the string is an anagram.
     */
    private static isValidAnagram(string1: string, string2: string): boolean {
        const characterSets: Array<Set<string>> = new Array<Set<string>>(2);
        const inputStrings = [string1, string2];

        for(const i in inputStrings) {
            characterSets[i] = new Set<string>();
            inputStrings[i].split('')
                .filter((c: string) => !c.match(punctuationRegex))
                .map((c: string) => c.toLowerCase())
                .forEach((c: string) => characterSets[i].add(c))
        }

        return setIsEqual(characterSets[0], characterSets[1]);
    }

    /**
     * Anagrams are directional as methods provide transitional output from one string to the other.
     *
     * @param to
     * @param from
     * @throws InvalidAnagramError if strings do not form a valid anagram.
     */
    constructor(from: string, to: string) {
        if(!Anagram.isValidAnagram(to, from)) {
            throw new InvalidAnagramError(to, from);
        }

        this.to = to;
        this.from = from;
    }

    /**
     *
     */
    calculateTransitionSteps(): Array<string> {
        const transitionSteps = new Array<string>();
        const current = new Transition(this);
        while(true) {
            const done = current.next();
            transitionSteps.push(current.getCurrent());
            if(done) {
                return transitionSteps;
            }
        }
    }
}

interface TransitionPhase {
    performAction(transition: Transition): boolean;
}

class PhaseToLower implements TransitionPhase {
    performAction(transition: Anagram): boolean {
        while(anagram.getSortIndex() < this.currentChars.length) {
            const char = this.currentChars[this.sortIndex];
            if(char.toLowerCase() !== char) {
                this.currentChars[this.sortIndex] = char.toLowerCase();
                return false;
            } else {
                this.sortIndex++;
            }
        }
        return true;
    }
}

const sortedTransitionPhases = [
    TransitionPhase.toLowerCase,
    TransitionPhase.sortingCharacters,
    TransitionPhase.missingCharacterInsertion,
    TransitionPhase.matchCase,
    TransitionPhase.done];

/**
 * I wanted it such that the transitions from one string to another can be called iteratively. So the state of the
 * transition is stored in this class. It effectively performs a bubble sort alongside other steps which does final
 * things like match the case and insert characters that are missing from the final string. These are divided into
 * the different "phases" of the transition.
 */
export class Transition {
    // We sort by the values of this array. The index of which is the index in string to move from.
    readonly currentIndexToOrder: Array<number|null>;

    readonly currentChars: Array<string>;

    private sortIndex: number;

    private phase: TransitionPhase;

    constructor(anagram: Anagram) {
        this.currentChars = anagram.from.split('');
        this.currentIndexToOrder = new Array<number|null>(anagram.from.length);
        this.sortIndex = 0;
        this.phase = 0;

        const toCharsClaimed = new Set<number>();

        for(let fromIndex = 0; fromIndex < anagram.from.length; fromIndex++) {
            const char = anagram.from.charAt(fromIndex);

            let found = false;

            for (let toIndex = 0; toIndex < anagram.to.length && !found; toIndex++) {
                const toChar = anagram.to.charAt(toIndex);
                if((toChar === char.toLowerCase() || toChar === char.toUpperCase()) && !toCharsClaimed.has(toIndex)) {
                    toCharsClaimed.add(toIndex);
                    this.currentIndexToOrder[fromIndex] = toIndex;
                    found = true;
                    break;
                }
            }

            if(!found) {
                this.currentIndexToOrder[fromIndex] = null;
            }
        }
    }

    getSortIndex(): number {
        return this.sortIndex;
    }

    incrementSortIndex() {
        this.sortIndex++;
    }

    getCurrent(): string {
        return this.currentChars.join('');
    }

    private removeCharacter(index: number) {
        this.currentChars.splice(index, 1);
        this.currentIndexToOrder.splice(index, 1);
    }

    private swapChars() {
        this.currentChars[this.sortIndex] = this.currentChars.splice(
            this.sortIndex + 1, 1, this.currentChars[this.sortIndex])[0];
        this.currentIndexToOrder[this.sortIndex] = this.currentIndexToOrder.splice(
            this.sortIndex + 1, 1, this.currentIndexToOrder[this.sortIndex])[0];
    }


    private sortCharacters(): boolean {
        let resetLow: boolean = this.sortIndex === 0;

        while(true) {
            const char = this.currentChars[this.sortIndex];
            if(char.toLowerCase() !== char) {
                this.currentChars[this.sortIndex] = char.toLowerCase();
                return false;
            } else if(this.currentIndexToOrder[this.sortIndex] === null) {
                // Character doesn't exist in to string, remove.
                this.removeCharacter(this.sortIndex);
                return false;
            } else if(this.currentIndexToOrder[this.sortIndex + 1] === null) {
                // Next character doesn't exist in the to string, remove.
                this.removeCharacter(this.sortIndex + 1);
                return false;
            } else if(this.currentIndexToOrder[this.sortIndex] > this.currentIndexToOrder[this.sortIndex + 1]) {
                // Characters are not in order, swap
                this.swapChars();
                return false;
            } else if(this.sortIndex === this.currentChars.length - 2) {
                if(resetLow) {
                    return true; // We reached the end
                }
                this.sortIndex = 0;
                resetLow = true;
            } else {
                this.sortIndex++;
            }
        }
    }

    /**
     * Performs the change
     *
     * @returns true when done
     */
    next(): boolean {
        for(const phase of sortedTransitionPhases) {
            if(this.phase === phase) {
                if(phase.performAction(this)) {
                    this.phase ++;
                    this.sortIndex = 0;
                } else {
                    return false;
                }
            }
        }
        return true;
    }
}
