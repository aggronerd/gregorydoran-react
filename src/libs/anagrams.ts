/**
 * Representation of an anagram which provide utility methods on it.
 */
export default class Anagram {
    targetString: string;
    initialString: string;

    /**
     * Anagrams are directional as methods provide transitional output from one string to the other.
     *
     * @param to
     * @param from
     * @throws InvalidAnagramError if strings do not form a valid anagram.
     */
    constructor(from: string, to: string) {
        this.targetString = to;
        this.initialString = from;
    }

    /**
     *
     */
    calculateTransitionSteps(): Array<string> {
        const transitionSteps = [this.initialString];
        const current = new Transition(this);
        while(true) {
            const done = current.next();
            if(done) {
                return transitionSteps;
            } else {
                transitionSteps.push(current.getCurrentString());
            }
        }
    }
}

/**
 * Iterates through all the characters and sets them to be lowercase
 *
 * @param transition
 * @return true when this stage is done.
 */
function stageLowerCase(transition: Transition): boolean {
    while(transition.getScanningIndex() < transition.getCurrentChars().length) {
        const char = transition.getCurrentChars()[transition.getScanningIndex()];
        if(char.toLowerCase() !== char) {
            transition.toLowerCase();
            return false;
        } else {
            transition.incrementScanningIndex();
        }
    }
    return true;
}


/**
 * Performs a bubble sort on the characters to match the order of the target string. Will also remove characters it
 * encounters which do not have a sorting value - this will occur if the original string contains a character which
 * is not in the target.
 *
 * @param transition
 * @returns true when this stage is done.
 */
function stageBubbleSort(transition: Transition): boolean {
    let scannedFromStart: boolean = transition.getScanningIndex() === 0;

    while(true) {
        const currentCharWeight = transition.currentIndexToOrder[transition.getScanningIndex()];
        const nextCharWeight = transition.currentIndexToOrder[transition.getScanningIndex() + 1];

        if(currentCharWeight === null) {
            // Character doesn't exist in to string, remove.
            transition.removeCharacter(transition.getScanningIndex());
            return false;
        } else if(nextCharWeight=== null) {
            // Next character doesn't exist in the to string, remove.
            transition.removeCharacter(transition.getScanningIndex() + 1);
            return false;
        } else if(currentCharWeight > nextCharWeight) {
            // Characters are not in order, swap
            transition.swapChars();
            return false;
        } else if(transition.getScanningIndex() >= transition.getCurrentChars().length - 2) {
            if(scannedFromStart) {
                return true; // We reached the end
            }
            transition.resetScanningIndex();
            scannedFromStart = true;
        } else {
            transition.incrementScanningIndex();
        }
    }
}

function stageMatchCase(transition: Transition): boolean {
    while(transition.getScanningIndex() < transition.getCurrentChars().length) {
        const currentChar = transition.getCurrentChars()[transition.getScanningIndex()];
        const targetChar = transition.targetString.charAt(transition.getScanningIndex());
        if(targetChar !== currentChar) {
            if(targetChar === currentChar.toLowerCase()) {
                transition.toLowerCase();
                transition.incrementScanningIndex();
                return false
            } else if(targetChar === currentChar.toUpperCase()) {
                transition.toUpperCase();
                transition.incrementScanningIndex();
                return false
            }
        }
        transition.incrementScanningIndex();
    }
    return true
}

function stageInsertMissingCharacters(transition: Transition): boolean {
    while(transition.getScanningIndex() < transition.targetString.length) {
        const currentChar = transition.getCurrentChars()[transition.getScanningIndex()];
        const targetChar = transition.targetString.charAt(transition.getScanningIndex());
        if((currentChar === undefined && targetChar !== undefined) ||
            targetChar.toUpperCase() !== currentChar.toUpperCase()) {

            transition.insertString(targetChar);
            transition.incrementScanningIndex();
            return false;
        }
        transition.incrementScanningIndex();
    }
    return true
}

const sortedTransitionPhases: Array<(transition :Transition) => boolean> = [
    stageLowerCase,
    stageBubbleSort,
    stageInsertMissingCharacters,
    stageMatchCase,
];

/**
 * I wanted it such that the transitions from one string to another can be called iteratively. So the state of the
 * transition is stored in this class. It effectively performs a bubble sort alongside other steps which does final
 * things like match the case and insert characters that are missing from the final string. These are divided into
 * the different "phases" of the transition.
 */
export class Transition {
    // We sort by the values of this array. The index of which is the index in string to move from.
    readonly currentIndexToOrder: Array<number|null>;

    private readonly currentChars: Array<string>;

    private scanningIndex: number;

    private phase: number;

    readonly targetString: string;

    constructor(anagram: Anagram) {
        this.targetString = anagram.targetString;
        this.currentChars = anagram.initialString.split('');
        this.currentIndexToOrder = new Array<number|null>(anagram.initialString.length);
        this.scanningIndex = 0;
        this.phase = 0;

        const toCharsClaimed = new Set<number>();

        for(let fromIndex = 0; fromIndex < anagram.initialString.length; fromIndex++) {
            const char = anagram.initialString.charAt(fromIndex);

            let found = false;

            for (let toIndex = 0; toIndex < anagram.targetString.length && !found; toIndex++) {
                const toChar = anagram.targetString.charAt(toIndex);
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

    getScanningIndex(): number {
        return this.scanningIndex;
    }

    getCurrentChars(): Array<string> {
        return this.currentChars;
    }

    incrementScanningIndex() {
        this.scanningIndex++;
    }

    insertString(stringToInsert: string) {
        const chars = stringToInsert.split('');
        this.currentChars.splice(this.scanningIndex, 0, ...chars);
    }

    /**
     * Resets the scanning
     */
    resetScanningIndex() {
        this.scanningIndex = 0;
    }

    /**
     *
     * @returns The current string value in the transition.
     */
    getCurrentString(): string {
        return this.currentChars.join('');
    }

    removeCharacter(index: number) {
        this.currentChars.splice(index, 1);
        this.currentIndexToOrder.splice(index, 1);
    }

    /**
     * Swaps the current character marked by the scanningIndex and the following character. Assumes that it is not at
     * the end of the character array.
     */
    swapChars() {
        this.currentChars[this.scanningIndex] = this.currentChars.splice(
            this.scanningIndex + 1, 1, this.currentChars[this.scanningIndex])[0];
        this.currentIndexToOrder[this.scanningIndex] = this.currentIndexToOrder.splice(
            this.scanningIndex + 1, 1, this.currentIndexToOrder[this.scanningIndex])[0];
    }

    toLowerCase() {
        const char = this.currentChars[this.getScanningIndex()];
        this.currentChars[this.getScanningIndex()] = char.toLowerCase();
    }

    toUpperCase() {
        const char = this.currentChars[this.getScanningIndex()];
        this.currentChars[this.getScanningIndex()] = char.toUpperCase();
    }

    /**
     * Performs the next step in the transition and updates the state within the Transition instance.
     *
     * @returns true when done and not changes have been made to the current string
     */
    next(): boolean {
        for(; this.phase < sortedTransitionPhases.length; this.phase++) {
            if(!sortedTransitionPhases[this.phase](this)) {
                return false;
            }
            this.resetScanningIndex();
        }
        return true;
    }
}
